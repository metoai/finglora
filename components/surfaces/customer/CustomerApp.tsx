'use client';

import React, { useState } from 'react';
import { Home, Compass, Hand } from 'lucide-react';
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
import { StudioView } from './StudioView';
import { PassportView } from './PassportView';
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
          onNavigate={setCustomerRoute}
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
          onNavigate={setCustomerRoute}
          onBrandClick={onBrandClick}
          favoritesCount={favoritesCount}
          userName={userName}
          preferredShape={preferredShape}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
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
              ? 'h-full p-0 bg-[#FAF9F6] overflow-hidden flex flex-col'
              : customerRoute === 'explore'
              ? 'min-h-screen pb-24 md:pb-12 w-full p-0'
              : mobilePreview
              ? 'pb-24 px-4 pt-4'
              : 'min-h-[calc(100vh-4rem)] pb-24 md:pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl xl:max-w-7xl mx-auto pt-4 sm:pt-6'
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
                setCustomerRoute('tryon');
              }}
              onTryOnClick={() => setCustomerRoute('tryon')}
              onCustomizeClick={() => setCustomerRoute('tryon')}
              onUploadClick={() => setCustomerRoute('upload')}
              onExploreClick={() => setCustomerRoute('explore')}
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
                  setAiCreationBaseImage('/assets/editorial_nail_hero.jpg');
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
              onCustomizeWithAi={(handUrl: string) => {
                setAiCreationBaseImage(handUrl);
                try {
                  localStorage.setItem('finglora_ai_base_hand_image', handUrl);
                } catch {}
                setCustomerRoute('ai-create');
              }}
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

          {customerRoute === 'studio' && (
            <StudioView
              activeSample={activeSample}
              activePhotoUrl={activePhotoUrl}
              activeSetName={activeSetName}
              setActiveSetName={setActiveSetName}
              handOrientation={handOrientation}
              setHandOrientation={setHandOrientation}
              swapMode={swapMode}
              setSwapMode={setSwapMode}
              swapFirstFinger={swapFirstFinger}
              orderedFingers={orderedFingers}
              selectedFinger={selectedFinger}
              nails={nails}
              mobilePreview={mobilePreview}
              onSelectFinger={onSelectFinger}
              onUndoFingerEdit={onUndoFingerEdit}
              onUpdateActiveFinger={onUpdateActiveFinger}
              onOpenApplyAllModal={onOpenApplyAllModal}
              onTryOnClick={() => setCustomerRoute('tryon')}
              onPassportClick={() => setCustomerRoute('passport')}
              exploreDesigns={exploreDesigns}
              onSelectExploreDesign={onSelectExploreDesign}
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

      {/* Mobile Bottom Navigation - 3-Tab Bar */}
      {customerRoute !== 'ai-create' && (
        <nav
          className={`${
            mobilePreview ? 'flex' : 'flex md:hidden'
          } fixed bottom-0 inset-x-0 z-30 bg-[#FFFFFF] border-t border-[#F0DFE4] px-6 py-1 justify-around items-center shadow-[0_-2px_12px_rgba(0,0,0,0.03)]`}
        >
          {(
            [
              { id: 'home' as const, label: 'Home', Icon: Home },
              { id: 'tryon' as const, label: 'Try On', Icon: Hand, isCenter: true },
              { id: 'explore' as const, label: 'Explore', Icon: Compass },
            ]
          ).map(({ id, label, Icon, isCenter }) => {
            const active =
              customerRoute === id ||
              (id === 'tryon' && (customerRoute === 'tryon' || customerRoute === 'upload'));
            if (isCenter) {
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCustomerRoute('tryon')}
                  className="relative -top-2.5 flex flex-col items-center group cursor-pointer focus:outline-none"
                  title="Virtual Try-On"
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
