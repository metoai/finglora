'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Home, Compass, Hand, Paintbrush } from 'lucide-react';
import { motion } from 'framer-motion';
import { ExploreDesignSet, Finger, NailDesign, NailShape, SkinTonePreset } from '@/types/nail';

import { CustomerRoute, CustomerSidebar } from './CustomerSidebar';
import { CustomerTopBar } from './CustomerTopBar';
import { HomeHubView } from './HomeHubView';
import { ExploreGalleryView } from './ExploreGalleryView';
import { UploadInspirationView } from './UploadInspirationView';
import { TryOnView } from './TryOnView';
import { AiCreationView } from './AiCreationView';
import { CustomerSignupView } from './CustomerSignupView';
import { ProfileView } from './ProfileView';
import { PassportView } from './PassportView';
import { getUserCreditStatus, useTryOnCredit } from '@/lib/services/credits';
import { ProPaywallModal } from '@/components/common/ProPaywallModal';

export function CustomerApp({
  customerRoute,
  setCustomerRoute,
  mobilePreview,
  userName,
  setUserName,
  userEmail,
  supabaseUser,
  preferredShape,
  setPreferredShape,
  activeSample,
  activeSetId,
  setActiveSetId,
  onResetInspo,
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
  synthesizedHandUrl,
  setSynthesizedHandUrl,
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
  userEmail?: string;
  supabaseUser?: any;
  preferredShape: NailShape;
  setPreferredShape?: (shape: NailShape) => void;
  activeSample?: ExploreDesignSet;
  activeSetId?: string;
  setActiveSetId?: (id: string) => void;
  onResetInspo?: () => void;
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
  synthesizedHandUrl?: string | null;
  setSynthesizedHandUrl?: (url: string | null) => void;
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
  const [aiCreationBaseImage, setAiCreationBaseImage] = useState<string | null>(null);

  const favoritesCount = exploreDesigns.filter((d) => d.isSaved).length;

  // Whenever navigating away from Try-On, reset try-on state so it always starts fresh
  const prevCustomerRouteRef = useRef(customerRoute);
  useEffect(() => {
    if (prevCustomerRouteRef.current === 'tryon' && customerRoute !== 'tryon') {
      setSynthesizedHandUrl?.(null);
      setTryOnView?.('after');
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('finglora_synthesized_hand_url');
        } catch {}
      }
    }
    prevCustomerRouteRef.current = customerRoute;
  }, [customerRoute, setSynthesizedHandUrl, setTryOnView]);

  // Unified route navigation that resets inspo when entering tryon without explicit card selection
  const handleNavToRoute = (route: CustomerRoute) => {
    if (route === 'tryon') {
      setActivePhotoUrl?.('');
      setSynthesizedHandUrl?.(null);
      setTryOnView?.('before');
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('finglora_synthesized_hand_url');
        } catch {}
      }
    }
    setCustomerRoute(route);
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#FAF9F6] ${
        customerRoute === 'ai-create' ? 'h-[100dvh] overflow-hidden' : ''
      }`}
    >
      {/* Pinterest-Style Slim Left Rail for Desktop */}
      {!mobilePreview && (
        <CustomerSidebar
          currentRoute={customerRoute}
          onNavigate={handleNavToRoute}
          onBrandClick={onBrandClick}
          favoritesCount={favoritesCount}
          userName={userName}
          preferredShape={preferredShape}
        />
      )}

      {/* Mobile Top Header (hidden on desktop where left rail is present) */}
      <div className={mobilePreview ? 'block' : 'md:hidden'}>
        <CustomerTopBar
          currentRoute={customerRoute}
          onNavigate={handleNavToRoute}
          onBrandClick={onBrandClick}
          favoritesCount={favoritesCount}
          userName={userName}
          preferredShape={preferredShape}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          onLogout={onBrandClick}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 w-full ${
          mobilePreview ? '' : 'md:pl-16'
        } ${
          customerRoute === 'ai-create' ? 'h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] overflow-hidden' : ''
        }`}
      >
        <main
          className={`flex-1 w-full ${
            customerRoute === 'ai-create'
              ? 'h-full p-0 bg-white overflow-hidden flex flex-col'
              : customerRoute === 'explore' || customerRoute === 'home' || customerRoute === 'profile' || customerRoute === 'favorites' || customerRoute === 'history'
              ? 'w-full p-0'
              : customerRoute === 'tryon'
              ? 'w-full max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4 pb-20 md:pb-8'
              : mobilePreview
              ? 'pb-20 px-4 pt-4'
              : 'min-h-[calc(100vh-4rem)] pb-20 md:pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl xl:max-w-7xl mx-auto pt-4 sm:pt-6'
          }`}
        >
        <div
          className={`w-full ${
            customerRoute === 'ai-create'
              ? 'h-full flex-1 flex flex-col min-h-0'
              : 'w-full'
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
                handleNavToRoute('tryon');
              }}
              onTryOnClick={() => handleNavToRoute('tryon')}
              onCustomizeClick={() => setCustomerRoute('ai-create')}
              onUploadClick={() => setCustomerRoute('upload')}
              onExploreClick={(query?: string) => {
                if (query) {
                  setExploreSearch(query);
                }
                setCustomerRoute('explore');
              }}
              onFavoritesClick={() => setCustomerRoute('favorites')}
              onCreatePromptClick={(prompt) => {
                setAiStudioPrompt(prompt);
                setActiveSetName(prompt.slice(0, 32) || 'Custom AI Set');
                const savedHand =
                  customTryOnHandUrl ||
                  (typeof window !== 'undefined'
                    ? localStorage.getItem('finglora_custom_hand_photo') ||
                      localStorage.getItem('finglora_user_hand_photo')
                    : null);
                if (savedHand) {
                  setAiCreationBaseImage(savedHand);
                } else {
                  setAiCreationBaseImage('https://xwfazcaxniogiyyaovau.supabase.co/storage/v1/object/public/designs/glazed/glazed_pearl_almond_01.jpg');
                }
                setCustomerRoute('ai-create');
              }}
              customTryOnHandUrl={customTryOnHandUrl}
              setCustomTryOnHandUrl={setCustomTryOnHandUrl}
            />
          )}

          {customerRoute === 'ai-create' && (
            <AiCreationView
              customTryOnHandUrl={customTryOnHandUrl}
              initialHandDesignUrl={aiCreationBaseImage || customTryOnHandUrl}
              initialPrompt={aiStudioPrompt}
              onClearInitialPrompt={() => setAiStudioPrompt('')}
              nails={nails}
              setNails={setNails}
              onSignUpClick={() => setCustomerRoute('signup')}
              onBackToTryOn={() => setCustomerRoute('home')}
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
              exploreDesigns={exploreDesigns}
              onSelectExploreDesign={(id) => {
                onSelectExploreDesign(id);
                setCustomerRoute('tryon');
              }}
              onSelectHandDataUrl={(dataUrl) => {
                setCustomTryOnHandUrl(dataUrl);
                setSynthesizedHandUrl?.(null);
              }}
              onUploadHandPhoto={(file) => {
                const reader = new FileReader();
                reader.onload = () => {
                  const dataUrl = reader.result as string;
                  setCustomTryOnHandUrl(dataUrl);
                  setSynthesizedHandUrl?.(null);
                  try {
                    localStorage.setItem('finglora_custom_hand_photo', dataUrl);
                    localStorage.setItem('finglora_user_hand_photo', dataUrl);
                  } catch {}
                };
                reader.readAsDataURL(file);
              }}
              onImageSelected={(file) => {
                setSynthesizedHandUrl?.(null);
                onImageSelectedForExtraction(file);
              }}
              onSampleDemoClick={() => {
                setSynthesizedHandUrl?.(null);
                onSampleExtractionDemo();
              }}
              onCancel={() => {
                setIsAnalyzing?.(false);
                setCustomerRoute('home');
              }}
              onComplete={(synthesizedUrl?: string) => {
                if (synthesizedUrl && setSynthesizedHandUrl) {
                  setSynthesizedHandUrl(synthesizedUrl);
                }
                setTryOnView?.('after');
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
              synthesizedHandUrl={synthesizedHandUrl}
              setSynthesizedHandUrl={setSynthesizedHandUrl}
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
              activePhotoUrl={activePhotoUrl}
              onResetInspo={() => {
                setActivePhotoUrl?.('');
                setActiveSetId?.('');
                setSynthesizedHandUrl?.(null);
                setTryOnView?.('before');
                if (typeof window !== 'undefined') {
                  try {
                    localStorage.removeItem('finglora_synthesized_hand_url');
                  } catch {}
                }
                onResetInspo?.();
              }}
              onExploreClick={() => setCustomerRoute('explore')}
              onCustomizeWithAi={(handUrl: string) => {
                setAiCreationBaseImage(handUrl);
                try {
                  localStorage.setItem('finglora_ai_base_hand_image', handUrl);
                } catch {}
                setCustomerRoute('ai-create');
              }}
            />
          )}

          {(customerRoute === 'profile' || customerRoute === 'favorites' || customerRoute === 'history') && (
            <ProfileView
              userName={userName}
              setUserName={setUserName}
              userEmail={userEmail}
              supabaseUser={supabaseUser}
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
              initialView={
                customerRoute === 'history'
                  ? 'history'
                  : customerRoute === 'favorites'
                  ? 'favorites'
                  : 'settings'
              }
              customTryOnHandUrl={customTryOnHandUrl}
              setCustomTryOnHandUrl={setCustomTryOnHandUrl}
              onLogout={onBrandClick}
            />
          )}

          {customerRoute === 'passport' && (
            <PassportView
              activePassportCode={activePassportCode}
              activeSetName={activeSetName}
              orderedFingers={orderedFingers}
              nails={nails}
              activeSkinTone={activeSkinTone}
              handOrientation={handOrientation}
              onCopyShareLink={onCopyShareLink}
              onTryOnClick={() => setCustomerRoute('tryon')}
            />
          )}
        </div>
      </main>
      </div>

      {/* Mobile Bottom Navigation - Modern Floating Capsule with Fluid Sliding Active Shape */}
      {(() => {
        const activeNavTab: 'home' | 'tryon' | 'explore' | 'studio' =
          customerRoute === 'tryon' || customerRoute === 'upload'
            ? 'tryon'
            : customerRoute === 'explore'
            ? 'explore'
            : customerRoute === 'ai-create'
            ? 'studio'
            : 'home';

        const mobileNavTabs: {
          id: 'home' | 'tryon' | 'explore' | 'studio';
          label: string;
          Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
          route: CustomerRoute;
        }[] = [
          { id: 'home', label: 'Home', Icon: Home, route: 'home' },
          { id: 'tryon', label: 'Try On', Icon: Hand, route: 'tryon' },
          { id: 'explore', label: 'Explore', Icon: Compass, route: 'explore' },
          { id: 'studio', label: 'AI Studio', Icon: Paintbrush, route: 'ai-create' },
        ];

        return (
          <nav
            className={`${
              mobilePreview ? 'flex' : 'flex md:hidden'
            } fixed bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-6 max-w-[370px] mx-auto z-40 h-[60px] items-center justify-between p-1.5 rounded-full bg-white/90 backdrop-blur-2xl border border-stone-200/90 shadow-[0_12px_36px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.04)] select-none`}
            aria-label="Mobile Navigation"
          >
            <div className="relative w-full h-full flex items-center justify-between gap-1">
              {mobileNavTabs.map((tab) => {
                const isActive = activeNavTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleNavToRoute(tab.route)}
                    className="relative flex-1 h-full flex flex-col items-center justify-center cursor-pointer select-none rounded-full py-1 group active:scale-95 transition-transform"
                  >
                    {/* Modern Active Shape that Smoothly Glides with Spring Physics */}
                    {isActive && (
                      <motion.div
                        layoutId="activeMobileBottomTabPill"
                        className="absolute inset-0 bg-[#E0246A] rounded-full shadow-[0_4px_18px_rgba(224,36,106,0.38)] z-0"
                        transition={{
                          type: 'spring',
                          stiffness: 440,
                          damping: 32,
                          mass: 0.7,
                        }}
                      />
                    )}

                    {/* Tab Icon & Label */}
                    <div className="relative z-10 flex flex-col items-center justify-center gap-0.5 pointer-events-none">
                      <tab.Icon
                        className={`w-5 h-5 transition-colors duration-200 ${
                          isActive ? 'text-white' : 'text-stone-400 group-hover:text-stone-700'
                        }`}
                        strokeWidth={isActive ? 2.25 : 1.75}
                      />
                      <span
                        className={`text-[10px] tracking-tight leading-none transition-colors duration-200 ${
                          isActive
                            ? 'text-white font-semibold'
                            : 'text-stone-500 font-medium group-hover:text-stone-800'
                        }`}
                      >
                        {tab.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>
        );
      })()}

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
