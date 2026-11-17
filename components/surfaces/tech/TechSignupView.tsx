'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Store,
  User,
  Armchair,
  Paintbrush,
  Layers,
  Award,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Camera,
} from 'lucide-react';
import { TechProfile } from '@/types/nail';

export function TechSignupView({
  techProfile,
  setTechProfile,
  onSubmit,
}: {
  techProfile: TechProfile;
  setTechProfile: React.Dispatch<React.SetStateAction<TechProfile>>;
  onSubmit: () => void;
}) {
  const specialtyOptions = [
    'Structured Russian Manicure',
    'Japanese Soft Gel',
    'Aprés Gel-X Extensions',
    'Micro French & Chrome Swirl',
    '3D Sculpted Gel Art',
    'Airbrush Aura Gradient',
    'Velvet Cat Eye & Blooming Gel',
    'Natural Nail Strengthening',
  ];

  const gelSystemOptions = [
    'Japanese Soft Gel (Kokoist / Vetro / Leafgel)',
    'Structured Rubber Base (Luminary / Akzentz / Bio Sculpture)',
    'Aprés Gel-X Soft Gel Extension System',
    'Hard Gel Builder (Light Elegance / IBD)',
    'Hybrid Polygel & Acrylic System',
  ];

  const chairCountPresets = [
    { label: 'Solo Atelier', count: 1 },
    { label: 'Boutique Studio (2-4 Chairs)', count: 3 },
    { label: 'Full Salon Team (5+ Chairs)', count: 6 },
  ];

  const toggleSpecialty = (item: string) => {
    const current = techProfile.specialty ? techProfile.specialty.split(', ') : [];
    let updated: string[];
    if (current.includes(item)) {
      updated = current.filter((s) => s !== item);
    } else {
      updated = [...current, item];
    }
    setTechProfile((p) => ({
      ...p,
      specialty: updated.join(', ') || 'Structured Gel & Custom Nail Art',
    }));
  };

  const currentSpecialties = techProfile.specialty
    ? techProfile.specialty.split(', ')
    : [];

  return (
    <div className="w-full max-w-2xl space-y-8 select-none">
      {/* Header */}
      <div className="border-b border-[#18181B]/[0.08] pb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#FAFAFA] border border-[#18181B]/[0.08] text-[11px] font-mono text-[#61565A] mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E0246A]" />
          <span>Finglora Pro Atelier</span>
          <span className="text-[#8C8085]">•</span>
          <span>Technician Registration</span>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#18181B] tracking-tight">
          Technician & Studio Profile
        </h1>
      </div>

      {/* Flora Editorial Mascot Onboarding Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#18181B]/[0.08] flex items-start gap-3.5 shadow-sm">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#D4AF37]/50 shrink-0 mt-0.5">
          <Image
            src="/assets/finglora_mascot.jpg"
            alt="Flora Mascot"
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm font-semibold text-[#18181B]">
              Flora • Salon Atelier Concierge
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#E0246A] bg-[#E0246A]/10 px-2 py-0.5 rounded">
              Welcome
            </span>
          </div>
          <p className="text-xs text-[#61565A] leading-relaxed">
            Welcome to the Finglora technician station. Setting your studio name and gel system
            ensures all formula steps recommend the correct viscosities, grit sizes, and LED cure
            intervals for your clients.
          </p>
        </div>
      </div>

      {/* Main Registration Form Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#18181B]/[0.08] shadow-sm space-y-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-6"
        >
          {/* Row 1: Technician Name & Studio Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#18181B]">
                <User className="w-3.5 h-3.5 text-[#E0246A]" strokeWidth={1.5} />
                <span>Technician Full Name</span>
              </label>
              <input
                type="text"
                required
                value={techProfile.name}
                onChange={(e) => setTechProfile((p) => ({ ...p, name: e.target.value }))}
                placeholder="Camille Laurent"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#18181B]/[0.1] text-xs sm:text-sm text-[#18181B] placeholder-[#8C8085] focus:outline-none focus:border-[#E0246A] transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#18181B]">
                <Store className="w-3.5 h-3.5 text-[#E0246A]" strokeWidth={1.5} />
                <span>Studio or Atelier Name</span>
              </label>
              <input
                type="text"
                required
                value={techProfile.studio}
                onChange={(e) => setTechProfile((p) => ({ ...p, studio: e.target.value }))}
                placeholder="Atelier Rose Nail Studio"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#18181B]/[0.1] text-xs sm:text-sm text-[#18181B] placeholder-[#8C8085] focus:outline-none focus:border-[#E0246A] transition"
              />
            </div>
          </div>

          {/* Row 2: Chair Count & Station Number */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs font-semibold text-[#18181B]">
              <span className="flex items-center gap-1.5">
                <Armchair className="w-3.5 h-3.5 text-[#E0246A]" strokeWidth={1.5} />
                <span>Salon Chair Capacity</span>
              </span>
              <span className="text-[11px] font-mono text-[#8C8085]">
                Active: {techProfile.chairCount || 1} chair(s)
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {chairCountPresets.map((preset) => {
                const isSelected = (techProfile.chairCount || 1) === preset.count;
                return (
                  <button
                    key={preset.count}
                    type="button"
                    onClick={() =>
                      setTechProfile((p) => ({
                        ...p,
                        chairCount: preset.count,
                      }))
                    }
                    className={`p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-[#FAFAFA] border-[#E0246A] ring-1 ring-[#E0246A]'
                        : 'bg-white border-[#18181B]/[0.08] hover:bg-[#FAFAFA]/50'
                    }`}
                  >
                    <span className="block text-xs font-semibold text-[#18181B]">
                      {preset.label}
                    </span>
                    <span className="block text-[10px] text-[#61565A] font-mono mt-0.5">
                      {preset.count} Chair{preset.count > 1 ? 's' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Primary Gel System */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-[#18181B]">
              <Layers className="w-3.5 h-3.5 text-[#E0246A]" strokeWidth={1.5} />
              <span>Primary Gel System Used at Station</span>
            </label>
            <select
              value={techProfile.gelSystem}
              onChange={(e) => setTechProfile((p) => ({ ...p, gelSystem: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#18181B]/[0.1] text-xs sm:text-sm text-[#18181B] focus:outline-none focus:border-[#E0246A] transition"
            >
              {gelSystemOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Row 4: Specialty Styles Multi-Select */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs font-semibold text-[#18181B]">
              <span className="flex items-center gap-1.5">
                <Paintbrush className="w-3.5 h-3.5 text-[#E0246A]" strokeWidth={1.5} />
                <span>Specialty Nail Techniques</span>
              </span>
              <span className="text-[11px] font-mono text-[#8C8085]">
                Tap to toggle techniques
              </span>
            </label>

            <div className="flex flex-wrap gap-2">
              {specialtyOptions.map((opt) => {
                const isSelected = currentSpecialties.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleSpecialty(opt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition inline-flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-[#E0246A] text-white border-[#E0246A] shadow-sm'
                        : 'bg-[#FAFAFA] text-[#61565A] border-[#18181B]/[0.08] hover:bg-[#F4F4F5] hover:text-[#18181B]'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />}
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 5: Station Number & Social Handle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#18181B]">
                <Award className="w-3.5 h-3.5 text-[#E0246A]" strokeWidth={1.5} />
                <span>Station Desk / Chair Identifier</span>
              </label>
              <input
                type="text"
                value={techProfile.stationNumber || '01'}
                onChange={(e) => setTechProfile((p) => ({ ...p, stationNumber: e.target.value }))}
                placeholder="Station 01"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#18181B]/[0.1] text-xs sm:text-sm text-[#18181B] focus:outline-none focus:border-[#E0246A] transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#18181B]">
                <Camera className="w-3.5 h-3.5 text-[#E0246A]" strokeWidth={1.5} />
                <span>Instagram Portfolio Handle</span>
              </label>
              <input
                type="text"
                value={techProfile.instagram || '@atelier.nails'}
                onChange={(e) => setTechProfile((p) => ({ ...p, instagram: e.target.value }))}
                placeholder="@atelier.nails"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#18181B]/[0.1] text-xs sm:text-sm text-[#18181B] focus:outline-none focus:border-[#E0246A] transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-[#18181B]/[0.08]">
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#E0246A] hover:bg-[#66152A] text-white text-xs sm:text-sm font-semibold transition shadow-sm flex items-center justify-center gap-2 active:translate-y-px"
            >
              <span>Save Studio Profile & Open Workspace</span>
              <ArrowRight className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
            </button>
            <p className="text-[11px] text-[#8C8085] text-center mt-2.5">
              Your profile is stored locally and applied across all table tray sheets and formula
              curing times.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
