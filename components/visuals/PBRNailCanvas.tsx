'use client';

import React, { useEffect, useRef, useState } from 'react';
import { NailDesign } from '@/types/nail';
import { NailPBRScene } from '@/lib/pbr/NailPBREngine';

export function PBRNailCanvas({
  nail,
  width = 64,
  height = 96,
  interactive = false,
  className = '',
}: {
  nail: NailDesign;
  width?: number;
  height?: number;
  interactive?: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<NailPBRScene | null>(null);
  const [hasWebGl, setHasWebGl] = useState(true);

  // Initialize WebGL Three.js PBR Scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const scene = new NailPBRScene(canvas, width, height);
      sceneRef.current = scene;
      scene.updateNail(nail);

      return () => {
        scene.dispose();
        sceneRef.current = null;
      };
    } catch (err) {
      console.warn('[PBRNailCanvas] WebGL initialization fallback:', err);
      setHasWebGl(false);
    }
  }, [width, height]);

  // Update nail properties when props change
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateNail(nail);
    }
  }, [nail]);

  // Interactive 3D tilt tracking (mouse or touch)
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive || !sceneRef.current?.nailMesh) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xNorm = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
    const yNorm = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    sceneRef.current.nailMesh.rotation.y = xNorm * 0.45;
    sceneRef.current.nailMesh.rotation.x = 0.15 - yNorm * 0.35;
    sceneRef.current.render();
  };

  const handlePointerLeave = () => {
    if (!interactive || !sceneRef.current?.nailMesh) return;
    sceneRef.current.nailMesh.rotation.y = 0;
    sceneRef.current.nailMesh.rotation.x = 0.15;
    sceneRef.current.render();
  };

  if (!hasWebGl) {
    return (
      <div
        style={{ width, height }}
        className="rounded-xl flex items-center justify-center bg-pink-50 text-[10px] text-pink-400"
      >
        <span>3D Ready</span>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: `${width}px`, height: `${height}px` }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`select-none touch-none ${interactive ? 'cursor-grab active:cursor-grabbing hover:scale-105 transition-transform duration-150' : ''} ${className}`}
    />
  );
}
