import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Compass,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
  UserPlus,
  UserRound,
  X,
} from 'lucide-react';
import { authService } from '../services';
import { EASE_SUBTLE } from '../utils/motion';
import { getAuthSuccessAction } from '../utils/authFlow';
import { ModalPortal } from './ModalPortal';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (user: any) => void;
}

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-[#fe424d] focus:bg-white focus:outline-none focus:ring-4 focus:ring-rose-100';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const data =
        mode === 'signup'
          ? await authService.signup({ username, email, password })
          : await authService.login({ username, password });

      if (!data.success) {
        throw new Error(data.message || 'Authentication failed. Please try again.');
      }

      if (getAuthSuccessAction(mode) === 'show-login') {
        setMode('login');
        setPassword('');
        setSuccessMessage('Account created. Please sign in to continue.');
        return;
      }

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode: 'login' | 'signup') => {
    setMode(nextMode);
    setError(null);
    setSuccessMessage(null);
  };

  const isSignup = mode === 'signup';

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-gray-950/55 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: EASE_SUBTLE }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-white/70 bg-white p-5 shadow-[0_1px_2px_rgba(28,25,23,0.05),0_32px_80px_-32px_rgba(28,25,23,0.5)] sm:p-7"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close authentication dialog"
          className="absolute right-4 top-4 cursor-pointer rounded-xl bg-gray-100 p-2 text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 pr-8">
          <div className="flex items-center gap-2 text-[#fe424d]">
            <Compass className="h-6 w-6" />
            <span className="text-sm font-bold tracking-tight">Stay-Go</span>
          </div>
          <h2
            id="auth-modal-title"
            className="mt-3 text-[22px] font-bold leading-tight tracking-tight text-gray-900"
          >
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            {isSignup
              ? 'Save your favourite stays and book unforgettable escapes.'
              : 'Sign in to continue planning your next stay.'}
          </p>
        </div>

        
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold transition sm:text-sm ${
              !isSignup
                ? 'bg-white text-[#fe424d] shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <LogIn className="h-4 w-4" /> Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold transition sm:text-sm ${
              isSignup
                ? 'bg-white text-[#fe424d] shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <UserPlus className="h-4 w-4" /> Sign Up
          </button>
        </div>

        {successMessage && (
          <div
            role="status"
            className="mb-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 sm:text-sm"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 sm:text-sm"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="auth-username" className="mb-1.5 block text-xs font-semibold text-gray-700">
              Username
            </label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="auth-username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          {isSignup && (
            <div>
              <label htmlFor="auth-email" className="mb-1.5 block text-xs font-semibold text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="auth-password" className="mb-1.5 block text-xs font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`${inputClass} pl-10 pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#fe424d] py-3 text-sm font-bold text-white shadow-[0_10px_24px_-12px_rgba(254,66,77,0.9)] transition hover:bg-[#e03a44] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Processing...' : isSignup ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-5 border-t border-gray-100 pt-4 text-center text-xs text-gray-500">
          {isSignup ? 'Already have an account?' : 'New to Stay-Go?'}{' '}
          <button
            type="button"
            onClick={() => switchMode(isSignup ? 'login' : 'signup')}
            className="cursor-pointer font-semibold text-[#fe424d] hover:underline"
          >
            {isSignup ? 'Sign in' : 'Create an account'}
          </button>
        </div>

        <p className="mt-3 text-center text-[11px] leading-relaxed text-gray-400">
          By continuing you agree to Stay-Go&apos;s Terms of Service and Privacy Policy.
        </p>
        </motion.div>
      </div>
    </ModalPortal>
  );
};
