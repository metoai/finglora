'use client';

import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center text-center px-4 font-sans">
      <div className="space-y-4 max-w-sm">
        <p className="font-serif text-6xl text-[#E0246A] font-normal">404</p>
        <h1 className="font-serif text-2xl font-normal text-stone-900 tracking-tight">
          Page not found
        </h1>
        <p className="text-sm text-stone-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-full bg-[#E0246A] text-white text-sm font-medium hover:bg-[#BE185D] transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Finglora
        </a>
      </div>
    </div>
  );
}
