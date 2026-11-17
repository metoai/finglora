'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Link2,
  UploadCloud,
  Camera,
  FileCheck2,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Timer,
  Info,
} from 'lucide-react';
import { TechProfile } from '@/types/nail';
import { BorderBeam } from '@/components/magicui/border-beam';
import { ShimmerButton } from '@/components/magicui/shimmer-button';

export function TechWorkspaceView({
  techProfile,
  onLoadClientLink,
  onUploadWhatsAppPhoto,
}: {
  techProfile: TechProfile;
  onLoadClientLink: () => void;
  onUploadWhatsAppPhoto: (file: File) => void;
}) {
  const [passportInput, setPassportInput] = useState('FGL-8492');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const samplePassports = [
    { code: 'FGL-8492', label: 'Blush French & Daisy', shape: 'Almond' },
    { code: 'FGL-3021', label: 'Berry Aura & Gloss', shape: 'Coffin' },
    { code: 'FGL-5104', label: 'Amber Tortoise Shell', shape: 'Square' },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      onUploadWhatsAppPhoto(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      onUploadWhatsAppPhoto(file);
    }
  };

  const handleSamplePhotoTest = () => {
    // Generate an illustrative canvas image blob for immediate demonstration
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FAFAFA';
      ctx.fillRect(0, 0, 400, 500);
      ctx.fillStyle = '#E0246A';
      ctx.font = '24px serif';
      ctx.fillText('Client WhatsApp Reference', 40, 240);
      canvas.toBlob((blob) => {
        if (blob) {
          const testFile = new File([blob], 'client-whatsapp-sample.jpg', {
            type: 'image/jpeg',
          });
          setSelectedFileName('client-whatsapp-sample.jpg');
          onUploadWhatsAppPhoto(testFile);
        }
      }, 'image/jpeg');
    }
  };

  return (
    <div className="w-full max-w-[1300px] space-y-8 select-none">
      {/* Station Breadcrumb & Header */}
      <div className="border-b border-[#18181B]/[0.08] pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#FAFAFA] border border-[#18181B]/[0.08] text-[11px] font-mono text-[#61565A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E0246A]" />
            <span>Technician Station Workspace</span>
            <span className="text-[#8C8085]">•</span>
            <span className="text-[#18181B] font-semibold">{techProfile.studio}</span>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#61565A]">
            <span className="text-[#8C8085]">Chair:</span>
            <span className="px-2 py-0.5 rounded bg-white border border-[#18181B]/[0.08] text-[#18181B]">
              {techProfile.stationNumber ? `Station ${techProfile.stationNumber}` : 'Station 01'}
            </span>
          </div>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#18181B] tracking-tight">
          Decode Client Request
        </h1>
      </div>

      {/* Flora Editorial Mascot Advice Callout */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#18181B]/[0.08] flex items-start gap-3.5 shadow-sm">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#D4AF37]/50 shrink-0 mt-0.5">
          <Image
            src="/assets/finglora_mascot.jpg"
            alt="Flora Salon Concierge"
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
              Pro Calibration
            </span>
          </div>
          <p className="text-xs text-[#61565A] leading-relaxed">
            When clients share inspiration photos with studio lighting or phone camera filters,
            Finglora&apos;s formula matrix breaks down the natural nail apex, smile line curvature,
            and pigment opacity so you can execute the look with your standard salon gel line.
          </p>
        </div>
      </div>

      {/* Dual Ingestion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Open Client's Finglora Link */}
        <div className="relative overflow-hidden bg-white rounded-2xl p-6 sm:p-7 border border-[#18181B]/[0.08] shadow-sm flex flex-col justify-between space-y-6">
          <BorderBeam
            size={220}
            duration={12}
            borderWidth={1.5}
            colorFrom="#D4AF37"
            colorTo="#E0246A"
          />

          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-[#18181B]/[0.08] text-[#E0246A] flex items-center justify-center">
              <Link2 className="w-5 h-5" strokeWidth={1.5} />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#E0246A] font-semibold block">
                Direct Synchronized Session
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#18181B] mt-0.5">
                Open Client&apos;s Finglora Link
              </h2>
              <p className="text-xs text-[#61565A] mt-1.5 leading-relaxed">
                Client completed their design on Finglora. Enter their 4-digit Passport Code to
                instantly retrieve their 5-finger color recipes and finish requests.
              </p>
            </div>

            {/* Passport Code Input */}
            <div className="space-y-2 pt-1">
              <label className="block text-[11px] font-semibold text-[#18181B]">
                Design Passport Code
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#8C8085]">
                    #
                  </span>
                  <input
                    type="text"
                    value={passportInput}
                    onChange={(e) => setPassportInput(e.target.value.toUpperCase())}
                    placeholder="FGL-8492"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#18181B]/[0.1] text-xs font-mono font-medium text-[#18181B] uppercase focus:outline-none focus:border-[#E0246A] transition"
                  />
                </div>
              </div>
            </div>

            {/* Quick Sample Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-[#8C8085] block font-mono">
                Recent Client Passports:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {samplePassports.map((sample) => (
                  <button
                    key={sample.code}
                    type="button"
                    onClick={() => {
                      setPassportInput(sample.code);
                      onLoadClientLink();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#FAFAFA] hover:bg-[#F4F4F5] border border-[#18181B]/[0.08] text-[11px] font-mono text-[#61565A] hover:text-[#18181B] transition flex items-center gap-1.5"
                  >
                    <span className="text-[#E0246A] font-semibold">#{sample.code}</span>
                    <span>{sample.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <ShimmerButton
              onClick={onLoadClientLink}
              background="#E0246A"
              shimmerColor="#D4AF37"
              borderRadius="0.75rem"
              className="w-full py-3 text-xs sm:text-sm font-semibold shadow-sm"
            >
              <span className="flex items-center justify-center gap-2 text-white">
                <span>Load Step-by-Step Guide</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
              </span>
            </ShimmerButton>
          </div>
        </div>

        {/* Card 2: Decode Client's WhatsApp / Instagram Photo */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#18181B]/[0.08] shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-[#18181B]/[0.08] text-[#D4AF37] flex items-center justify-center">
              <Camera className="w-5 h-5 text-[#E0246A]" strokeWidth={1.5} />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#61565A] font-semibold block">
                Computer Vision Analysis
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#18181B] mt-0.5">
                Decode WhatsApp / IG Photo
              </h2>
              <p className="text-xs text-[#61565A] mt-1.5 leading-relaxed">
                Client texted a photo from social media? Drop the image here to extract the nail bed
                ratio, base undertones, and layered application sequence.
              </p>
            </div>

            {/* Drag & Drop File Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-[#E0246A] bg-[#E0246A]/[0.04]'
                  : 'border-[#18181B]/[0.15] bg-[#FAFAFA] hover:bg-[#F4F4F5]'
              }`}
            >
              <UploadCloud className="w-6 h-6 text-[#E0246A]" strokeWidth={1.5} />
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[#18181B] block">
                  {selectedFileName ? selectedFileName : 'Drop client screenshot here'}
                </span>
                <span className="text-[11px] text-[#8C8085] block">
                  PNG, JPG, or HEIC from messaging apps
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Quick Demo Action */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-[#8C8085] font-mono">Need a test image?</span>
              <button
                type="button"
                onClick={handleSamplePhotoTest}
                className="text-[11px] font-mono font-medium text-[#E0246A] hover:underline"
              >
                Decode Sample Photo →
              </button>
            </div>

            {/* Vision Extraction Criteria Spec */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#18181B]/[0.08]">
              <div className="flex items-center gap-1.5 text-[11px] text-[#61565A]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={1.5} />
                <span>Nail bed ratio analysis</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#61565A]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={1.5} />
                <span>Apex curve modeling</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#61565A]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={1.5} />
                <span>Pigment swatch detection</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#61565A]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={1.5} />
                <span>Topcoat texture matching</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 rounded-xl bg-[#FAFAFA] hover:bg-[#F4F4F5] border border-[#18181B]/[0.12] text-xs sm:text-sm font-semibold text-[#18181B] transition flex items-center justify-center gap-2 active:translate-y-px"
            >
              <UploadCloud className="w-4 h-4 text-[#E0246A]" strokeWidth={1.5} />
              <span>Select Photo from Device</span>
            </button>
          </div>
        </div>
      </div>

      {/* Station Technical Overview Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#18181B]/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] border border-[#18181B]/[0.08] flex items-center justify-center text-[#E0246A]">
            <Layers className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <span className="text-[10px] text-[#8C8085] uppercase font-mono block">Gel System</span>
            <span className="font-semibold text-[#18181B]">{techProfile.gelSystem}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] border border-[#18181B]/[0.08] flex items-center justify-center text-[#E0246A]">
            <Timer className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <span className="text-[10px] text-[#8C8085] uppercase font-mono block">Cure Matrix</span>
            <span className="font-semibold text-[#18181B]">30s LED Base • 60s Seal</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] border border-[#18181B]/[0.08] flex items-center justify-center text-[#E0246A]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
          </div>
          <div>
            <span className="text-[10px] text-[#8C8085] uppercase font-mono block">Station Readiness</span>
            <span className="font-semibold text-[#18181B]">Lamp Dual Spectrum Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
