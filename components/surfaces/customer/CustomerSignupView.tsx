'use client';

import React, { useState } from 'react';
import { ArrowRight, Mail, Check } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';

import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  resendVerificationEmail,
} from '@/lib/services/auth';

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
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [canResendConfirm, setCanResendConfirm] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

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

  const handleResend = async () => {
    const targetEmail = (pendingVerificationEmail || email).trim();
    if (!targetEmail) return;
    setIsSubmitting(true);
    setResendSuccess(false);
    try {
      await resendVerificationEmail(targetEmail);
      setResendSuccess(true);
      setErrorMessage('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not resend verification email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setCanResendConfirm(false);
    setResendSuccess(false);

    try {
      if (mode === 'signup') {
        const cleanEmail = email.trim().toLowerCase();
        const cleanName = userName.trim() || cleanEmail.split('@')[0] || 'Client';
        const result = await signUpWithEmail(cleanEmail, password, cleanName);

        if (result.needsEmailVerification) {
          setPendingVerificationEmail(cleanEmail);
          setIsSubmitting(false);
          return;
        }

        setIsSubmitting(false);
        onSubmit();
      } else {
        const cleanEmail = email.trim().toLowerCase();
        await signInWithEmail(cleanEmail, password);
        setIsSubmitting(false);
        if (onSignInSuccess) onSignInSuccess();
        else onSubmit();
      }
    } catch (err: any) {
      const msg = err?.message || 'Authentication failed. Please check your credentials.';
      if (msg.toLowerCase().includes('email not confirmed')) {
        setCanResendConfirm(true);
        setErrorMessage('Please confirm your email address before signing in.');
      } else {
        setErrorMessage(msg);
      }
      setIsSubmitting(false);
    }
  };

  if (pendingVerificationEmail) {
    return (
      <div className="max-w-md py-6 mx-auto">
        <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-md space-y-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF2F8] text-[#E0246A] flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-serif text-2xl font-normal text-stone-900">
              Check your email
            </h1>
            <p className="font-sans text-xs text-stone-500 leading-relaxed">
              We sent a verification link to{' '}
              <span className="font-semibold text-stone-800">{pendingVerificationEmail}</span>.
              Open the link to activate your account and load your profile.
            </p>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-medium">
              {errorMessage}
            </div>
          )}
          {resendSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Verification email resent.</span>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleResend}
              disabled={isSubmitting}
              className="w-full h-10 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Resend Verification Email'}
            </button>
            <button
              type="button"
              onClick={() => {
                setPendingVerificationEmail(null);
                setMode('signin');
              }}
              className="w-full h-10 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium transition cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              : 'Sign in to access your saved manicures and custom sets.'}
          </p>
          {mode === 'signup' && (
            <div className="pt-1">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-[#E0246A] text-[11px] font-semibold">
                Free Plan: 10 Try-On Credits Included
              </span>
            </div>
          )}
        </div>

        {/* Mode Toggle */}
        <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage('');
              setCanResendConfirm(false);
            }}
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
            onClick={() => {
              setMode('signin');
              setErrorMessage('');
              setCanResendConfirm(false);
            }}
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
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 text-center font-medium animate-in fade-in space-y-1.5">
            <p>{errorMessage}</p>
            {canResendConfirm && (
              <button
                type="button"
                onClick={handleResend}
                disabled={isSubmitting}
                className="underline font-semibold text-[#E0246A] hover:text-[#BE185D] cursor-pointer"
              >
                {resendSuccess ? 'Verification link sent!' : 'Resend verification email'}
              </button>
            )}
          </div>
        )}

        {/* Continue with Google */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isSubmitting}
          className="w-full h-11 px-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs sm:text-sm font-medium shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99] disabled:opacity-50"
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
                placeholder="Your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
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
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full h-10 px-3.5 rounded-xl bg-stone-50 border border-stone-200 font-sans text-xs text-stone-900 focus:outline-none focus:border-[#E0246A] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-sans font-medium text-stone-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder={mode === 'signup' ? 'Minimum 8 characters' : 'Enter password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === 'signup' ? 8 : 1}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              className="w-full h-10 px-3.5 rounded-xl bg-stone-50 border border-stone-200 font-sans text-xs text-stone-900 focus:outline-none focus:border-[#E0246A] focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-[#E0246A] hover:bg-[#BE185D] text-white font-sans text-xs sm:text-sm font-semibold shadow-md shadow-[#E0246A]/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
            >
              <span>
                {isSubmitting
                  ? mode === 'signup'
                    ? 'Creating account...'
                    : 'Signing in...'
                  : mode === 'signup'
                  ? 'Create Account & Continue'
                  : 'Sign In to Dashboard'}
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
          </div>
        </form>
      </div>
    </div>
  );
}
