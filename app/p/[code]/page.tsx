import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { BrandLogo } from '@/components/common/BrandLogo';

export default async function SharedPassportPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const cleanCode = decodeURIComponent(code || '').trim().toUpperCase();

  let matchedSet: {
    id: string;
    title: string;
    category: string;
    photo_url: string | null;
    nails_json: Record<string, any> | null;
  } | null = null;

  if (cleanCode) {
    try {
      const supabase = await getSupabaseServerClient();
      const { data } = await supabase
        .from('nail_sets')
        .select('id, title, category, photo_url, nails_json')
        .ilike('passport_code', cleanCode)
        .limit(1)
        .maybeSingle();

      if (data) {
        matchedSet = data as any;
      }
    } catch {
      // fallback cleanly
    }
  }

  const nails = matchedSet?.nails_json || null;
  const refNail = nails?.middle || nails?.index || nails?.thumb;
  const shape = refNail?.shape || 'almond';
  const length = refNail?.length || 'medium';
  const finish = refNail?.finish || 'glossy';

  const colors = nails
    ? Array.from(
        new Set(
          Object.values(nails)
            .flatMap((n: any) => [n?.baseColor, n?.accentColor])
            .filter((c): c is string => typeof c === 'string' && /^#[0-9A-Fa-f]{3,8}$/.test(c))
        )
      ).slice(0, 4)
    : [];

  const description =
    refNail?.clientNote ||
    `${shape} shape, ${length} length with a ${finish} finish.`;

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
        {matchedSet ? (
          <>
            {matchedSet.photo_url && (
              <div className="aspect-[3/4] w-full bg-stone-100 overflow-hidden">
                <img
                  src={matchedSet.photo_url}
                  alt={matchedSet.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-5 sm:p-6 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-stone-400">
                  Nail Tech Spec
                </span>
                <h1 className="font-serif text-xl sm:text-2xl font-medium text-stone-900">
                  {matchedSet.title}
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
                {description}
              </p>
            </div>
          </>
        ) : (
          <div className="p-8 text-center space-y-3">
            <h1 className="font-serif text-xl font-medium text-stone-900">
              Try this manicure look in Finglora
            </h1>
            <p className="text-xs text-stone-500">
              Preview nail shapes, shades, and finishes directly on your hand.
            </p>
            <div className="pt-1">
              <Link
                href="/tryon"
                className="h-10 px-5 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition"
              >
                <span>Open Virtual Try-On</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full max-w-md mx-auto text-center text-[11px] text-stone-400 py-2">
        finglora.app
      </footer>
    </div>
  );
}
