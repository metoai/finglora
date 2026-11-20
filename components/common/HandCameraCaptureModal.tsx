'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Camera,
  RotateCcw,
  Check,
  X,
  UploadCloud,
  FlipHorizontal,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface HandCameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureHand: (dataUrl: string) => void;
  onUploadFileFallback?: (file: File) => void;
}

export function HandCameraCaptureModal({
  isOpen,
  onClose,
  onCaptureHand,
  onUploadFileFallback,
}: HandCameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileFallbackInputRef = useRef<HTMLInputElement>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraState, setCameraState] = useState<'starting' | 'live' | 'captured' | 'error'>('starting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);

  // Stop current active media stream tracks
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Initialize and start live camera stream
  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    stopStream();
    setCameraState('starting');
    setErrorMessage(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraState('error');
      setErrorMessage('Camera is not supported on this browser or device.');
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch {
        // Fallback without exact constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraState('live');
    } catch (err: unknown) {
      setCameraState('error');
      if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        setErrorMessage('Camera access was denied. Please allow camera permissions in your browser or upload a photo from your gallery.');
      } else {
        setErrorMessage('Unable to connect to your camera. Please check your device camera or upload a photo.');
      }
    }
  }, [stopStream]);

  // Handle modal open/close lifecycle
  useEffect(() => {
    if (isOpen) {
      setCapturedDataUrl(null);
      startCamera(facingMode);
    } else {
      stopStream();
      setCapturedDataUrl(null);
      setCameraState('starting');
    }

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, startCamera, stopStream]);

  // Flip camera between environment (rear) and user (front)
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture current video frame to canvas
  const handleSnapPhoto = () => {
    if (!videoRef.current || videoRef.current.videoWidth === 0) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If using user-facing camera, mirror the frame horizontally so it looks natural
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    setCapturedDataUrl(dataUrl);
    setCameraState('captured');
  };

  // Retake photo: clear snapshot and resume live camera
  const handleRetake = () => {
    setCapturedDataUrl(null);
    setCameraState('live');
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    } else {
      startCamera(facingMode);
    }
  };

  // Confirm photo: use captured snapshot
  const handleConfirmPhoto = () => {
    if (!capturedDataUrl) return;
    onCaptureHand(capturedDataUrl);
    stopStream();
    onClose();
  };

  // Handle file fallback
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        onCaptureHand(dataUrl);
        onUploadFileFallback?.(file);
        stopStream();
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Hidden File Input for fallback */}
      <input
        ref={fileFallbackInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="relative w-full max-w-md sm:max-w-lg bg-stone-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 z-20 bg-stone-900/90 backdrop-blur-xs">
          <div>
            <h3 className="font-serif text-lg font-normal text-white">
              {cameraState === 'captured' ? 'Confirm Your Photo' : 'Capture Your Hand'}
            </h3>
            <p className="text-[11px] text-stone-400">
              {cameraState === 'captured'
                ? 'Check hand position and clarity'
                : 'Hold your hand flat facing the camera'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {cameraState === 'live' && (
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-200 transition-colors cursor-pointer"
                title="Flip camera"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                stopStream();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 hover:text-white transition-colors cursor-pointer"
              title="Close camera"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewfinder / Captured Frame Viewport */}
        <div className="relative aspect-[3/4] w-full bg-black flex items-center justify-center overflow-hidden">
          {/* Live Video Element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-200 ${
              cameraState === 'live' ? 'opacity-100' : 'opacity-0 absolute'
            } ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />

          {/* Captured Freeze-Frame Snapshot */}
          {cameraState === 'captured' && capturedDataUrl && (
            <img
              src={capturedDataUrl}
              alt="Captured hand frame"
              className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-200"
            />
          )}

          {/* Hand Alignment Silhouette Guide (Only visible during live camera) */}
          {cameraState === 'live' && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 z-10">
              {/* Hand Guide Oval / Outline */}
              <div className="relative w-56 h-76 sm:w-64 sm:h-84 rounded-[42px] border-2 border-dashed border-[#E0246A]/80 shadow-[0_0_24px_rgba(224,36,106,0.25)] flex items-center justify-center">
                {/* Center Hand Marker */}
                <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center opacity-40">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>

              {/* Minimal floating prompt */}
              <div className="mt-4 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-xs font-medium tracking-wide border border-white/10">
                Fit hand inside the guide
              </div>
            </div>
          )}

          {/* Starting / Loading Spinner */}
          {cameraState === 'starting' && (
            <div className="flex flex-col items-center justify-center gap-3 text-stone-300">
              <Loader2 className="w-8 h-8 animate-spin text-[#E0246A]" />
              <span className="text-xs font-medium tracking-wide">Starting camera...</span>
            </div>
          )}

          {/* Error State */}
          {cameraState === 'error' && (
            <div className="p-6 text-center space-y-4 max-w-xs">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-white">Camera Unavailable</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {errorMessage || 'Could not start your device camera.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileFallbackInputRef.current?.click()}
                className="w-full h-11 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-medium inline-flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Hand Photo Instead</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Bottom Controls */}
        <div className="px-5 py-4 border-t border-white/10 bg-stone-900/95 z-20">
          {cameraState === 'captured' ? (
            /* Review State: Retake vs Use This Photo */
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="h-12 rounded-2xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs sm:text-sm font-medium transition inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-4 h-4 text-stone-300" />
                  <span>Retake</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmPhoto}
                  className="h-12 rounded-2xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs sm:text-sm font-semibold transition inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-lg shadow-[#E0246A]/30"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span>Use This Photo</span>
                </button>
              </div>
              <p className="text-center text-[11px] text-stone-400">
                This photo will be saved as your personal hand model for try-ons.
              </p>
            </div>
          ) : cameraState === 'live' ? (
            /* Live State: Shutter Button + Alternative Upload Option */
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="flex items-center justify-center w-full relative">
                {/* Shutter Button */}
                <button
                  type="button"
                  onClick={handleSnapPhoto}
                  className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full border-4 border-white/30 hover:border-white/50 flex items-center justify-center cursor-pointer transition active:scale-90"
                  title="Take photo"
                >
                  <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#E0246A] hover:bg-[#BE185D] shadow-lg flex items-center justify-center transition">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </button>

                {/* Or Upload Button (Right Aligned) */}
                <button
                  type="button"
                  onClick={() => fileFallbackInputRef.current?.click()}
                  className="absolute right-0 text-xs text-stone-400 hover:text-stone-200 inline-flex items-center gap-1.5 transition cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-white/5"
                  title="Upload from device"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span className="hidden sm:inline">Upload File</span>
                </button>
              </div>

              <span className="text-[11px] text-stone-400 text-center">
                Tap to snap photo when your hand is aligned
              </span>
            </div>
          ) : (
            /* Starting or Error footer */
            <div className="flex items-center justify-between text-xs text-stone-400">
              <button
                type="button"
                onClick={() => fileFallbackInputRef.current?.click()}
                className="hover:text-white inline-flex items-center gap-1.5 cursor-pointer transition"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload from device instead</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopStream();
                  onClose();
                }}
                className="hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
