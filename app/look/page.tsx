import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';

const SUPABASE_TRYON_PREFIX =
  'https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/try-on-captures/';

function sanitizeImageUrl(rawCap?: string, rawImg?: string): string | null {
  if (rawCap && !rawCap.includes('..')) {
    return `${SUPABASE_TRYON_PREFIX}${rawCap.replace(/^\/+/, '')}`;
  }
  if (rawImg && rawImg.startsWith('https://')) {
    return rawImg;
  }
  return null;
}

export default async function SharedLookPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const pick = (key: string) => {
    const val = sp[key];
    return typeof val === 'string' ? val.trim() : '';
  };

  const title = pick('t') || 'Custom Manicure';
  const shape = pick('s') || 'almond';
  const length = pick('l') || 'medium';
  const finish = pick('f') || 'glossy';
  const colors = (pick('c') || '')
    .split(',')
    .map((c) => c.trim())
    .filter((c) => /^#[0-9A-Fa-f]{3,8}$/.test(c));
  const note =
    pick('n') ||
    `${shape} shape, ${length} length with a ${finish} top coat.`;
  const photoUrl = sanitizeImageUrl(pick('cap'), pick('img'));

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1F1A1C] flex flex-col justify-between p-4 sm:p-6">
      <header className="w-full max-w-md mx-auto flex items-center justify-between py-2">
        <Link href="/" className="inline-flex items-center">
          <BrandLogo size="sm" />
        </Link>
        <Link
          href="/tryon"
          className="h-9 px-3.5 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Try On</span>
        </Link>
      </header>

      <main className="w-full max-w-md mx-auto my-6 bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        {photoUrl ? (
          <div className="aspect-[3/4] w-full bg-stone-100 overflow-hidden">
            <img
              src={photoUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="py-12 px-6 bg-stone-50 text-center text-xs text-stone-400 border-b border-stone-100">
            Generated manicure preview
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-medium uppercase tracking-wider text-stone-400">
              Nail Tech Spec
            </span>
            <h1 className="font-serif text-xl sm:text-2xl font-medium text-stone-900">
              {title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-stone-200/80 text-stone-700 capitalize">
              Shape: <strong className="font-semibold text-stone-900">{shape}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-stone-200/80 text-stone-700 capitalize">
              Length: <strong className="font-semibold text-stone-900">{length}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-stone-200/80 text-stone-700 capitalize">
              Finish: <strong className="font-semibold text-stone-900">{finish}</strong>
            </span>
          </div>

          {colors.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {colors.map((hex) => (
                <div
                  key={hex}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-50 border border-stone-200/80 text-[11px] font-mono text-stone-700"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                    style={{ backgroundColor: hex }}
                  />
                  <span>{hex}</span>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-1 border-t border-stone-100">
            {note}
          </p>

          <Link
            href="/tryon"
            className="w-full h-11 rounded-2xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition active:scale-95"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Try This Look on Your Own Hand</span>
          </Link>
        </div>
      </main>

      <footer className="w-full max-w-md mx-auto flex items-center justify-center gap-3 text-[11px] text-stone-400 py-2">
        <Link href="/" className="hover:text-stone-700 transition">
          finglora.app
        </Link>
        <span>·</span>
        <Link href="/finder" className="hover:text-[#E0246A] transition">
          Nail Shape &amp; Tone Finder
        </Link>
      </footer>
    </div>
  );
}
