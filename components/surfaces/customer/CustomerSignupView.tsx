'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';

import { signUpWithEmail, signInWithEmail, signInWithGoogle, VIP_ACCOUNT } from '@/lib/services/auth';

export interface CustomerSignupViewProps {
  userName: string;
  setUserName: (name: string) => void;
  onSubmit: () => void;
  onContinueAsGuest?: () => void;
  onSignInSuccess?: () => void;
  /** @deprecated Technician flows removed from customer view */
  onTechSignUpClick?: () => void;
}

export function CustomerSignupView({
  userName,
  setUserName,
  onSubmit,
  onContinueAsGuest,
  onSignInSuccess,
}: CustomerSignupViewProps) {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGuestContinue = () => {
    if (onContinueAsGuest) {
      onContinueAsGuest();
    } else {
      onSubmit();
    }
  };

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-in failed');
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (mode === 'signup') {
        const cleanName = userName.trim() || 'Elena';
        const cleanEmail = email.trim();
        await signUpWithEmail(cleanEmail, password, cleanName);

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('finglora_user_email', cleanEmail);
            localStorage.setItem('finglora_user_display_name', cleanName);
          } catch {}
        }

        // Send welcome email via Resend in background
        if (cleanEmail) {
          fetch('/api/email/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, name: cleanName }),
          }).catch((e) => console.warn('Welcome email error:', e));
        }

        setIsSubmitting(false);
        onSubmit();
      } else {
        const cleanEmail = email.trim();
        await signInWithEmail(cleanEmail, password);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('finglora_user_email', cleanEmail);
          } catch {}
        }
        setIsSubmitting(false);
        if (onSignInSuccess) onSignInSuccess();
        else onSubmit();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md py-6 mx-auto">
      <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-md space-y-5">
        <div className="text-center space-y-2">
          <div className="inline-block mb-1">
            <BrandLogo size="md" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900 tracking-tight">
            {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="font-sans text-xs text-stone-500">
            {mode === 'signup'
              ? 'Get 10 complimentary virtual try-on credits to style any manicure on your hand.'
              : 'Sign in to access your saved manicures and personal atelier.'}
          </p>
          {mode === 'signup' && (
            <div className="pt-1">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-[#E0246A] text-[11px] font-semibold">
                ✨ Free Plan: 10 Try-On Credits Included
              </span>
            </div>
          )}
        </div>

        {/* Mode Toggle */}
        <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 text-center font-medium animate-in fade-in">
            {errorMessage}
          </div>
        )}

        {/* Continue with Google */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="w-full h-11 px-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs sm:text-sm font-medium shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <span className="relative bg-white px-3 text-xs text-stone-400 font-medium whitespace-nowrap">
            or with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-sans font-medium text-stone-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value || 'Elena')}
                required
                className="w-full h-10 px-3.5 rounded-xl bg-stone-50 border border-stone-200 font-sans text-xs text-stone-900 focus:outline-none focus:border-[#E0246A] focus:bg-white transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-sans font-medium text-stone-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="elena@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-10 px-3.5 rounded-xl bg-stone-50 border border-stone-200 font-sans text-xs text-stone-900 focus:outline-none focus:border-[#E0246A] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-sans font-medium text-stone-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-10 px-3.5 rounded-xl bg-stone-50 border border-stone-200 font-sans text-xs text-stone-900 focus:outline-none focus:border-[#E0246A] focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white font-sans text-xs sm:text-sm font-semibold shadow-md shadow-[#E0246A]/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>
                {mode === 'signup' ? 'Create Account & Continue' : 'Sign In to Dashboard'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>

            <button
              type="button"
              onClick={handleGuestContinue}
              className="w-full h-11 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 hover:text-stone-900 font-sans text-xs sm:text-sm font-medium shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>Continue as Guest</span>
            </button>

            {/* Quick-fill VIP Unlimited Pro Account */}
            <div className="pt-2 border-t border-stone-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setEmail(VIP_ACCOUNT.email);
                  setPassword(VIP_ACCOUNT.password);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 text-[#E0246A] text-[11px] font-semibold transition cursor-pointer"
              >
                <span>Use VIP Pro Account (Unlimited)</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
