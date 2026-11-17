'use client';

import React from 'react';
import { ClipboardList, Inbox, Store, Printer, Paintbrush } from 'lucide-react';
import { ExploreDesignSet, Finger, NailDesign, TechProfile } from '@/types/nail';
import { TechRoute, TechSidebar } from './TechSidebar';
import { TechSignupView } from './TechSignupView';
import { TechWorkspaceView } from './TechWorkspaceView';
import { TechGuideView } from './TechGuideView';
import { BrandLogo } from '@/components/common/BrandLogo';

export function TechApp({
  techRoute,
  setTechRoute,
  mobilePreview,
  techProfile,
  setTechProfile,
  activeSample,
  activePhotoUrl,
  techSourceLabel,
  activeSetName,
  orderedFingers,
  techSelectedFinger,
  setTechSelectedFinger,
  nails,
  techCompletedSteps,
  setTechCompletedSteps,
  onBrandClick,
  onTechSignupSubmit,
  onLoadClientLink,
  onUploadWhatsAppPhoto,
  onNavigateCustomer,
}: {
  techRoute: TechRoute;
  setTechRoute: (route: TechRoute) => void;
  mobilePreview: boolean;
  techProfile: TechProfile;
  setTechProfile: React.Dispatch<React.SetStateAction<TechProfile>>;
  activeSample: ExploreDesignSet;
  activePhotoUrl: string;
  techSourceLabel: string;
  activeSetName: string;
  orderedFingers: Finger[];
  techSelectedFinger: 'all' | Finger;
  setTechSelectedFinger: (finger: 'all' | Finger) => void;
  nails: Record<Finger, NailDesign>;
  techCompletedSteps: Record<string, boolean>;
  setTechCompletedSteps: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onBrandClick: () => void;
  onTechSignupSubmit: () => void;
  onLoadClientLink: () => void;
  onUploadWhatsAppPhoto: (file: File) => void;
  onNavigateCustomer?: () => void;
}) {
  return (
    <div className={`min-h-screen bg-[#FAFAFA] flex flex-col ${mobilePreview ? '' : 'lg:flex-row'}`}>
      {!mobilePreview && (
        <TechSidebar
          currentRoute={techRoute}
          onNavigate={setTechRoute}
          techProfile={techProfile}
          onBrandClick={onBrandClick}
          onOpenStationSheet={() => {
            setTechRoute('guide');
            setTimeout(() => window.print(), 180);
          }}
          onNavigateCustomer={onNavigateCustomer}
        />
      )}

      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 z-20 bg-[#161114]/95 backdrop-blur-md border-b border-white/[0.08] px-4 py-2.5 flex items-center justify-between text-white">
        <button
          type="button"
          onClick={onBrandClick}
          className="text-left group cursor-pointer"
        >
          <BrandLogo
            variant="light"
            size="sm"
            badgeText="PRO"
            subtitle="TECH STATION"
          />
        </button>
        {onNavigateCustomer && (
          <button
            type="button"
            onClick={onNavigateCustomer}
            className="text-[11px] font-sans px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white transition flex items-center gap-1.5 cursor-pointer"
          >
            <Paintbrush className="w-3 h-3 text-[#E0246A]" />
            <span>Client Atelier</span>
          </button>
        )}
      </div>

      <main
        className={`flex-1 ${
          mobilePreview ? 'pb-24 px-4 pt-5' : 'lg:ml-64 min-h-screen pb-24 lg:pb-12 px-6 sm:px-8 lg:px-10 pt-6 sm:pt-8'
        }`}
      >
        <div className="w-full max-w-[1400px]">
          {techRoute === 'signup' && (
            <TechSignupView
              techProfile={techProfile}
              setTechProfile={setTechProfile}
              onSubmit={onTechSignupSubmit}
            />
          )}

          {techRoute === 'workspace' && (
            <TechWorkspaceView
              techProfile={techProfile}
              onLoadClientLink={onLoadClientLink}
              onUploadWhatsAppPhoto={onUploadWhatsAppPhoto}
            />
          )}

          {techRoute === 'guide' && (
            <TechGuideView
              activeSample={activeSample}
              activePhotoUrl={activePhotoUrl}
              techSourceLabel={techSourceLabel}
              activeSetName={activeSetName}
              orderedFingers={orderedFingers}
              techSelectedFinger={techSelectedFinger}
              setTechSelectedFinger={setTechSelectedFinger}
              nails={nails}
              techCompletedSteps={techCompletedSteps}
              setTechCompletedSteps={setTechCompletedSteps}
              onNewClientPhotoClick={() => setTechRoute('workspace')}
            />
          )}
        </div>
      </main>

      {/* Mobile Station Navigation Bar */}
      {(mobilePreview || true) && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-[#161114] border-t border-white/[0.08] px-4 py-2.5 z-30 flex items-center justify-around select-none">
          <button
            type="button"
            onClick={() => setTechRoute('guide')}
            className={`flex flex-col items-center gap-1 text-[10px] font-mono transition ${
              techRoute === 'guide'
                ? 'text-[#D4AF37] font-semibold'
                : 'text-[#A89B9F] hover:text-white'
            }`}
          >
            <ClipboardList className="w-4 h-4" strokeWidth={1.5} />
            <span>Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setTechRoute('workspace')}
            className={`flex flex-col items-center gap-1 text-[10px] font-mono transition ${
              techRoute === 'workspace'
                ? 'text-[#D4AF37] font-semibold'
                : 'text-[#A89B9F] hover:text-white'
            }`}
          >
            <Inbox className="w-4 h-4" strokeWidth={1.5} />
            <span>Workspace</span>
          </button>

          <button
            type="button"
            onClick={() => setTechRoute('signup')}
            className={`flex flex-col items-center gap-1 text-[10px] font-mono transition ${
              techRoute === 'signup'
                ? 'text-[#D4AF37] font-semibold'
                : 'text-[#A89B9F] hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" strokeWidth={1.5} />
            <span>Profile</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTechRoute('guide');
              setTimeout(() => window.print(), 180);
            }}
            className="flex flex-col items-center gap-1 text-[10px] font-mono text-[#A89B9F] hover:text-[#D4AF37] transition"
          >
            <Printer className="w-4 h-4" strokeWidth={1.5} />
            <span>Print</span>
          </button>

          {onNavigateCustomer && (
            <button
              type="button"
              onClick={onNavigateCustomer}
              className="flex flex-col items-center gap-1 text-[10px] font-mono text-[#A89B9F] hover:text-[#E0246A] transition cursor-pointer"
            >
              <Paintbrush className="w-4 h-4 text-[#E0246A]" strokeWidth={1.5} />
              <span>Client</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
