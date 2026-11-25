import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { safeFetchRemoteImageBase64 } from '@/lib/server/api-guard';

interface CachedImageAsset {
  base64: string;
  mimeType: string;
  expiresAt: number;
}

const MAX_ASSET_CACHE = 64;
const REMOTE_CACHE_TTL_MS = 30 * 60 * 1000;

const publicAssetCache = new Map<string, CachedImageAsset>();
const remoteAssetCache = new Map<string, CachedImageAsset>();
const modelKeyCooldowns = new Map<string, number>();
const inFlightRequests = new Map<string, Promise<unknown>>();
let preferredKeyIndex = 0;

function trimMapCache<K, V>(map: Map<K, V>, maxEntries: number) {
  if (map.size <= maxEntries) return;
  const oldestKey = map.keys().next().value;
  if (oldestKey !== undefined) map.delete(oldestKey);
}

/**
 * Resolves a static asset under /public into base64, cached in server memory for 0ms repeat reads.
 */
export function resolveCachedPublicImageBase64(
  relUrl: string
): { base64: string; mimeType: string } | null {
  const cleanRel = relUrl.replace(/^\/+/, '');
  const hit = publicAssetCache.get(cleanRel);
  if (hit) {
    return { base64: hit.base64, mimeType: hit.mimeType };
  }

  try {
    const publicRoot = path.resolve(process.cwd(), 'public');
    const resolved = path.resolve(publicRoot, cleanRel);
    if (!resolved.startsWith(publicRoot + path.sep)) return null;
    if (!fs.existsSync(resolved)) return null;

    const buf = fs.readFileSync(resolved);
    const mimeType = resolved.endsWith('.png')
      ? 'image/png'
      : resolved.endsWith('.webp')
      ? 'image/webp'
      : 'image/jpeg';
    const entry: CachedImageAsset = {
      base64: buf.toString('base64'),
      mimeType,
      expiresAt: Number.MAX_SAFE_INTEGER,
    };
    publicAssetCache.set(cleanRel, entry);
    trimMapCache(publicAssetCache, MAX_ASSET_CACHE);
    return { base64: entry.base64, mimeType: entry.mimeType };
  } catch {
    return null;
  }
}

/**
 * SSRF-safe remote image fetch backed by a bounded in-memory LRU cache (30m TTL).
 */
export async function safeCachedFetchRemoteImageBase64(
  rawUrl: string
): Promise<{ base64: string; mimeType: string } | null> {
  const now = Date.now();
  const cached = remoteAssetCache.get(rawUrl);
  if (cached && cached.expiresAt > now) {
    return { base64: cached.base64, mimeType: cached.mimeType };
  }
  if (cached) {
    remoteAssetCache.delete(rawUrl);
  }

  const fetched = await safeFetchRemoteImageBase64(rawUrl);
  if (!fetched) return null;

  remoteAssetCache.set(rawUrl, {
    base64: fetched.base64,
    mimeType: fetched.mimeType,
    expiresAt: now + REMOTE_CACHE_TTL_MS,
  });
  trimMapCache(remoteAssetCache, MAX_ASSET_CACHE);
  return fetched;
}

/**
 * Deduplicates identical concurrent server requests so rapid double-taps share a single upstream call.
 */
export async function coalesceInFlight<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inFlightRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
  }
  const promise = fn().finally(() => {
    inFlightRequests.delete(key);
  });
  inFlightRequests.set(key, promise);
  return promise;
}

export function hashRequestSignature(parts: string[]): string {
  const h = crypto.createHash('sha256');
  for (const part of parts) {
    h.update(part);
    h.update('|');
  }
  return h.digest('hex').slice(0, 32);
}

/**
 * Compresses generated AI PNG/large images into crisp mozjpeg (~100-170KB vs ~2-4MB raw PNG)
 * to dramatically speed up mobile downloads while preserving nail bed & skin micro-detail.
 */
export async function optimizeGeneratedImageOutput(
  base64Data: string,
  mimeType: string
): Promise<string> {
  const fallback = `data:${mimeType || 'image/png'};base64,${base64Data}`;
  try {
    const inputBuf = Buffer.from(base64Data, 'base64');
    // Skip re-encoding if already small JPEG/WebP (< 240KB)
    if (
      inputBuf.byteLength < 240 * 1024 &&
      (mimeType === 'image/jpeg' || mimeType === 'image/webp')
    ) {
      return fallback;
    }

    const compressed = await sharp(inputBuf, { failOn: 'none' })
      .rotate()
      .resize({
        width: 1280,
        height: 1280,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 90,
        mozjpeg: true,
        chromaSubsampling: '4:4:4',
      })
      .toBuffer();

    return `data:image/jpeg;base64,${compressed.toString('base64')}`;
  } catch {
    return fallback;
  }
}

export interface VertexFailoverResult {
  ok: boolean;
  status: number;
  model: string;
  json?: any;
  error: string;
  publicError: string;
  isRateLimited: boolean;
}

export function sanitizePublicAiError(rawError: string, isRateLimited: boolean): string {
  if (isRateLimited) {
    return 'Our AI nail studio is momentarily busy. Please wait a few seconds and try again.';
  }
  const trimmed = (rawError || '').trim();
  const isInternal =
    !trimmed ||
    /https?:\/\/|vertex|googleapis|aiplatform|resource[_ ]?exhausted|publisher model|http \d{3}/i.test(
      trimmed
    );
  return isInternal
    ? 'Unable to complete manicure generation right now. Please try again.'
    : trimmed;
}

/**
 * Model-first cooldown-aware Vertex Express failover:
 * 1. Always tries the fastest model across healthy keys before stepping down to backup models.
 * 2. Skips recently failed (404/429) key+model pairs cleanly during their cooldown window.
 * 3. Performs one brief recovery pass across primary + fallback models when all pairs hit burst cooldowns.
 */
export async function executeVertexWithFailover({
  candidateKeys,
  candidateModels,
  body,
  bodyForModel,
  timeoutMs = 18000,
}: {
  candidateKeys: string[];
  candidateModels: string[];
  body?: Record<string, unknown>;
  bodyForModel?: (model: string) => Record<string, unknown>;
  timeoutMs?: number;
}): Promise<VertexFailoverResult> {
  if (candidateKeys.length === 0 || candidateModels.length === 0) {
    return {
      ok: false,
      status: 500,
      model: candidateModels[0] || '',
      error: 'Vertex AI credentials not configured',
      publicError: 'AI styling service is temporarily unavailable. Please try again later.',
      isRateLimited: false,
    };
  }

  const now = Date.now();
  const orderedKeyIndices: number[] = [];
  for (let offset = 0; offset < candidateKeys.length; offset++) {
    orderedKeyIndices.push((preferredKeyIndex + offset) % candidateKeys.length);
  }

  let lastError = 'Vertex AI request failed';
  let lastStatus = 502;
  let sawRateLimit = false;
  let attempts = 0;

  const tryPair = async (
    keyIdx: number,
    model: string
  ): Promise<{ hit: true; res: VertexFailoverResult } | { hit: false }> => {
    attempts += 1;
    const apiKey = candidateKeys[keyIdx];
    const cooldownKey = `${keyIdx}:${model}`;
    const payloadBody = bodyForModel ? bodyForModel(model) : body || {};

    try {
      const res = await fetch(
        `https://aiplatform.googleapis.com/v1/publishers/google/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadBody),
          signal: AbortSignal.timeout(timeoutMs),
        }
      );

      if (res.ok) {
        preferredKeyIndex = keyIdx;
        modelKeyCooldowns.delete(cooldownKey);
        const json = await res.json();
        return {
          hit: true,
          res: {
            ok: true,
            status: 200,
            model,
            json,
            error: '',
            publicError: '',
            isRateLimited: false,
          },
        };
      }

      const errJson = await res.json().catch(() => ({}));
      const msg = errJson?.error?.message || `HTTP ${res.status}`;
      lastError = msg;
      lastStatus = res.status;

      const is429 =
        res.status === 429 ||
        /resource[_ ]?exhausted|quota|rate limit|too many requests/i.test(msg);
      if (is429) {
        sawRateLimit = true;
        modelKeyCooldowns.set(cooldownKey, Date.now() + 60000);
      } else if (res.status === 404) {
        modelKeyCooldowns.set(cooldownKey, Date.now() + 15 * 60 * 1000);
      } else {
        modelKeyCooldowns.set(cooldownKey, Date.now() + 8000);
      }
      console.warn(
        `[Finglora Vertex] ${model} (key #${keyIdx + 1}) unavailable (${res.status}: ${msg})`
      );
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : 'Network timeout';
      lastStatus = 504;
      modelKeyCooldowns.set(cooldownKey, Date.now() + 15000);
    }

    return { hit: false };
  };

  // Pass 1: Model-first across non-cooled pairs
  for (const model of candidateModels) {
    for (const keyIdx of orderedKeyIndices) {
      const cooldownUntil = modelKeyCooldowns.get(`${keyIdx}:${model}`) || 0;
      if (cooldownUntil > now) continue;
      const attempt = await tryPair(keyIdx, model);
      if (attempt.hit) return attempt.res;
    }
  }

  // Pass 2: If cooldowns skipped everything or burst 429 hit all pairs, probe top models once
  if (attempts === 0 || sawRateLimit) {
    await new Promise((r) => setTimeout(r, attempts === 0 ? 800 : 1000));
    const retryKeyIdx =
      attempts === 0 ? orderedKeyIndices[0] : orderedKeyIndices[orderedKeyIndices.length - 1];
    const probeModels = Array.from(
      new Set([candidateModels[0], candidateModels[candidateModels.length - 1]].filter(Boolean))
    );
    for (const probeModel of probeModels) {
      const recoveryAttempt = await tryPair(retryKeyIdx, probeModel);
      if (recoveryAttempt.hit) return recoveryAttempt.res;
    }
  }

  return {
    ok: false,
    status: sawRateLimit ? 429 : lastStatus,
    model: candidateModels[0],
    error: lastError,
    publicError: sanitizePublicAiError(lastError, sawRateLimit),
    isRateLimited: sawRateLimit,
  };
}
