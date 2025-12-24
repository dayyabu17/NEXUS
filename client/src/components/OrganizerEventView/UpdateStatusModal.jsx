import React from 'react';
import { createPortal } from 'react-dom';

const VARIANT_CONFIG = {
  success: {
    title: 'Update successful',
    icon: '✓',
    ringClass: 'bg-emerald-500/20 text-emerald-300',
    accentButton: 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400',
  },
  error: {
    title: 'Update failed',
    icon: '⚠',
    ringClass: 'bg-red-500/20 text-red-300',
    accentButton: 'bg-red-500 text-red-950 hover:bg-red-400',
  },
  warning: {
    title: 'Confirm update',
    icon: '!',
    ringClass: 'bg-amber-500/20 text-amber-300',
    accentButton: 'bg-amber-400 text-amber-950 hover:bg-amber-300',
  },
  info: {
    title: 'No changes detected',
    icon: 'ℹ',
    ringClass: 'bg-sky-500/20 text-sky-300',
    accentButton: 'bg-sky-500 text-sky-950 hover:bg-sky-400',
  },
};

const UpdateStatusModal = ({ isOpen, variant = 'success', message, onClose, onConfirm }) => {
  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.info;
  const showConfirm = variant === 'warning' && typeof onConfirm === 'function';

  return createPortal(
    <div className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0f172a] px-6 py-6 text-white shadow-2xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl ${config.ringClass}`}>
            <span>{config.icon}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold capitalize">{config.title}</h3>
            <p className="mt-2 text-sm text-white/70">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          {showConfirm ? (
            <>
              <button
                type="button"
                className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white/70 transition hover:border-white/40 hover:text-white"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${config.accentButton}`}
                onClick={onConfirm}
              >
                Proceed
              </button>
            </>
          ) : (
            <button
              type="button"
              className="rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              onClick={onClose}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default UpdateStatusModal;
