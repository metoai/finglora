import { downscaleImageForVision } from '@/lib/services/storage';

const MAX_PREPARED_CACHE = 20;
const MAX_RESULT_CACHE = 16;

// ~130KB binary JPEG (~175k chars base64) needs zero client re-compression
const COMPACT_DATA_URL_THRESHOLD = 180_000;

const preparedDataUrlCache = new Map<string, string>();
const tryOnResultCache = new Map<string, { imageUrl: string; publicUrl?: string }>();

function trimLRU<K, V>(map: Map<K, V>, max: number) {
  if (map.size <= max) return;
  const oldest = map.keys().next().value;
  if (oldest !== undefined) map.delete(oldest);
}

function sourceFingerprint(src?: string | null): string {
  if (!src) return 'none';
  if (src.startsWith('https://') || src.startsWith('/')) return src;
  return `${src.slice(0, 48)}:${src.length}:${src.slice(-32)}`;
}

/**
 * Prepares an image source for /api/generate-nail-art with minimal latency:
 * - Public `/assets/...` or `https://` URLs are passed by URL so the server fetches & caches them directly.
 * - Local `blob:` or oversized `data:image/` payloads are downscaled once to compact JPEG and memoized.
 */
export async function prepareVisionImagePayload(
  source?: string | null,
  maxDim = 896,
  quality = 0.82
): Promise<{ imageBase64?: string; imageUrl?: string }> {
  if (!source) return {};

  if (source.startsWith('/') || source.startsWith('https://')) {
    return { imageUrl: source };
  }

  if (source.startsWith('data:image/jpeg') && source.length <= COMPACT_DATA_URL_THRESHOLD) {
    return { imageBase64: source };
  }

  const memoKey = `${sourceFingerprint(source)}@${maxDim}`;
  const memoized = preparedDataUrlCache.get(memoKey);
  if (memoized) {
    return { imageBase64: memoized };
  }

  const compressed = await downscaleImageForVision(source, maxDim, quality);
  const finalBase64 = compressed || (source.startsWith('data:image/') ? source : '');
  if (!finalBase64) return {};

  preparedDataUrlCache.set(memoKey, finalBase64);
  trimLRU(preparedDataUrlCache, MAX_PREPARED_CACHE);
  return { imageBase64: finalBase64 };
}

export function buildTryOnCacheKey({
  handSource,
  inspoSource,
  nailShape,
  prompt,
}: {
  handSource: string;
  inspoSource?: string | null;
  nailShape: string;
  prompt: string;
}): string {
  return `${sourceFingerprint(handSource)}|${sourceFingerprint(inspoSource)}|${nailShape}|${prompt.trim()}`;
}

export function getCachedTryOnResult(
  cacheKey: string
): { imageUrl: string; publicUrl?: string } | null {
  const hit = tryOnResultCache.get(cacheKey);
  if (!hit) return null;
  // Refresh LRU recency
  tryOnResultCache.delete(cacheKey);
  tryOnResultCache.set(cacheKey, hit);
  return hit;
}

export function setCachedTryOnResult(
  cacheKey: string,
  imageUrl: string,
  publicUrl?: string
): void {
  tryOnResultCache.set(cacheKey, { imageUrl, publicUrl });
  trimLRU(tryOnResultCache, MAX_RESULT_CACHE);
}

export function updateCachedTryOnPublicUrl(cacheKey: string, publicUrl: string): void {
  const existing = tryOnResultCache.get(cacheKey);
  if (existing) {
    existing.publicUrl = publicUrl;
  }
}
