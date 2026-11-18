'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Wand2,
  Menu,
  X,
  Sparkles,
  SlidersHorizontal,
  Home,
  Monitor,
  Layers,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  ExploreDesignSet,
  Finger,
  NailDesign,
  NailShape,
  SkinTonePreset,
  ToastItem,
} from '@/types/nail';
import {
  FINGER_KEYS,
  FINGER_LABELS,
  HAND_SKIN_TONES,
  INITIAL_EXPLORE_DESIGNS,
  NAIL_FINISHES,
  NAIL_PATTERNS,
  COLOR_PALETTE,
} from '@/constants/nail-data';
import { ApplyAllModal } from '@/components/common/ApplyAllModal';
import { ToastContainer } from '@/components/common/ToastContainer';
import { AuthModal } from '@/components/common/AuthModal';
import { LandingSurface } from '@/components/surfaces/LandingSurface';
import { OnboardingSurface } from '@/components/surfaces/OnboardingSurface';
import { CustomerApp } from '@/components/surfaces/customer/CustomerApp';
import { CustomerRoute } from '@/components/surfaces/customer/CustomerSidebar';
import { subscribeToAuthChanges, getCurrentUser } from '@/lib/services/auth';
import { fetchExploreSets, getSetByPassportCode, saveUserManicureSet } from '@/lib/services/sets';
import { toggleSetFavorite } from '@/lib/services/favorites';
import { fetchUserProfile, updateUserProfile } from '@/lib/services/profile';
import { uploadInspoPhoto, uploadTryOnCapture } from '@/lib/services/storage';

export default function FingloraApp() {
  // Top-level Surface & Viewport State: defaults to Finglora mobile-first landing hero
  const [surface, setSurface] = useState<'landing' | 'onboarding' | 'customer'>('landing');
  const [mobilePreview, setMobilePreview] = useState(false);
  const [switcherMenuOpen, setSwitcherMenuOpen] = useState(false);
  const [customerRoute, setCustomerRoute] = useState<CustomerRoute>('home');
  const [supabaseUser, setSupabaseUser] = useState<any>(null);

  // Top-level Authentication Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signup' | 'signin'>('signup');

  // User & 2-Step Visual Onboarding State
  const [userName, setUserName] = useState('Elena');
  const [pendingPostSignupSetId, setPendingPostSignupSetId] = useState<string | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(1);
  const [onboardingSelectedIds, setOnboardingSelectedIds] = useState<string[]>(['set-blush-daisy']);
  const [preferredShape, setPreferredShape] = useState<NailShape>('almond');
  const [aiStudioPrompt, setAiStudioPrompt] = useState('');

  // Explore Gallery State
  const [exploreDesigns, setExploreDesigns] = useState<ExploreDesignSet[]>(INITIAL_EXPLORE_DESIGNS);
  const [exploreCategory, setExploreCategory] = useState('All');
  const [exploreSearch, setExploreSearch] = useState('');

  // Active Five-Finger Set State (Persisted to localStorage)
  const [activeSetId, setActiveSetId] = useState(INITIAL_EXPLORE_DESIGNS[0].id);
  const [activePassportCode, setActivePassportCode] = useState(INITIAL_EXPLORE_DESIGNS[0].passportCode);
  const [activeSetName, setActiveSetName] = useState(INITIAL_EXPLORE_DESIGNS[0].title);
  const [activePhotoUrl, setActivePhotoUrl] = useState(INITIAL_EXPLORE_DESIGNS[0].photoUrl);
  const [handOrientation, setHandOrientation] = useState<'left' | 'right'>('right');
  const [selectedFinger, setSelectedFinger] = useState<Finger>('ring');
  const [swapMode, setSwapMode] = useState(false);
  const [swapFirstFinger, setSwapFirstFinger] = useState<Finger | null>(null);
  const [nails, setNails] = useState<Record<Finger, NailDesign>>(() =>
    JSON.parse(JSON.stringify(INITIAL_EXPLORE_DESIGNS[0].nails))
  );
  const [fingerHistory, setFingerHistory] = useState<Partial<Record<Finger, NailDesign[]>>>({});
  const [showApplyAllModal, setShowApplyAllModal] = useState(false);

  // Inspiration Extraction Cache (pre-seeded with all explore lookbook designs)
  const [inspoCache, setInspoCache] = useState<
    Record<
      string,
      {
        id: string;
        title: string;
        photoUrl: string;
        passportCode: string;
        nails: Record<Finger, NailDesign>;
      }
    >
  >(() => {
    const initial: Record<
      string,
      {
        id: string;
        title: string;
        photoUrl: string;
        passportCode: string;
        nails: Record<Finger, NailDesign>;
      }
    > = {};
    INITIAL_EXPLORE_DESIGNS.forEach((d) => {
      const entry = {
        id: d.id,
        title: d.title,
        photoUrl: d.photoUrl,
        passportCode: d.passportCode,
        nails: JSON.parse(JSON.stringify(d.nails)),
      };
      initial[d.id] = entry;
      initial[d.photoUrl] = entry;
    });
    return initial;
  });

  // Extraction Animation State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(5);
  const [isAnalyzingCached, setIsAnalyzingCached] = useState(false);

  // Virtual Try-On & Live Camera State
  const [tryOnMode, setTryOnMode] = useState<'camera' | 'upload' | 'sample'>('camera');
  const [cameraStatus, setCameraStatus] = useState<
    'idle' | 'starting' | 'live' | 'simulated' | 'captured'
  >('idle');
  const [cameraErrorNote, setCameraErrorNote] = useState('');
  const [capturedFrameUrl, setCapturedFrameUrl] = useState<string | null>(null);
  const [overlayScale, setOverlayScale] = useState(100);
  const [overlayOffsetY, setOverlayOffsetY] = useState(0);
  const [skinToneId, setSkinToneId] = useState('warm-ivory');
  const [customTryOnHandUrl, setCustomTryOnHandUrl] = useState<string | null>(null);
  const [tryOnView, setTryOnView] = useState<'after' | 'before'>('after');
  const [tryOnZoom, setTryOnZoom] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);



  // Toast Notifications
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (text: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  // Hydrate Design Session from localStorage and Supabase on Mount
  useEffect(() => {
    // Local storage hydration for immediate instant UI response
    try {
      const saved = window.localStorage.getItem('finglora_session_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nails) setNails(parsed.nails);
        if (parsed.activeSetName) setActiveSetName(parsed.activeSetName);
        if (parsed.activeSetId) setActiveSetId(parsed.activeSetId);
        if (parsed.activePassportCode) setActivePassportCode(parsed.activePassportCode);
        if (parsed.activePhotoUrl) setActivePhotoUrl(parsed.activePhotoUrl);
        if (parsed.preferredShape) setPreferredShape(parsed.preferredShape);
        if (parsed.userName) setUserName(parsed.userName);
      }
      const savedHand = window.localStorage.getItem('finglora_custom_hand_photo');
      if (savedHand) {
        setCustomTryOnHandUrl(savedHand);
      }
    } catch {
      // Ignore storage errors
    }

    // 1. Fetch live curated explore sets from Supabase
    fetchExploreSets().then((sets) => {
      if (sets && sets.length > 0) {
        setExploreDesigns(sets);
      }
    });

    // 2. Subscribe to Supabase Auth Changes
    const subscription = subscribeToAuthChanges(async (event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          if (profile.displayName) setUserName(profile.displayName);
          if (profile.preferredShape) setPreferredShape(profile.preferredShape);
          if (profile.customHandUrl) setCustomTryOnHandUrl(profile.customHandUrl);
        }

        // Re-fetch explore sets with user's specific favorites
        const userSets = await fetchExploreSets(session.user.id);
        if (userSets && userSets.length > 0) {
          setExploreDesigns(userSets);
        }

        // Guest to Authenticated sync: if user customized nails while guest, save them to their account
        try {
          const localSaved = window.localStorage.getItem('finglora_session_v1');
          if (localSaved) {
            const parsed = JSON.parse(localSaved);
            if (parsed.nails && parsed.activePassportCode) {
              await saveUserManicureSet({
                userId: session.user.id,
                passportCode: parsed.activePassportCode,
                title: parsed.activeSetName || 'My Custom Set',
                photoUrl: parsed.activePhotoUrl || '/images/ar-nail-hero.jpg',
                nails: parsed.nails,
              });
            }
          }
        } catch {
          // ignore auto-migration error
        }
      } else {
        setSupabaseUser(null);
      }
    });

    // 3. Check for passport code in URL query (?passport=FGL-XXXX or ?code=FGL-XXXX)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('passport') || params.get('code');
      if (code) {
        getSetByPassportCode(code).then((foundSet) => {
          if (foundSet) {
            setActiveSetId(foundSet.id);
            setActivePassportCode(foundSet.passportCode);
            setActiveSetName(foundSet.title);
            setActivePhotoUrl(foundSet.photoUrl);
            setNails(foundSet.nails);
            showToast(`Loaded Design Passport #${foundSet.passportCode}`);
            navigateCustomer('tryon');
          }
        });
      }
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Persist Design Session to localStorage and debounced Supabase sync
  useEffect(() => {
    try {
      window.localStorage.setItem(
        'finglora_session_v1',
        JSON.stringify({
          nails,
          activeSetName,
          activeSetId,
          activePassportCode,
          activePhotoUrl,
          preferredShape,
          userName,
        })
      );
    } catch {
      // Ignore storage quota errors
    }

    // Debounced sync to Supabase if user is authenticated
    if (supabaseUser?.id) {
      const timer = setTimeout(() => {
        saveUserManicureSet({
          userId: supabaseUser.id,
          passportCode: activePassportCode,
          title: activeSetName,
          photoUrl: activePhotoUrl,
          nails,
          skinToneId,
        }).catch((err) => console.warn('Supabase auto-save skipped:', err.message));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [nails, activeSetName, activeSetId, activePassportCode, activePhotoUrl, preferredShape, userName, supabaseUser, skinToneId]);

  // Camera Cleanup Helper
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopCameraStream();
  }, []);

  useEffect(() => {
    if (cameraStatus === 'live' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraStatus, tryOnMode]);

  const startLiveCamera = async () => {
    stopCameraStream();
    setTryOnMode('camera');
    setCameraStatus('starting');
    setCameraErrorNote('');

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('simulated');
      setCameraErrorNote('Camera API unavailable — Interactive Camera Simulator active');
      showToast('Using Interactive Camera Simulator');
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
      setCameraStatus('live');
      showToast('Live camera active — align your fingers with the guide');
    } catch {
      setCameraStatus('simulated');
      setCameraErrorNote('Camera permission blocked — Interactive Camera Simulator active');
      showToast('Camera blocked — switched to Interactive Camera Simulator');
    }
  };

  const captureCameraFrame = () => {
    if (cameraStatus === 'live' && videoRef.current && videoRef.current.videoWidth > 0) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const frame = canvas.toDataURL('image/jpeg', 0.92);
        setCapturedFrameUrl(frame);
        // Persist frame to Supabase Storage
        uploadTryOnCapture(frame, supabaseUser?.id).catch(() => {});
      }
    } else {
      setCapturedFrameUrl(null);
    }
    stopCameraStream();
    setCameraStatus('captured');
    setTryOnView('after');
    showToast('Hand captured! Five custom nails mapped onto your hand.');
  };

  const orderedFingers =
    handOrientation === 'left' ? [...FINGER_KEYS].reverse() : [...FINGER_KEYS];
  const activeSample =
    exploreDesigns.find((d) => d.id === activeSetId) || exploreDesigns[0];
  const activeSkinTone: SkinTonePreset =
    HAND_SKIN_TONES.find((t) => t.id === skinToneId) || HAND_SKIN_TONES[1];

  // Sync URL route on initial page load and on browser Back/Forward (popstate)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const parsePath = () => {
      const raw = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
      if (raw === 'onboarding') {
        setSurface('onboarding');
      } else if (raw === 'favorites' || raw === 'saved') {
        setCustomerRoute('favorites');
        setSurface('customer');
      } else if (raw === 'tryon' || raw === 'try-on') {
        setCustomerRoute('tryon');
        setSurface('customer');
      } else if (raw === 'explore' || raw === 'gallery') {
        setCustomerRoute('explore');
        setSurface('customer');
      } else if (raw === 'upload') {
        setCustomerRoute('upload');
        setSurface('customer');
      } else if (raw === 'ai-create' || raw === 'create') {
        setCustomerRoute('ai-create');
        setSurface('customer');
      } else if (raw === 'profile' || raw === 'account') {
        setCustomerRoute('profile');
        setSurface('customer');
      } else if (raw === 'home') {
        setCustomerRoute('home');
        setSurface('customer');
      }
    };

    parsePath();

    const handlePopState = (e: PopStateEvent) => {
      if (e.state?.surface) {
        setSurface(e.state.surface);
        if (e.state.route) setCustomerRoute(e.state.route);
      } else {
        parsePath();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Action Helpers
  const navigateCustomer = (route: CustomerRoute, updateUrl = true) => {
    if (customerRoute === 'tryon' && route !== 'tryon') stopCameraStream();
    setCustomerRoute(route);
    setSwapMode(false);
    setSwapFirstFinger(null);
    setSurface('customer');
    if (updateUrl && typeof window !== 'undefined') {
      const path = route === 'home' ? '/' : `/${route}`;
      if (window.location.pathname !== path) {
        window.history.pushState({ surface: 'customer', route }, '', path);
      }
    }
  };

  const navigateSurface = (nextSurface: 'landing' | 'onboarding' | 'customer', nextRoute?: CustomerRoute, updateUrl = true) => {
    if (nextSurface !== 'customer') stopCameraStream();
    setSurface(nextSurface);
    if (nextRoute) setCustomerRoute(nextRoute);
    if (updateUrl && typeof window !== 'undefined') {
      let path = '/';
      if (nextSurface === 'onboarding') path = '/onboarding';
      else if (nextSurface === 'customer') path = (nextRoute || customerRoute) === 'home' ? '/' : `/${nextRoute || customerRoute}`;
      if (window.location.pathname !== path) {
        window.history.pushState({ surface: nextSurface, route: nextRoute || customerRoute }, '', path);
      }
    }
  };

  const handleAuthSignUpSuccess = ({ name }: { name: string; email: string }) => {
    const chosenName = name || 'Elena';
    setUserName(chosenName);
    setOnboardingStep(1);
    showToast(`Account created, ${chosenName}! Let's personalize your style...`);
    navigateSurface('onboarding');
  };

  const handleAuthSignInSuccess = () => {
    showToast(`Welcome back, ${userName}! Opening your dashboard...`);
    navigateCustomer('home');
  };

  const extractFromInspirationHand = (designIdOrUrl: string, targetRoute: CustomerRoute = 'tryon') => {
    const cached =
      inspoCache[designIdOrUrl] ||
      exploreDesigns.find((d) => d.id === designIdOrUrl || d.photoUrl === designIdOrUrl);
    if (!cached) return;

    setActiveSetId(cached.id);
    setActivePassportCode(cached.passportCode);
    setActiveSetName(cached.title);
    setActivePhotoUrl(cached.photoUrl);
    setNails(JSON.parse(JSON.stringify(cached.nails)));
    setFingerHistory({});
    setSelectedFinger('ring');

    // Route to AI analysing page with instant cache recognition
    setIsAnalyzingCached(true);
    setIsAnalyzing(true);
    setAnalysisStep(5);
    navigateCustomer('upload');
  };

  const runHandExtractionDemo = (
    designId: string,
    customUploadedUrl?: string
  ) => {
    const cacheKey = customUploadedUrl || designId;
    const cached = inspoCache[cacheKey];

    // If previously cached: instant recognition & fast-track
    if (cached) {
      setActiveSetId(cached.id);
      setActivePassportCode(cached.passportCode);
      setActiveSetName(cached.title);
      setActivePhotoUrl(cached.photoUrl);
      setNails(JSON.parse(JSON.stringify(cached.nails)));
      setIsAnalyzingCached(true);
      setIsAnalyzing(true);
      setAnalysisStep(5);
      navigateCustomer('upload');
      return;
    }

    // New Image Upload / Extraction Flow: runs 5-step detection and saves to cache
    const baseSample = exploreDesigns.find((d) => d.id === designId) || exploreDesigns[0];
    const newPassport = `FGL-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTitle = customUploadedUrl ? 'Custom Hand Inspo' : baseSample.title;
    const newPhotoUrl = customUploadedUrl || baseSample.photoUrl;

    setActiveSetId(customUploadedUrl ? `custom-${Date.now()}` : baseSample.id);
    setActivePassportCode(newPassport);
    setActiveSetName(newTitle);
    setActivePhotoUrl(newPhotoUrl);
    setNails(JSON.parse(JSON.stringify(baseSample.nails)));

    setIsAnalyzingCached(false);
    setIsAnalyzing(true);
    setAnalysisStep(0);
    navigateCustomer('upload');

    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      setAnalysisStep(step);
      if (step >= 5) {
        clearInterval(timer);
        setTimeout(() => {
          // Persist extracted manicure set into cache
          const extractedEntry = {
            id: cacheKey,
            title: newTitle,
            photoUrl: newPhotoUrl,
            passportCode: newPassport,
            nails: JSON.parse(JSON.stringify(baseSample.nails)),
          };
          setInspoCache((prev) => ({
            ...prev,
            [cacheKey]: extractedEntry,
            [newPhotoUrl]: extractedEntry,
          }));

          setIsAnalyzing(false);
          showToast('5 individual nail designs extracted & saved to cache!');
          navigateCustomer('tryon');
        }, 420);
      }
    }, 280);
  };

  const handleOnboardingSelectSet = (setId: string, customUrl?: string) => {
    const found = exploreDesigns.find((d) => d.id === setId) || exploreDesigns[0];
    setActiveSetId(found.id);
    setActivePassportCode(found.passportCode);
    setActiveSetName(customUrl ? 'Custom Inspo Look' : found.title);
    setActivePhotoUrl(customUrl || found.photoUrl);
    const cloned = JSON.parse(JSON.stringify(found.nails)) as Record<Finger, NailDesign>;
    FINGER_KEYS.forEach((fk) => {
      cloned[fk].shape = preferredShape;
    });
    setNails(cloned);
  };

  const handleOnboardingTryOnCamera = () => {
    setSurface('customer');
    setCustomerRoute('tryon');
    startLiveCamera();
    showToast('Live AR Camera active! Custom nails mapped to hand.');
  };

  const handleOnboardingTryOnHandPhoto = (customUrl?: string) => {
    setSurface('customer');
    setCustomerRoute('tryon');
    setTryOnMode(customUrl ? 'upload' : 'sample');
    if (customUrl) setCustomTryOnHandUrl(customUrl);
    showToast('Virtual Try-On ready! Previewing on hand.');
  };

  const completeVisualOnboarding = (skipped = false) => {
    const chosenId =
      pendingPostSignupSetId || onboardingSelectedIds[0] || exploreDesigns[0].id;
    const matched =
      exploreDesigns.find((d) => d.id === chosenId) || exploreDesigns[0];
    setActiveSetId(matched.id);
    setActivePassportCode(matched.passportCode);
    setActiveSetName(matched.title);
    setActivePhotoUrl(matched.photoUrl);
    const cloned = JSON.parse(JSON.stringify(matched.nails)) as Record<Finger, NailDesign>;
    FINGER_KEYS.forEach((fk) => {
      cloned[fk].shape = preferredShape;
    });
    setNails(cloned);
    setFingerHistory({});
    setSelectedFinger('ring');
    setPendingPostSignupSetId(null);
    setOnboardingStep(1);
    showToast(
      skipped
        ? `Welcome ${userName}! Your curated studio is ready.`
        : `Curated "${matched.title}" in your ${preferredShape} shape!`
    );
    navigateCustomer('home');
  };

  const handleSelectFinger = (fk: Finger) => {
    if (swapMode) {
      if (!swapFirstFinger) {
        setSwapFirstFinger(fk);
        showToast(`Selected ${FINGER_LABELS[fk]}. Tap another finger to swap.`);
        return;
      }
      if (swapFirstFinger === fk) {
        setSwapFirstFinger(null);
        return;
      }
      setNails((prev) => ({
        ...prev,
        [swapFirstFinger]: { ...prev[fk], finger: swapFirstFinger },
        [fk]: { ...prev[swapFirstFinger], finger: fk },
      }));
      showToast(`Swapped ${FINGER_LABELS[swapFirstFinger]} and ${FINGER_LABELS[fk]}`);
      setSwapMode(false);
      setSwapFirstFinger(null);
      setSelectedFinger(fk);
      return;
    }
    setSelectedFinger(fk);
  };

  const updateActiveFinger = (patch: Partial<NailDesign>) => {
    setFingerHistory((prev) => ({
      ...prev,
      [selectedFinger]: [...(prev[selectedFinger] || []), JSON.parse(JSON.stringify(nails[selectedFinger]))],
    }));
    setNails((prev) => ({
      ...prev,
      [selectedFinger]: { ...prev[selectedFinger], ...patch, status: 'edited' },
    }));
  };

  const undoFingerEdit = () => {
    const stack = fingerHistory[selectedFinger] || [];
    if (stack.length === 0) {
      showToast(`No recent changes to undo on ${FINGER_LABELS[selectedFinger]}`);
      return;
    }
    const previous = stack[stack.length - 1];
    setFingerHistory((prev) => ({
      ...prev,
      [selectedFinger]: stack.slice(0, -1),
    }));
    setNails((prev) => ({ ...prev, [selectedFinger]: previous }));
    showToast(`Undid last edit on ${FINGER_LABELS[selectedFinger]}`);
  };

  const regenerateSingleFinger = (fk: Finger) => {
    setFingerHistory((prev) => ({
      ...prev,
      [fk]: [...(prev[fk] || []), JSON.parse(JSON.stringify(nails[fk]))],
    }));
    const current = nails[fk];
    const patternIds = NAIL_PATTERNS.map((p) => p.id);
    const hexes = COLOR_PALETTE.map((c) => c.hex);
    const finishIds = NAIL_FINISHES.map((f) => f.id);
    setNails((prev) => ({
      ...prev,
      [fk]: {
        ...current,
        title: `${FINGER_LABELS[fk]} Custom Variation`,
        pattern: patternIds[(patternIds.indexOf(current.pattern) + 1) % patternIds.length],
        accentColor: hexes[(hexes.indexOf(current.accentColor) + 2) % hexes.length],
        finish: finishIds[(finishIds.indexOf(current.finish) + 1) % finishIds.length],
        status: 'edited',
      },
    }));
    showToast(`Regenerated ${FINGER_LABELS[fk]} only — other 4 nails untouched`);
  };

  const applySelectedToAllFive = () => {
    const source = nails[selectedFinger];
    const updated = {} as Record<Finger, NailDesign>;
    FINGER_KEYS.forEach((fk) => {
      updated[fk] = { ...JSON.parse(JSON.stringify(source)), finger: fk, status: 'edited' };
    });
    setNails(updated);
    setShowApplyAllModal(false);
    showToast(`Applied ${FINGER_LABELS[selectedFinger]} style to all 5 nails`);
  };

  const copyShareLink = () => {
    const url = `https://finglora.app/p/${activePassportCode}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    showToast(`Copied shareable link: ${url}`);
  };

  const handleUpdateCustomHandPhoto = (url: string | null) => {
    setCustomTryOnHandUrl(url);
    try {
      if (url) {
        window.localStorage.setItem('finglora_custom_hand_photo', url);
        setTryOnMode('upload');
      } else {
        window.localStorage.removeItem('finglora_custom_hand_photo');
      }
    } catch {
      // ignore storage quota error
    }
  };

  return (
    <div
      className={`min-h-screen ${
        surface === 'landing' ? 'bg-white' : 'bg-[#FFFAF8]'
      } text-[#281720] font-sans selection:bg-[#E0246A]/20`}
    >
      {/* Frame Wrapper */}
      <div
        className={
          mobilePreview
            ? 'max-w-[412px] mx-auto my-6 rounded-[38px] border-[10px] border-[#281720] shadow-2xl overflow-x-hidden min-h-[812px] relative bg-white'
            : surface === 'landing'
            ? 'min-h-screen bg-white'
            : 'min-h-screen bg-[#FFFAF8]'
        }
      >
        {surface === 'landing' && (
          <LandingSurface
            exploreDesigns={exploreDesigns}
            mobilePreview={mobilePreview}
            onOnboardingClick={() => navigateSurface('onboarding')}
            onExploreClick={() => navigateSurface('onboarding')}
            onTryOnClick={() => navigateCustomer('tryon')}
            onSignInClick={() => {
              setAuthModalMode('signin');
              setAuthModalOpen(true);
            }}
            onSignUpClick={() => {
              setAuthModalMode('signup');
              setAuthModalOpen(true);
            }}
            onStudioClick={() => navigateCustomer('tryon')}
            onSelectNail={(fk) => {
              setSelectedFinger(fk);
              navigateSurface('onboarding');
            }}
            onSaveAndCustomize={(setId) => {
              setPendingPostSignupSetId(setId);
              navigateSurface('onboarding');
            }}
          />
        )}

        {surface === 'onboarding' && (
          <OnboardingSurface
            userName={userName}
            preferredShape={preferredShape}
            setPreferredShape={setPreferredShape}
            exploreDesigns={exploreDesigns}
            mobilePreview={mobilePreview}
            onSelectInspoSet={handleOnboardingSelectSet}
            onSkipToAtelier={() => navigateCustomer('home')}
            onContinueToStudio={() => navigateCustomer('home')}
            onBrandClick={() => navigateSurface('landing')}
          />
        )}

        {surface === 'customer' && (
          <CustomerApp
            customerRoute={customerRoute}
            setCustomerRoute={navigateCustomer}
            mobilePreview={mobilePreview}
            userName={userName}
            setUserName={setUserName}
            preferredShape={preferredShape}
            setPreferredShape={setPreferredShape}
            activeSample={activeSample}
            activePhotoUrl={activePhotoUrl}
            setActivePhotoUrl={setActivePhotoUrl}
            activeSetName={activeSetName}
            setActiveSetName={setActiveSetName}
            activePassportCode={activePassportCode}
            orderedFingers={orderedFingers}
            selectedFinger={selectedFinger}
            setSelectedFinger={setSelectedFinger}
            swapMode={swapMode}
            setSwapMode={setSwapMode}
            swapFirstFinger={swapFirstFinger}
            nails={nails}
            setNails={setNails}
            aiStudioPrompt={aiStudioPrompt}
            setAiStudioPrompt={setAiStudioPrompt}
            exploreDesigns={exploreDesigns}
            setExploreDesigns={setExploreDesigns}
            exploreCategory={exploreCategory}
            setExploreCategory={setExploreCategory}
            exploreSearch={exploreSearch}
            setExploreSearch={setExploreSearch}
            isAnalyzing={isAnalyzing}
            analysisStep={analysisStep}
            isAnalyzingCached={isAnalyzingCached}
            setIsAnalyzing={setIsAnalyzing}
            handOrientation={handOrientation}
            setHandOrientation={setHandOrientation}
            tryOnMode={tryOnMode}
            setTryOnMode={setTryOnMode}
            cameraStatus={cameraStatus}
            cameraErrorNote={cameraErrorNote}
            capturedFrameUrl={capturedFrameUrl}
            videoRef={videoRef}
            onStartLiveCamera={startLiveCamera}
            onCaptureCameraFrame={captureCameraFrame}
            onCancelCamera={() => {
              stopCameraStream();
              setCameraStatus('idle');
            }}
            tryOnView={tryOnView}
            setTryOnView={setTryOnView}
            customTryOnHandUrl={customTryOnHandUrl}
            setCustomTryOnHandUrl={handleUpdateCustomHandPhoto}
            overlayScale={overlayScale}
            setOverlayScale={setOverlayScale}
            overlayOffsetY={overlayOffsetY}
            setOverlayOffsetY={setOverlayOffsetY}
            tryOnZoom={tryOnZoom}
            setTryOnZoom={setTryOnZoom}
            skinToneId={skinToneId}
            setSkinToneId={setSkinToneId}
            activeSkinTone={activeSkinTone}
            onBrandClick={() => navigateSurface('landing')}
            onTuneVibeClick={() => navigateSurface('onboarding')}
            onSelectFinger={handleSelectFinger}
            onRegenerateFinger={regenerateSingleFinger}
            onUndoFingerEdit={undoFingerEdit}
            onUpdateActiveFinger={updateActiveFinger}
            onOpenApplyAllModal={() => setShowApplyAllModal(true)}
            onImageSelectedForExtraction={async (file) => {
              try {
                const cloudUrl = await uploadInspoPhoto(file, supabaseUser?.id);
                runHandExtractionDemo('set-berry-aura', cloudUrl);
              } catch {
                runHandExtractionDemo('set-berry-aura', URL.createObjectURL(file));
              }
            }}
            onSampleExtractionDemo={() => runHandExtractionDemo('set-blush-daisy')}
            onSelectExploreDesign={(id) => extractFromInspirationHand(id, 'tryon')}
            onCopyShareLink={copyShareLink}
            onCustomerSignUpSubmit={() => {
              setOnboardingStep(1);
              showToast(`Account created, ${userName}! Quick 2-step vibe check...`);
              navigateSurface('onboarding');
            }}
          />
        )}
      </div>

      {/* Apply to All Modal */}
      {showApplyAllModal && (
        <ApplyAllModal
          fingerLabel={FINGER_LABELS[selectedFinger]}
          onCancel={() => setShowApplyAllModal(false)}
          onConfirm={applySelectedToAllFive}
        />
      )}

      {/* Test Dock disabled */}
      {false && (
        <div className="fixed bottom-20 right-4 md:bottom-5 md:left-5 md:right-auto z-40 select-none">
        {switcherMenuOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs md:static md:bg-transparent md:p-0 md:mb-2.5">
            <div className="w-full max-w-sm sm:w-88 bg-[#18181B]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-3.5 text-white animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#E0246A] flex items-center justify-center text-white text-[10px] font-bold">
                    F
                  </span>
                  <div>
                    <span className="font-serif text-xs tracking-wider uppercase font-medium text-white block leading-none">
                      Atelier Preview Navigator
                    </span>
                    <span className="text-[9.5px] text-white/50 block mt-0.5">
                      Surface switcher & device toggle
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSwitcherMenuOpen(false)}
                  className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                  aria-label="Close switcher"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Surface options list */}
              <div className="space-y-1.5">
                {(
                  [
                    {
                      id: 'landing' as const,
                      label: 'Landing',
                      desc: 'Camera try-on, photo upload & featured styles',
                      icon: Sparkles,
                    },
                    {
                      id: 'onboarding' as const,
                      label: 'Style Setup',
                      desc: 'Design pick, shape selection & live try-on',
                      icon: SlidersHorizontal,
                    },
                    {
                      id: 'customer' as const,
                      label: 'Customer Studio',
                      desc: '5-finger customizer, live try-on & favorites',
                      icon: Home,
                    },
                  ]
                ).map((tab) => {
                  const active = surface === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        if (tab.id !== 'customer') stopCameraStream();
                        setSurface(tab.id);
                        setSwitcherMenuOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between cursor-pointer ${
                        active
                          ? 'bg-[#E0246A] text-white font-medium shadow-sm'
                          : 'bg-white/[0.04] text-white/80 hover:bg-white/[0.08] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            active ? 'bg-white/20' : 'bg-white/[0.08]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold leading-tight truncate">
                            {tab.label}
                          </div>
                          <div
                            className={`text-[10px] leading-tight mt-0.5 truncate ${
                              active ? 'text-white/85' : 'text-white/50'
                            }`}
                          >
                            {tab.desc}
                          </div>
                        </div>
                      </div>
                      {active && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-bold shrink-0 ml-2">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Frame Viewport Toggle */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-white/60">Device frame:</span>
                <button
                  type="button"
                  onClick={() => setMobilePreview((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/[0.08] hover:bg-white/[0.14] text-white transition border border-white/10 cursor-pointer"
                >
                  {mobilePreview ? (
                    <>
                      <Monitor className="w-3.5 h-3.5 text-[#E0246A]" />
                      <span>Mobile Frame (Active)</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-3.5 h-3.5 text-white/70" />
                      <span>Full Desktop</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Capsule Button Launcher */}
        <button
          type="button"
          onClick={() => setSwitcherMenuOpen((v) => !v)}
          className="group px-3 py-2 md:px-3.5 rounded-full bg-[#18181B]/95 hover:bg-[#18181B] text-white border border-white/15 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.35)] backdrop-blur-xl flex items-center gap-2 transition-all duration-200 hover:scale-[1.03] cursor-pointer"
          title="Switch test surfaces (Landing, Onboarding, Customer Studio)"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E0246A] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E0246A]" />
          </span>
          <Layers className="w-3.5 h-3.5 text-[#E0246A]" />
          <span className="text-xs font-medium text-white/90 capitalize hidden sm:inline">
            {surface === 'onboarding'
              ? 'Style Setup'
              : surface === 'landing'
              ? 'Landing'
              : 'Customer Studio'}
          </span>
          <span className="text-[10px] text-white/40 border-l border-white/15 pl-2 group-hover:text-white/70 transition hidden sm:inline">
            Test Dock
          </span>
          {switcherMenuOpen ? (
            <ChevronDown className="w-3 h-3 text-white/50" />
          ) : (
            <ChevronUp className="w-3 h-3 text-white/50" />
          )}
        </button>
      </div>
      )}

      {/* Global Authentication Modal (Sign Up & Sign In with Google & Email) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSignUpSuccess={handleAuthSignUpSuccess}
        onSignInSuccess={handleAuthSignInSuccess}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
