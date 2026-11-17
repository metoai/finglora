'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
} from 'lucide-react';
import { ExploreDesignSet, Finger, NailDesign, NailShape, NailLength } from '@/types/nail';
import { FINGER_KEYS, FINGER_LABELS } from '@/constants/nail-data';
import { BrandLogo } from '@/components/common/BrandLogo';
import { NailCanvasPreview } from '@/components/visuals/NailCanvasPreview';
import { ShimmerButton } from '@/components/magicui/shimmer-button';

const NAIL_SHAPES: { id: NailShape; name: string }[] = [
  { id: 'almond', name: 'Almond' },
  { id: 'oval', name: 'Oval' },
  { id: 'coffin', name: 'Coffin' },
  { id: 'square', name: 'Square' },
  { id: 'stiletto', name: 'Stiletto' },
];

const NAIL_LENGTHS: { id: NailLength; name: string }[] = [
  { id: 'short', name: 'Short' },
  { id: 'medium', name: 'Medium' },
  { id: 'long', name: 'Long' },
];

export function OnboardingSurface({
  userName,
  preferredShape,
  setPreferredShape,
  exploreDesigns,
  mobilePreview,
  onSelectInspoSet,
  onSkipToAtelier,
  onContinueToStudio,
  onBrandClick,
}: {
  userName: string;
  preferredShape: NailShape;
  setPreferredShape?: (shape: NailShape) => void;
  exploreDesigns: ExploreDesignSet[];
  mobilePreview: boolean;
  onSelectInspoSet: (setId: string, customUrl?: string) => void;
  onSkipToAtelier: () => void;
  onContinueToStudio?: () => void;
  onBrandClick?: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedSetId, setSelectedSetId] = useState<string>(exploreDesigns[0]?.id || 'set-rose-water');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [selectedShape, setSelectedShape] = useState<NailShape>(preferredShape || 'almond');
  const [selectedLength, setSelectedLength] = useState<NailLength>('medium');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real Hand Try-On State
  const [tryOnTab, setTryOnTab] = useState<'photo' | 'camera'>('photo');
  const [uploadedHandPhoto, setUploadedHandPhoto] = useState<string | null>(null);
  const [isBareHand, setIsBareHand] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const handPhotoInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const activeSet =
    exploreDesigns.find((d) => d.id === selectedSetId) || exploreDesigns[0];

  // Derived 5 nails based on selected shape & length
  const previewNails = React.useMemo(() => {
    const copy = JSON.parse(JSON.stringify(activeSet.nails)) as Record<Finger, NailDesign>;
    FINGER_KEYS.forEach((fk) => {
      copy[fk].shape = selectedShape;
      copy[fk].length = selectedLength;
    });
    return copy;
  }, [activeSet, selectedShape, selectedLength]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    stopCamera();
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setTryOnTab('photo');
      return;
    }
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch {
      setTryOnTab('photo');
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handlePickSet = (id: string) => {
    setSelectedSetId(id);
    setUploadedPhotoUrl(null);
    onSelectInspoSet(id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedPhotoUrl(url);
      setSelectedSetId(exploreDesigns[0]?.id || 'set-rose-water');
      onSelectInspoSet(exploreDesigns[0]?.id || 'set-rose-water', url);
      setStep(2);
    }
  };

  const handleHandPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedHandPhoto(url);
      setIsBareHand(false);
    }
  };

  const handleShapeSelect = (shape: NailShape) => {
    setSelectedShape(shape);
    setPreferredShape?.(shape);
  };

  const handleFinish = () => {
    stopCamera();
    if (onContinueToStudio) {
      onContinueToStudio();
    } else {
      onSkipToAtelier();
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f8] text-stone-900 flex flex-col justify-between py-5 sm:py-7 px-4 sm:px-8 select-none relative overflow-x-hidden">
      {/* Subtle background ambient blur */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#E0246A]/5 blur-3xl pointer-events-none -top-20 -right-20" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-[#FDF2F8] blur-3xl pointer-events-none -bottom-20 -left-20" />

      {/* Main Responsive Canvas */}
      <div className="w-full max-w-md md:max-w-4xl lg:max-w-5xl mx-auto flex-1 flex flex-col justify-between relative z-10 space-y-6">
        {/* Minimalist Header */}
        <div className="flex flex-col space-y-3 pb-3 border-b border-stone-200/60">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBrandClick || handleFinish}
              className="text-left focus:outline-none cursor-pointer flex items-center gap-2"
            >
              <BrandLogo size="sm" />
            </button>

            <button
              type="button"
              onClick={handleFinish}
              className="font-sans text-xs font-medium text-stone-500 hover:text-stone-900 transition cursor-pointer flex items-center gap-1"
            >
              <span>Skip</span>
              <ArrowRight className="w-3 h-3 text-stone-400" />
            </button>
          </div>

          {/* Minimal 4-Dash Segmented Progress Line */}
          <div className="grid grid-cols-4 gap-2 w-full pt-0.5">
            <div className={`h-[2.5px] rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-[#E0246A]' : 'bg-stone-200'}`} />
            <div className={`h-[2.5px] rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-[#E0246A]' : 'bg-stone-200'}`} />
            <div className={`h-[2.5px] rounded-full transition-colors duration-300 ${step >= 3 ? 'bg-[#E0246A]' : 'bg-stone-200'}`} />
            <div className={`h-[2.5px] rounded-full transition-colors duration-300 ${step >= 4 ? 'bg-[#E0246A]' : 'bg-stone-200'}`} />
          </div>
        </div>

        {/* =========================================================================
            SCREEN 1: CHOOSE YOUR STYLE
            ========================================================================= */}
        {step === 1 && (
          <div className="flex-1 flex flex-col justify-between py-2 sm:py-4 space-y-6 animate-in fade-in duration-150">
            <div className="text-center max-w-lg mx-auto">
              <h1 className="font-serif text-3xl sm:text-4xl font-medium text-stone-900 tracking-tight">
                Choose your style
              </h1>
              <p className="font-sans text-xs sm:text-sm text-stone-500 mt-1">
                Pick a design or upload an inspiration photo.
              </p>
            </div>

            {/* Split Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
              {/* Upload Dropzone (5 cols) */}
              <div className="md:col-span-5 flex flex-col">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 min-h-[190px] md:min-h-[280px] p-6 rounded-3xl bg-white border border-dashed border-[#FCE7F3] hover:border-[#E0246A] hover:bg-[#FDF2F8]/40 transition-all shadow-2xs hover:shadow-xs group cursor-pointer flex flex-col items-center justify-center text-center space-y-2.5"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#FDF2F8] text-[#E0246A] flex items-center justify-center group-hover:bg-[#E0246A] group-hover:text-white transition-colors">
                    <Upload className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-medium text-stone-900">
                      Upload reference
                    </h3>
                    <p className="font-sans text-xs text-stone-400 mt-0.5">
                      Pinterest, Instagram, or camera roll
                    </p>
                  </div>
                  <span className="font-sans text-xs font-semibold text-[#E0246A] px-3.5 py-1 rounded-full bg-[#FDF2F8] border border-[#FCE7F3] group-hover:bg-[#E0246A] group-hover:text-white group-hover:border-[#E0246A] transition-colors">
                    Browse Photo
                  </span>
                </div>
              </div>

              {/* Curated Looks Grid (7 cols) */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                <div className="grid grid-cols-2 gap-3 flex-1">
                  {exploreDesigns.slice(0, 4).map((d) => {
                    const isSelected = selectedSetId === d.id && !uploadedPhotoUrl;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handlePickSet(d.id)}
                        className={`group relative rounded-2xl overflow-hidden border transition-all text-left cursor-pointer active:scale-[0.98] h-32 sm:h-36 ${
                          isSelected
                            ? 'border-[#E0246A] ring-2 ring-[#E0246A]/20 shadow-sm'
                            : 'border-stone-200/80 hover:border-[#FCE7F3]'
                        }`}
                      >
                        <img
                          src={d.photoUrl}
                          alt={d.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-2 left-2.5 right-2.5">
                          <span className="text-white text-xs sm:text-sm font-serif font-medium leading-tight block truncate">
                            {d.title}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#E0246A] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      handlePickSet(exploreDesigns[0]?.id || 'set-rose-water');
                      setStep(2);
                    }}
                    className="font-sans text-xs text-stone-500 hover:text-[#E0246A] underline underline-offset-4 transition cursor-pointer"
                  >
                    Start with signature design →
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-center pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-8 py-3 rounded-full bg-[#E0246A] hover:bg-[#BE185D] text-white font-sans text-sm font-medium transition-all shadow-sm hover:shadow active:scale-98 flex items-center gap-2 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 2: SELECT NAIL SHAPE & LENGTH
            ========================================================================= */}
        {step === 2 && (
          <div className="flex-1 flex flex-col justify-between py-2 sm:py-4 space-y-6 animate-in fade-in duration-150">
            <div className="text-center max-w-lg mx-auto">
              <h1 className="font-serif text-3xl sm:text-4xl font-medium text-stone-900 tracking-tight">
                Select nail shape
              </h1>
              <p className="font-sans text-xs sm:text-sm text-stone-500 mt-1">
                Choose your preferred shape and length.
              </p>
            </div>

            {/* 5 Shape Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {NAIL_SHAPES.map((shape) => {
                const isSelected = selectedShape === shape.id;
                const sampleNail: NailDesign = {
                  ...previewNails.middle,
                  shape: shape.id,
                  length: selectedLength,
                };
                return (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() => handleShapeSelect(shape.id)}
                    className={`p-3.5 rounded-2xl border transition-all text-center flex flex-col items-center justify-between space-y-2 cursor-pointer active:scale-[0.98] ${
                      isSelected
                        ? 'bg-[#FDF2F8] border-[#E0246A] ring-2 ring-[#E0246A]/20 shadow-sm'
                        : 'bg-white/80 hover:bg-white border-stone-200/80 hover:border-[#FCE7F3]'
                    }`}
                  >
                    <div className="relative py-1">
                      <NailCanvasPreview nail={sampleNail} width={40} height={60} showCuticle={false} />
                      {isSelected && (
                        <div className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#E0246A] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                        </div>
                      )}
                    </div>
                    <span className="font-serif text-sm font-semibold text-stone-900">
                      {shape.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Length Selector */}
            <div className="flex items-center justify-center gap-2 max-w-sm mx-auto w-full pt-1">
              <div className="flex items-center gap-1 bg-[#FDF2F8] border border-[#FCE7F3] p-1 rounded-full shadow-2xs">
                {NAIL_LENGTHS.map((len) => (
                  <button
                    key={len.id}
                    type="button"
                    onClick={() => setSelectedLength(len.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-sans transition-all cursor-pointer ${
                      selectedLength === len.id
                        ? 'bg-[#E0246A] text-white font-semibold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {len.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center gap-3 max-w-xs mx-auto w-full pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-11 px-5 rounded-full bg-white border border-stone-200 text-stone-700 font-sans text-xs font-medium hover:bg-stone-50 transition cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <ShimmerButton
                onClick={() => setStep(3)}
                shimmerColor="#FDF2F8"
                background="#E0246A"
                borderRadius="9999px"
                className="flex-1 h-11 text-white font-sans text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 shadow-md shadow-[#E0246A]/20 cursor-pointer active:scale-[0.98]"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              </ShimmerButton>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 3: YOUR 5 NAIL DESIGNS
            ========================================================================= */}
        {step === 3 && (
          <div className="flex-1 flex flex-col justify-between py-2 sm:py-6 space-y-8 animate-in fade-in duration-150">
            <div className="text-center max-w-lg mx-auto">
              <h1 className="font-serif text-3xl sm:text-4xl font-medium text-stone-900 tracking-tight">
                Your 5 nail designs
              </h1>
              <p className="font-sans text-xs sm:text-sm text-stone-500 mt-1">
                Each nail has been customized with your selected shape and length.
              </p>
            </div>

            {/* Pure 5-Finger Display */}
            <div className="w-full max-w-3xl mx-auto">
              <div className="grid grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                {FINGER_KEYS.map((fk) => (
                  <div
                    key={fk}
                    className="bg-white hover:bg-[#FDF2F8]/30 rounded-3xl p-3 sm:p-5 border border-stone-200/80 hover:border-[#FCE7F3] shadow-xs flex flex-col items-center justify-between transition-all group"
                  >
                    <div className="py-2 sm:py-4">
                      <NailCanvasPreview
                        nail={previewNails[fk]}
                        width={46}
                        height={72}
                        showCuticle={false}
                      />
                    </div>
                    <div className="text-center pt-1 border-t border-stone-100 w-full">
                      <span className="font-sans text-[11px] sm:text-xs font-semibold text-stone-800 capitalize block">
                        {FINGER_LABELS[fk]}
                      </span>
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full mt-1 border border-black/10"
                        style={{ backgroundColor: previewNails[fk].accentColor }}
                        title={previewNails[fk].accentColor}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center gap-3 max-w-xs mx-auto w-full pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="h-11 px-5 rounded-full bg-white border border-stone-200 text-stone-700 font-sans text-xs font-medium hover:bg-stone-50 transition cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <ShimmerButton
                onClick={() => setStep(4)}
                shimmerColor="#FDF2F8"
                background="#E0246A"
                borderRadius="9999px"
                className="flex-1 h-11 text-white font-sans text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 shadow-md shadow-[#E0246A]/20 cursor-pointer active:scale-[0.98]"
              >
                <span>Try on Hand</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              </ShimmerButton>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 4: REAL-HAND VIRTUAL TRY-ON
            ========================================================================= */}
        {step === 4 && (
          <div className="flex-1 flex flex-col justify-between py-2 sm:py-4 space-y-6 animate-in fade-in duration-150 max-w-2xl mx-auto w-full">
            <div className="text-center">
              <h1 className="font-serif text-3xl sm:text-4xl font-medium text-stone-900 tracking-tight">
                Try on your hand
              </h1>
              <p className="font-sans text-xs sm:text-sm text-stone-500 mt-1">
                Preview how these designs look on your own fingers.
              </p>
            </div>

            {/* Hidden Photo Input */}
            <input
              ref={handPhotoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleHandPhotoChange}
            />

            {/* Initial State: The Two Clean Action Cards */}
            {!cameraActive && !uploadedHandPhoto && (
              <div className="space-y-4 my-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Card 1: Upload Photo */}
                  <div
                    onClick={() => handPhotoInputRef.current?.click()}
                    className="p-6 sm:p-7 rounded-3xl bg-white border border-stone-200/80 hover:border-[#E0246A] hover:bg-[#FDF2F8]/20 transition-all shadow-2xs hover:shadow-sm cursor-pointer group flex flex-col items-center text-center space-y-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#FDF2F8] text-[#E0246A] flex items-center justify-center group-hover:bg-[#E0246A] group-hover:text-white transition-colors">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-medium text-stone-900">
                        Upload hand photo
                      </h3>
                      <p className="font-sans text-xs text-stone-500 mt-1">
                        Use a photo from your gallery
                      </p>
                    </div>
                    <span className="font-sans text-xs font-semibold text-[#E0246A] px-4 py-1.5 rounded-full bg-[#FDF2F8] border border-[#FCE7F3] group-hover:bg-[#E0246A] group-hover:text-white group-hover:border-[#E0246A] transition-colors">
                      Browse Photo
                    </span>
                  </div>

                  {/* Card 2: Live Camera */}
                  <div
                    onClick={() => {
                      setTryOnTab('camera');
                      startCamera();
                    }}
                    className="p-6 sm:p-7 rounded-3xl bg-white border border-stone-200/80 hover:border-stone-900 transition-all shadow-2xs hover:shadow-sm cursor-pointer group flex flex-col items-center text-center space-y-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center group-hover:bg-stone-900 group-hover:text-white transition-colors">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-medium text-stone-900">
                        Live AR camera
                      </h3>
                      <p className="font-sans text-xs text-stone-500 mt-1">
                        Real-time camera on your fingers
                      </p>
                    </div>
                    <span className="font-sans text-xs font-semibold text-stone-800 px-4 py-1.5 rounded-full bg-stone-100 group-hover:bg-stone-900 group-hover:text-white transition-colors">
                      Launch Camera
                    </span>
                  </div>
                </div>

                {/* Subtle set summary capsule */}
                <div className="flex items-center justify-center gap-3 py-2 px-4 rounded-full bg-[#FDF2F8] border border-[#FCE7F3] mx-auto text-xs font-sans text-stone-700">
                  <span className="font-medium text-stone-900">{activeSet.title}</span>
                  <span className="text-stone-500 capitalize">{selectedShape} · {selectedLength}</span>
                  <div className="flex items-center gap-1 pl-2 border-l border-[#FCE7F3]">
                    {FINGER_KEYS.map((fk) => (
                      <span
                        key={fk}
                        className="w-2.5 h-2.5 rounded-full border border-black/10"
                        style={{ backgroundColor: previewNails[fk].accentColor }}
                        title={FINGER_LABELS[fk]}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Photo Active State */}
            {uploadedHandPhoto && !cameraActive && (
              <div className="space-y-4">
                <div className="relative w-full h-80 sm:h-96 bg-stone-900 rounded-3xl border border-stone-200/80 shadow-md overflow-hidden flex items-center justify-center">
                  <img
                    src={uploadedHandPhoto}
                    alt="Your hand photo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/10" />

                  {!isBareHand && (
                    <div className="absolute inset-x-6 sm:inset-x-8 top-8 sm:top-10 flex items-end justify-between pointer-events-none z-10">
                      <div className="flex flex-col items-center translate-y-7 -rotate-12">
                        <NailCanvasPreview nail={previewNails.thumb} width={32} height={50} showCuticle={false} />
                      </div>
                      <div className="flex flex-col items-center translate-y-2 -rotate-6">
                        <NailCanvasPreview nail={previewNails.index} width={34} height={54} showCuticle={false} />
                      </div>
                      <div className="flex flex-col items-center -translate-y-1 rotate-0">
                        <NailCanvasPreview nail={previewNails.middle} width={36} height={56} showCuticle={false} />
                      </div>
                      <div className="flex flex-col items-center translate-y-2 rotate-6">
                        <NailCanvasPreview nail={previewNails.ring} width={34} height={54} showCuticle={false} />
                      </div>
                      <div className="flex flex-col items-center translate-y-6 rotate-12">
                        <NailCanvasPreview nail={previewNails.pinky} width={30} height={46} showCuticle={false} />
                      </div>
                    </div>
                  )}

                  {/* Mode & Switch actions */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20">
                    <span className="px-3 py-1 rounded-full text-[11px] font-sans font-medium bg-black/50 backdrop-blur-md text-white/90 border border-white/10 shadow-2xs">
                      Your Hand Photo
                    </span>
                    <button
                      type="button"
                      onClick={() => handPhotoInputRef.current?.click()}
                      className="px-3 py-1 rounded-full text-[11px] font-sans font-medium bg-white/95 backdrop-blur-md text-stone-800 hover:text-[#E0246A] shadow-2xs transition cursor-pointer"
                    >
                      Change Photo
                    </button>
                  </div>

                  {/* Bottom Toggle: Before / After */}
                  <div className="absolute bottom-3 left-3 z-20">
                    <div className="bg-white/95 backdrop-blur-md p-0.5 rounded-full border border-stone-200 shadow-2xs flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => setIsBareHand(false)}
                        className={`px-3 py-0.5 rounded-full text-[11px] font-sans font-medium transition cursor-pointer ${
                          !isBareHand
                            ? 'bg-[#E0246A] text-white font-semibold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Manicured
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsBareHand(true)}
                        className={`px-3 py-0.5 rounded-full text-[11px] font-sans font-medium transition cursor-pointer ${
                          isBareHand
                            ? 'bg-stone-900 text-white font-semibold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Bare
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedHandPhoto(null);
                      setTryOnTab('camera');
                      startCamera();
                    }}
                    className="font-sans text-xs text-stone-500 hover:text-stone-900 underline underline-offset-4 cursor-pointer"
                  >
                    Switch to Live Camera instead →
                  </button>
                </div>
              </div>
            )}

            {/* Camera Active State */}
            {cameraActive && (
              <div className="space-y-4">
                <div className="relative w-full h-80 sm:h-96 bg-black rounded-3xl border border-stone-200/80 shadow-md overflow-hidden flex items-center justify-center">
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />

                  <div className="absolute inset-x-6 sm:inset-x-8 top-8 sm:top-10 flex items-end justify-between pointer-events-none z-10">
                    <div className="flex flex-col items-center translate-y-7 -rotate-12">
                      <NailCanvasPreview nail={previewNails.thumb} width={32} height={50} showCuticle={false} />
                    </div>
                    <div className="flex flex-col items-center translate-y-2 -rotate-6">
                      <NailCanvasPreview nail={previewNails.index} width={34} height={54} showCuticle={false} />
                    </div>
                    <div className="flex flex-col items-center -translate-y-1 rotate-0">
                      <NailCanvasPreview nail={previewNails.middle} width={36} height={56} showCuticle={false} />
                    </div>
                    <div className="flex flex-col items-center translate-y-2 rotate-6">
                      <NailCanvasPreview nail={previewNails.ring} width={34} height={54} showCuticle={false} />
                    </div>
                    <div className="flex flex-col items-center translate-y-6 rotate-12">
                      <NailCanvasPreview nail={previewNails.pinky} width={30} height={46} showCuticle={false} />
                    </div>
                  </div>

                  <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20">
                    <span className="px-3 py-1 rounded-full text-[11px] font-sans font-medium bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-2xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Live Camera Feed</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        setTryOnTab('photo');
                      }}
                      className="px-3 py-1 rounded-full text-[11px] font-sans font-medium bg-white/95 backdrop-blur-md text-stone-800 shadow-2xs transition cursor-pointer hover:text-[#E0246A]"
                    >
                      Close Camera
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setTryOnTab('photo');
                      handPhotoInputRef.current?.click();
                    }}
                    className="font-sans text-xs text-stone-500 hover:text-stone-900 underline underline-offset-4 cursor-pointer"
                  >
                    Switch to Photo Upload instead →
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setStep(3);
                }}
                className="h-11 px-6 rounded-full bg-white border border-stone-200 text-stone-700 font-sans text-xs font-medium hover:bg-stone-50 transition cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <ShimmerButton
                onClick={handleFinish}
                shimmerColor="#FDF2F8"
                background="#E0246A"
                borderRadius="9999px"
                className="h-11 px-8 text-white font-sans text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 shadow-md shadow-[#E0246A]/20 cursor-pointer active:scale-[0.98]"
              >
                <span>Continue to Studio</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              </ShimmerButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
