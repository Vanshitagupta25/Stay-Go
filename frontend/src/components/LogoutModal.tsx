import React, { useEffect, useState } from 'react';
import { LogOut, X } from 'lucide-react';
import { ModalPortal } from './ModalPortal';

export interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  user?: any;
  title?: string;
  message?: string;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  title = 'Log out of Stay-Go?',
  message = 'Are you sure you want to log out? You can sign back in anytime to access your wishlists, bookings, and profile.',
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await onConfirm();
      onClose();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const username = user?.username || user?.name || '';
  const email = user?.email || '';
  const initial = (username || email || 'U').trim().charAt(0).toUpperCase();

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isSubmitting) {
            onClose();
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
      >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 relative animate-in zoom-in-95 fade-in duration-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer disabled:opacity-40"
          title="Close"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#fe424d] shadow-2xs">
            <LogOut className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 id="logout-modal-title" className="text-lg font-bold text-gray-900 leading-snug">
              {title}
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Confirm your session sign-out
            </p>
          </div>
        </div>

        {/* User Card (if user information is available) */}
        {(username || email) && (
          <div className="bg-gray-50 border border-gray-150 rounded-2xl p-3 sm:p-3.5 mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fe424d] text-white font-bold text-sm flex items-center justify-center ring-2 ring-white shadow-2xs shrink-0 select-none">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              {username && (
                <p className="text-sm font-semibold text-gray-900 truncate">{username}</p>
              )}
              {email && (
                <p className="text-xs text-gray-500 truncate">{email}</p>
              )}
            </div>
          </div>
        )}

        {/* Modal Description */}
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-full text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white bg-[#fe424d] hover:bg-[#e03a45] active:scale-95 transition shadow-sm hover:shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </>
            )}
          </button>
        </div>

      </div>
      </div>
    </ModalPortal>
  );
};
