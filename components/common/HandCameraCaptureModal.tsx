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
  Flashlight,
} from 'lucide-react';
import { HandPhotoGuidance } from '@/components/common/HandPhotoGuidance';

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
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  // Stop current active media stream tracks & turn off hardware torch if active
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          if (track.kind === 'video' && typeof track.applyConstraints === 'function') {
            void track.applyConstraints({ advanced: [{ torch: false } as MediaTrackConstraintSet & { torch?: boolean }] }).catch(() => {});
          }
        } catch {
          // ignore
        }
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setTorchOn(false);
    setTorchSupported(false);
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

      // Detect hardware flashlight / torch capability (primarily Android Chrome rear camera)
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && typeof videoTrack.getCapabilities === 'function') {
        try {
          const caps = videoTrack.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
          setTorchSupported(Boolean(caps?.torch));
        } catch {
          setTorchSupported(false);
        }
      } else {
        setTorchSupported(false);
      }
      setTorchOn(false);

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

  // Toggle hardware flashlight on/off when supported
  const handleToggleTorch = async () => {
    const videoTrack = streamRef.current?.getVideoTracks()[0];
    if (!videoTrack || !torchSupported) return;
    const next = !torchOn;
    try {
      await videoTrack.applyConstraints({
        advanced: [{ torch: next } as MediaTrackConstraintSet & { torch?: boolean }],
      });
      setTorchOn(next);
    } catch {
      setTorchOn(false);
      setTorchSupported(false);
    }
  };

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
  };

  // Capture current video frame to canvas (scaled cleanly to max 1024px for fast AI try-on)
  const handleSnapPhoto = () => {
    if (!videoRef.current || videoRef.current.videoWidth === 0) return;

    const video = videoRef.current;
    const maxDim = 1024;
    let width = video.videoWidth;
    let height = video.videoHeight;
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, width);
    canvas.height = Math.max(1, height);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If using user-facing camera, mirror the frame horizontally so it looks natural
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.86);

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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      {/* Hidden File Input for fallback */}
      <input
        ref={fileFallbackInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="relative w-full max-w-sm sm:max-w-md bg-neutral-950 text-white rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
        {/* Minimal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 z-20 bg-neutral-950/90 backdrop-blur-md">
          <span className="text-xs font-semibold tracking-wide text-white/90">
            {cameraState === 'captured' ? 'Review Photo' : 'Capture Hand'}
          </span>

          <div className="flex items-center gap-2">
            {cameraState === 'live' && torchSupported && (
              <button
                type="button"
                onClick={handleToggleTorch}
                className={`h-8 px-2.5 rounded-full text-[11px] font-medium inline-flex items-center gap-1 transition-colors cursor-pointer ${
                  torchOn
                    ? 'bg-amber-400 text-stone-950 shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
                }`}
                title={torchOn ? 'Turn off flashlight' : 'Turn on flashlight'}
                aria-label={torchOn ? 'Turn off flashlight' : 'Turn on flashlight'}
              >
                <Flashlight className="w-3.5 h-3.5" />
                <span>{torchOn ? 'Flash On' : 'Flash'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                stopStream();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clean Viewfinder Viewport */}
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
              className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-150"
            />
          )}

          {/* Subtle Pro Viewfinder Framing Brackets + Live Quality Guidance */}
          {cameraState === 'live' && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-4 sm:p-6 z-10">
              <div>
                {torchOn && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-400/90 text-stone-950 text-[10px] font-semibold shadow-sm">
                    Flashlight on · Hold 20–30 cm back to avoid glare
                  </span>
                )}
              </div>
              <div className="relative w-56 h-64 sm:w-64 sm:h-72 max-w-[85%] max-h-[75%]">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/35 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/35 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/35 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/35 rounded-br-lg" />
              </div>
              <HandPhotoGuidance variant="dark" />
            </div>
          )}

          {/* Loading Spinner */}
          {cameraState === 'starting' && (
            <div className="flex flex-col items-center justify-center gap-2.5 text-white/70">
              <Loader2 className="w-7 h-7 animate-spin text-[#E0246A]" />
              <span className="text-xs font-medium">Starting camera...</span>
            </div>
          )}

          {/* Error State */}
          {cameraState === 'error' && (
            <div className="p-6 text-center space-y-3.5 max-w-xs">
              <div className="w-10 h-10 rounded-full bg-white/10 text-white/80 mx-auto flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-white">Camera Unavailable</h4>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  {errorMessage || 'Could not start your device camera.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileFallbackInputRef.current?.click()}
                className="w-full h-10 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-medium inline-flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Hand Photo</span>
              </button>
            </div>
          )}
        </div>

        {/* Minimal Bottom Controls */}
        <div className="px-6 py-4 border-t border-white/10 bg-neutral-950 z-20">
          {cameraState === 'captured' ? (
            /* Review State: Retake vs Use Photo */
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="h-11 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 text-xs font-medium transition inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-4 h-4 text-white/70" />
                <span>Retake</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="h-11 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold transition inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md shadow-[#E0246A]/25"
              >
                <Check className="w-4 h-4 text-white" />
                <span>Use Photo</span>
              </button>
            </div>
          ) : cameraState === 'live' ? (
            /* Live State: Balanced Circular Controls (Upload, Shutter, Flip) */
            <div className="flex items-center justify-between px-2 sm:px-4">
              {/* 1st Option: Upload from files */}
              <button
                type="button"
                onClick={() => fileFallbackInputRef.current?.click()}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer active:scale-95"
                title="Upload Hand Photo"
              >
                <UploadCloud className="w-5 h-5" />
              </button>

              {/* Shutter Button with Camera Icon */}
              <button
                type="button"
                onClick={handleSnapPhoto}
                className="w-16 h-16 sm:w-17 sm:h-17 rounded-full border-2 border-white/80 p-1 flex items-center justify-center cursor-pointer transition active:scale-95 hover:border-white shadow-lg shadow-[#E0246A]/25"
                title="Capture Photo"
              >
                <div className="w-full h-full rounded-full bg-[#E0246A] hover:bg-[#BE185D] active:scale-90 transition flex items-center justify-center text-white">
                  <Camera className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
              </button>

              {/* Flip Camera */}
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer active:scale-95"
                title="Flip Camera"
              >
                <FlipHorizontal className="w-5 h-5" />
              </button>
            </div>
          ) : (
            /* Starting or Error footer */
            <div className="flex items-center justify-between text-xs text-white/60">
              <button
                type="button"
                onClick={() => fileFallbackInputRef.current?.click()}
                className="hover:text-white inline-flex items-center gap-1.5 cursor-pointer transition"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload from device</span>
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
