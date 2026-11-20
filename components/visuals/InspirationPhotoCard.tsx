'use client';

import React, { useState, useEffect } from 'react';
import { ExploreDesignSet } from '@/types/nail';
import { EditorialHandVisual } from './EditorialHandVisual';

export function InspirationPhotoCard({
  item,
  photoOverride,
  showPins = false,
  detectedCount = 5,
}: {
  item: ExploreDesignSet;
  photoOverride?: string;
  showPins?: boolean;
  detectedCount?: number;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const activeUrl = (photoOverride || item.photoUrl || '').trim() || '/assets/editorial_nail_hero.jpg';

  useEffect(() => {
    setImgFailed(false);
  }, [activeUrl]);

  const pinCoords = [
    { num: 1, label: 'Thumb', top: '62%', left: '24%' },
    { num: 2, label: 'Index', top: '34%', left: '38%' },
    { num: 3, label: 'Middle', top: '26%', left: '52%' },
    { num: 4, label: 'Ring', top: '32%', left: '66%' },
    { num: 5, label: 'Pinky', top: '46%', left: '78%' },
  ];

  return (
    <div
      className="relative w-full h-full overflow-hidden flex items-center justify-center"
      style={{ background: item.backdrop }}
    >
      {!imgFailed ? (
        <img
          src={activeUrl || '/assets/editorial_nail_hero.jpg'}
          alt={item.title}
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-end justify-center pt-4">
          <EditorialHandVisual nails={item.nails} skinTone={item.skinTone} width={220} height={225} />
        </div>
      )}

      {showPins && (
        <div className="absolute inset-0 pointer-events-none">
          {pinCoords.map((p, idx) => {
            const active = detectedCount > idx;
            return (
              <div
                key={p.num}
                style={{ top: p.top, left: p.left }}
                className={`-translate-x-1/2 -translate-y-1/2 absolute flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md border border-white transition-all ${
                  active ? 'bg-[#E0246A] text-white scale-100' : 'bg-stone-500/80 text-white/80 scale-90'
                }`}
              >
                <span>{p.num}</span>
                <span className="hidden sm:inline">{p.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
