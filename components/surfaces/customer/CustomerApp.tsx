'use client';

import React, { useState } from 'react';
import { Home, Compass, ImagePlus, Paintbrush, Hand, Share2, Menu, X, ChevronRight, Wand2, User } from 'lucide-react';
import { ExploreDesignSet, Finger, NailDesign, NailShape, SkinTonePreset } from '@/types/nail';
import { BrandLogo } from '@/components/common/BrandLogo';
import { CustomerRoute, CustomerSidebar } from './CustomerSidebar';
import { HomeHubView } from './HomeHubView';
import { ExploreGalleryView } from './ExploreGalleryView';
import { UploadInspirationView } from './UploadInspirationView';
import { TryOnView } from './TryOnView';
import { AiCreationView } from './AiCreationView';
import { CustomerSignupView } from './CustomerSignupView';
import { ProfileView } from './ProfileView';
import { getUserCreditStatus, useTryOnCredit } from '@/lib/services/credits';
import { ProPaywallModal } from '@/components/common/ProPaywallModal';

export function CustomerApp({
  customerRoute,
  setCustomerRoute,
  mobilePreview,
  userName,
  setUserName,
  preferredShape,
  setPreferredShape,
  activeSample,
  activePhotoUrl,
  activeSetName,
  setActiveSetName,
  activePassportCode,
  orderedFingers,
  selectedFinger,
  setSelectedFinger,
  swapMode,
  setSwapMode,
  swapFirstFinger,
  nails,
  setNails,
  aiStudioPrompt,
  setAiStudioPrompt,
  exploreDesigns,
  setExploreDesigns,
  exploreCategory,
  setExploreCategory,
  exploreSearch,
  setExploreSearch,
  isAnalyzing,
  analysisStep,
  isAnalyzingCached,
  setIsAnalyzing,
  setActivePhotoUrl,
  handOrientation,
  setHandOrientation,
  tryOnMode,
  setTryOnMode,
  cameraStatus,
  cameraErrorNote,
  capturedFrameUrl,
  videoRef,
  onStartLiveCamera,
  onCaptureCameraFrame,
  onCancelCamera,
  tryOnView,
  setTryOnView,
  customTryOnHandUrl,
  setCustomTryOnHandUrl,
  overlayScale,
  setOverlayScale,
  overlayOffsetY,
  setOverlayOffsetY,
  tryOnZoom,
  setTryOnZoom,
  skinToneId,
  setSkinToneId,
  activeSkinTone,
  onBrandClick,
  onTuneVibeClick,
  onSelectFinger,
  onUndoFingerEdit,
  onUpdateActiveFinger,
  onOpenApplyAllModal,
  onImageSelectedForExtraction,
  onSampleExtractionDemo,
  onSelectExploreDesign,
  onCopyShareLink,
  onCustomerSignUpSubmit,
}: {
  customerRoute: CustomerRoute;
  setCustomerRoute: (route: CustomerRoute) => void;
  mobilePreview: boolean;
  userName: string;
  setUserName: (name: string) => void;
  preferredShape: NailShape;
  setPreferredShape?: (shape: NailShape) => void;
  activeSample: ExploreDesignSet;
  activePhotoUrl: string;
  activeSetName: string;
  setActiveSetName: (name: string) => void;
  activePassportCode: string;
  orderedFingers: Finger[];
  selectedFinger: Finger;
  setSelectedFinger: (fk: Finger) => void;
  swapMode: boolean;
  setSwapMode: React.Dispatch<React.SetStateAction<boolean>>;
  swapFirstFinger: Finger | null;
  nails: Record<Finger, NailDesign>;
  setNails?: React.Dispatch<React.SetStateAction<Record<Finger, NailDesign>>>;
  setActivePhotoUrl?: (url: string) => void;
  aiStudioPrompt: string;
  setAiStudioPrompt: (prompt: string) => void;
  exploreDesigns: ExploreDesignSet[];
  setExploreDesigns: React.Dispatch<React.SetStateAction<ExploreDesignSet[]>>;
  exploreCategory: string;
  setExploreCategory: (category: string) => void;
  exploreSearch: string;
  setExploreSearch: (search: string) => void;
  isAnalyzing: boolean;
  analysisStep: number;
  isAnalyzingCached?: boolean;
  setIsAnalyzing?: React.Dispatch<React.SetStateAction<boolean>>;
  handOrientation: 'left' | 'right';
  setHandOrientation: React.Dispatch<React.SetStateAction<'left' | 'right'>>;
  tryOnMode: 'camera' | 'upload' | 'sample';
  setTryOnMode: (mode: 'camera' | 'upload' | 'sample') => void;
  cameraStatus: 'idle' | 'starting' | 'live' | 'simulated' | 'captured';
  cameraErrorNote: string;
  capturedFrameUrl: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onStartLiveCamera: () => void;
  onCaptureCameraFrame: () => void;
  onCancelCamera: () => void;
  tryOnView: 'after' | 'before';
  setTryOnView: (view: 'after' | 'before') => void;
  customTryOnHandUrl: string | null;
  setCustomTryOnHandUrl: (url: string | null) => void;
  overlayScale: number;
  setOverlayScale: (scale: number) => void;
  overlayOffsetY: number;
  setOverlayOffsetY: (offset: number) => void;
  tryOnZoom: boolean;
  setTryOnZoom: React.Dispatch<React.SetStateAction<boolean>>;
  skinToneId: string;
  setSkinToneId: (id: string) => void;
  activeSkinTone: SkinTonePreset;
  onBrandClick: () => void;
  onTuneVibeClick: () => void;
  onSelectFinger: (fk: Finger) => void;
  onUndoFingerEdit: () => void;
  onUpdateActiveFinger: (patch: Partial<NailDesign>) => void;
  onOpenApplyAllModal: () => void;
  onImageSelectedForExtraction: (file: File) => void;
  onSampleExtractionDemo: () => void;
  onSelectExploreDesign: (id: string) => void;
  onCopyShareLink: () => void;
  onCustomerSignUpSubmit: () => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [isGuestFirstTry, setIsGuestFirstTry] = useState(false);

  const routeBreadcrumbs: Record<CustomerRoute, string> = {
    home: 'Home',
    explore: 'Explore',
    tryon: 'Try On',
    'ai-create': 'Create with AI',
    upload: 'Upload',
    favorites: 'Favorites',
    profile: 'Profile',
    signup: 'Create Account',
  };

  const favoritesCount = exploreDesigns.filter((d) => d.isSaved).length;

  const customerNavItems: {
    id: CustomerRoute;
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'upload', label: 'Upload', icon: ImagePlus },
    { id: 'tryon', label: 'Try On', icon: Hand },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col ${mobilePreview ? '' : 'lg:flex-row'} ${
        customerRoute === 'ai-create' ? 'h-screen overflow-hidden' : ''
      }`}
    >
      {!mobilePreview && (
        <CustomerSidebar
          currentRoute={customerRoute}
          onNavigate={setCustomerRoute}
          activeSetName={activeSetName}
          activePhotoUrl={activePhotoUrl}
          nails={nails}
          onBrandClick={onBrandClick}
          favoritesCount={favoritesCount}
        />
      )}

      {/* Mobile Header with Clean Breadcrumb and Hamburger Navigation */}
      {customerRoute !== 'ai-create' && (
        <header
          className={`${
            mobilePreview ? 'flex flex-col' : 'flex flex-col lg:hidden'
          } sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[rgba(31,26,28,0.06)] shadow-2xs`}
        >
          <div className="px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onBrandClick}
                className="text-left focus:outline-none cursor-pointer flex items-center"
                aria-label="Finglora Home"
              >
                <BrandLogo size="sm" />
              </button>
              <span className="text-[#8C8085]/60 text-xs font-mono">/</span>
              <span className="text-xs font-semibold text-[#18181B]">
                {routeBreadcrumbs[customerRoute] || 'Home'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="w-9 h-9 rounded-full bg-white border border-[#F0DFE4] text-[#18181B] hover:text-[#E0246A] hover:border-[#E0246A] flex items-center justify-center transition shadow-2xs cursor-pointer active:scale-95"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4 text-[#18181B]" />
              ) : (
                <Menu className="w-4 h-4 text-[#18181B]" />
              )}
            </button>
          </div>

          {/* Mobile Dropdown Drawer (Simple Normal Words) */}
          {mobileMenuOpen && (
            <div className="bg-[#FFFFFF] border-b border-[#F0DFE4] px-4 py-2.5 space-y-1 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
              {customerNavItems.map(({ id, label, icon: Icon }) => {
                const active = customerRoute === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setCustomerRoute(id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full h-10 px-3 rounded-xl text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                      active
                        ? 'bg-[#FDE8EF] text-[#E0246A] font-semibold'
                        : 'text-[#18181B] hover:text-[#E0246A] hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" strokeWidth={active ? 2 : 1.75} />
                      <span>{label}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 ${active ? 'text-[#E0246A]' : 'text-[#8C8085]'}`} />
                  </button>
                );
              })}
            </div>
          )}
        </header>
      )}

      {/* Main Content Area with Desktop Header */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${mobilePreview ? '' : 'lg:ml-64'} ${
          customerRoute === 'ai-create' ? 'h-screen overflow-hidden' : ''
        }`}
      >


      <main
        className={`flex-1 ${
          customerRoute === 'ai-create'
            ? 'h-full p-0 bg-[#FAF9F6] overflow-hidden flex flex-col'
            : mobilePreview
            ? 'pb-24 px-4 pt-4'
            : customerRoute === 'tryon'
            ? 'min-h-screen flex flex-col justify-center items-center px-3 sm:px-6 py-6 pb-20 lg:py-8'
            : 'min-h-screen pb-24 lg:pb-12 px-4 sm:px-8 lg:px-10 pt-4 sm:pt-8'
        }`}
      >
        <div
          className={`w-full ${
            customerRoute === 'ai-create'
              ? 'h-full flex-1 flex flex-col min-h-0'
              : customerRoute === 'tryon'
              ? 'max-w-md mx-auto my-auto flex flex-col justify-center'
              : 'max-w-[1400px]'
          }`}
        >
          {customerRoute === 'signup' && (
            <CustomerSignupView
              userName={userName}
              setUserName={setUserName}
              onSubmit={onCustomerSignUpSubmit}
              onSignInSuccess={() => setCustomerRoute('home')}
            />
          )}

          {customerRoute === 'home' && (
            <HomeHubView
              userName={userName}
              preferredShape={preferredShape}
              activeSample={activeSample}
              activePhotoUrl={activePhotoUrl}
              activeSetName={activeSetName}
              orderedFingers={orderedFingers}
              nails={nails}
              aiStudioPrompt={aiStudioPrompt}
              setAiStudioPrompt={setAiStudioPrompt}
              mobilePreview={mobilePreview}
              exploreDesigns={exploreDesigns}
              onSelectExploreDesign={onSelectExploreDesign}
              onTuneVibeClick={onTuneVibeClick}
              onSelectFinger={() => {
                setCustomerRoute('tryon');
              }}
              onTryOnClick={() => setCustomerRoute('tryon')}
              onCustomizeClick={() => setCustomerRoute('tryon')}
              onUploadClick={() => setCustomerRoute('upload')}
              onExploreClick={() => setCustomerRoute('explore')}
              onCreatePromptClick={(prompt) => {
                setAiStudioPrompt(prompt);
                setActiveSetName(prompt.slice(0, 32) || 'Custom AI Set');
                setCustomerRoute('ai-create');
              }}
              customTryOnHandUrl={customTryOnHandUrl}
              setCustomTryOnHandUrl={setCustomTryOnHandUrl}
            />
          )}

          {customerRoute === 'ai-create' && (
            <AiCreationView
              customTryOnHandUrl={customTryOnHandUrl}
              nails={nails}
              setNails={setNails}
              onSignUpClick={() => setCustomerRoute('signup')}
            />
          )}

          {customerRoute === 'explore' && (
            <ExploreGalleryView
              exploreDesigns={exploreDesigns}
              setExploreDesigns={setExploreDesigns}
              exploreCategory={exploreCategory}
              setExploreCategory={setExploreCategory}
              exploreSearch={exploreSearch}
              setExploreSearch={setExploreSearch}
              mobilePreview={mobilePreview}
              onUploadClick={() => setCustomerRoute('upload')}
              onSelectDesign={onSelectExploreDesign}
              onTryOnClick={(designId) => {
                const status = getUserCreditStatus();
                if (status.credits <= 0 && !status.isPro) {
                  setIsGuestFirstTry(status.hasUsedGuestCredit && !status.hasReceivedSignupBonus);
                  setPaywallOpen(true);
                  return;
                }
                useTryOnCredit();
                if (designId) {
                  onSelectExploreDesign(designId);
                }
              }}
            />
          )}

          {customerRoute === 'upload' && (
            <UploadInspirationView
              isAnalyzing={isAnalyzing}
              analysisStep={analysisStep}
              nails={nails}
              activePhotoUrl={activePhotoUrl}
              customTryOnHandUrl={customTryOnHandUrl}
              onUploadHandPhoto={(file) => {
                const reader = new FileReader();
                reader.onload = () => {
                  const dataUrl = reader.result as string;
                  setCustomTryOnHandUrl(dataUrl);
                  try {
                    localStorage.setItem('finglora_custom_hand_photo', dataUrl);
                    localStorage.setItem('finglora_user_hand_photo', dataUrl);
                  } catch {}
                };
                reader.readAsDataURL(file);
              }}
              onImageSelected={onImageSelectedForExtraction}
              onSampleDemoClick={onSampleExtractionDemo}
              onCancel={() => {
                setIsAnalyzing?.(false);
                setCustomerRoute('home');
              }}
              onComplete={() => {
                setIsAnalyzing?.(false);
                setCustomerRoute('tryon');
              }}
            />
          )}

          {customerRoute === 'tryon' && (
            <TryOnView
              tryOnMode={tryOnMode}
              setTryOnMode={setTryOnMode}
              cameraStatus={cameraStatus}
              cameraErrorNote={cameraErrorNote}
              capturedFrameUrl={capturedFrameUrl}
              videoRef={videoRef}
              onStartLiveCamera={onStartLiveCamera}
              onCaptureCameraFrame={onCaptureCameraFrame}
              onCancelCamera={onCancelCamera}
              tryOnView={tryOnView}
              setTryOnView={setTryOnView}
              handOrientation={handOrientation}
              setHandOrientation={setHandOrientation}
              customTryOnHandUrl={customTryOnHandUrl}
              setCustomTryOnHandUrl={setCustomTryOnHandUrl}
              overlayScale={overlayScale}
              setOverlayScale={setOverlayScale}
              overlayOffsetY={overlayOffsetY}
              setOverlayOffsetY={setOverlayOffsetY}
              tryOnZoom={tryOnZoom}
              setTryOnZoom={setTryOnZoom}
              skinToneId={skinToneId}
              setSkinToneId={setSkinToneId}
              activeSkinTone={activeSkinTone}
              orderedFingers={orderedFingers}
              nails={nails}
              setNails={setNails}
              mobilePreview={mobilePreview}
              onBackToStudioClick={() => setCustomerRoute('home')}
              onBackToHomeClick={() => setCustomerRoute('home')}
              exploreDesigns={exploreDesigns}
              onSelectExploreDesign={onSelectExploreDesign}
              activeSample={activeSample}
            />
          )}

          {(customerRoute === 'profile' || customerRoute === 'favorites') && (
            <ProfileView
              userName={userName}
              setUserName={setUserName}
              preferredShape={preferredShape}
              setPreferredShape={setPreferredShape}
              skinToneId={skinToneId}
              setSkinToneId={setSkinToneId}
              activeSkinTone={activeSkinTone}
              activeSetName={activeSetName}
              nails={nails}
              orderedFingers={orderedFingers}
              exploreDesigns={exploreDesigns}
              setExploreDesigns={setExploreDesigns}
              onSelectExploreDesign={(id) => {
                onSelectExploreDesign?.(id);
                setCustomerRoute('tryon');
              }}
              onBackClick={() => setCustomerRoute('home')}
              onNavigateAiStudio={() => setCustomerRoute('ai-create')}
              onNavigateTryOn={() => setCustomerRoute('tryon')}
              onNavigateLookbook={() => setCustomerRoute('explore')}
              onTuneVibeClick={onTuneVibeClick}
              handOrientation={handOrientation}
              initialView={customerRoute === 'favorites' ? 'favorites' : 'settings'}
              customTryOnHandUrl={customTryOnHandUrl}
              setCustomTryOnHandUrl={setCustomTryOnHandUrl}
              onLogout={onBrandClick}
            />
          )}
        </div>
      </main>
      </div>

      {/* Mobile Bottom Navigation - 3-Tab Bar */}
      {customerRoute !== 'ai-create' && (
        <nav
          className={`${
            mobilePreview ? 'flex' : 'flex lg:hidden'
          } fixed bottom-0 inset-x-0 z-30 bg-[#FFFFFF] border-t border-[#F0DFE4] px-6 py-1 justify-around items-center shadow-[0_-2px_12px_rgba(0,0,0,0.03)]`}
        >
          {(
            [
              { id: 'home' as const, label: 'Home', Icon: Home },
              { id: 'tryon' as const, label: 'Try On', Icon: Hand, isCenter: true },
              { id: 'explore' as const, label: 'Explore', Icon: Compass },
            ]
          ).map(({ id, label, Icon, isCenter }) => {
            const active = customerRoute === id;
            if (isCenter) {
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCustomerRoute(id)}
                  className="relative -top-2.5 flex flex-col items-center group cursor-pointer focus:outline-none"
                  title="Try On"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
                      active
                        ? 'bg-[#E0246A] text-white scale-105 shadow-[#E0246A]/30'
                        : 'bg-[#E0246A] text-white hover:bg-[#BE185D]'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-white" strokeWidth={1.75} />
                  </div>
                  <span
                    className={`text-[9.5px] mt-0.5 font-medium transition-colors ${
                      active ? 'text-[#E0246A] font-semibold' : 'text-[#8C8085]'
                    }`}
                  >
                    {label}
                  </span>
                </button>
              );
            }
            return (
              <button
                key={id}
                type="button"
                onClick={() => setCustomerRoute(id)}
                className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all cursor-pointer ${
                  active ? 'text-[#E0246A]' : 'text-[#8C8085] hover:text-[#18181B]'
                }`}
              >
                <div className="py-0.5">
                  <Icon className="w-5 h-5" strokeWidth={active ? 2 : 1.5} />
                </div>
                <span className={`text-[10px] ${active ? 'font-semibold text-[#E0246A]' : 'font-medium'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Pro Paywall Modal */}
      <ProPaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onSuccess={() => setPaywallOpen(false)}
        isGuestFirstTry={isGuestFirstTry}
        onSignUpClick={() => setCustomerRoute('signup')}
      />
    </div>
  );
}
