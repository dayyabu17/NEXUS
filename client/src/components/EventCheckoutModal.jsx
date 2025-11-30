import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { DEFAULT_BRAND_COLOR } from '../constants/accentTheme';
import { hexToRgba } from '../utils/color';

const currencyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
});

const formatPrice = (amount) => {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 'Free';
  }
  return currencyFormatter.format(numeric);
};

const hexPattern = /^#([0-9A-Fa-f]{6})$/;

const EventCheckoutModal = ({
  isOpen,
  onClose,
  event,
  userId,
  email,
  theme,
  hasTicket,
  onPurchaseComplete,
}) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const brandColor = useMemo(() => {
    const candidate = theme?.brandColor;
    if (typeof candidate === 'string' && hexPattern.test(candidate)) {
      return candidate.toUpperCase();
    }
    return DEFAULT_BRAND_COLOR;
  }, [theme?.brandColor]);

  const accentColor = useMemo(() => {
    const candidate = theme?.accentColor;
    if (typeof candidate === 'string' && hexPattern.test(candidate)) {
      return candidate.toUpperCase();
    }
    return brandColor;
  }, [theme?.accentColor, brandColor]);

  const brandStyles = useMemo(
    () => ({
      color: brandColor,
      soft: hexToRgba(brandColor, 0.85),
      shadow: `0 18px 40px ${hexToRgba(brandColor, 0.28)}`,
    }),
    [brandColor],
  );

  const accentStyles = useMemo(
    () => ({
      border: hexToRgba(accentColor, 0.35),
      borderSoft: hexToRgba(accentColor, 0.2),
      surface: hexToRgba(accentColor, 0.1),
      glow: `0 28px 70px ${hexToRgba(accentColor, 0.22)}`,
      text: hexToRgba(accentColor, 0.9),
    }),
    [accentColor],
  );

  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setError('');
      setIsSuccess(false);
    }
  }, [isOpen]);

  const ticketPrice = useMemo(() => {
    if (!event) {
      return 0;
    }
    const resolved = Number(event?.price);
    if (Number.isFinite(resolved) && resolved > 0) {
      return resolved;
    }
    const fallback = Number(event?.registrationFee);
    return Number.isFinite(fallback) && fallback > 0 ? fallback : 0;
  }, [event]);

  const totalAmount = ticketPrice;

  const handleConfirm = async () => {
    if (!event?._id) {
      setError('Event details are missing.');
      return;
    }

    if (!userId || !email) {
      setError('We need your account email to continue.');
      return;
    }

    if (hasTicket) {
      setError('You already have a ticket for this event.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await api.post('/payment/rsvp/initialize', {
        userId,
        eventId: event._id,
        quantity: 1,
        email,
        amount: ticketPrice,
      });

      const data = response.data;
      if (!data?.success) {
        throw new Error(data?.message || 'Unable to start RSVP.');
      }

      if (data.isFree) {
        setIsSuccess(true);
        onPurchaseComplete?.();
        setTimeout(() => {
          onClose?.();
          navigate('/guest/tickets');
        }, 1200);
        return;
      }

      if (data.authorization_url) {
        console.log('Redirecting to Paystack...', data.authorization_url);
        window.location.href = data.authorization_url;
        return;
      }

      throw new Error('Payment session could not be created.');
    } catch (err) {
      const alreadyOwnsTicket = err?.response?.status === 409;
      const message = alreadyOwnsTicket
        ? 'You already have a ticket for this event.'
        : err.response?.data?.message || err.message || 'Unable to process RSVP.';
      console.error('Payment Init Failed:', err);
      setError(message);
      if (alreadyOwnsTicket) {
        onPurchaseComplete?.();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={() => (!isProcessing ? onClose?.() : null)} />

      <div
        className="relative z-[10000] w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        style={{ borderColor: accentStyles.border, boxShadow: accentStyles.glow }}
      >
        <div
          className="flex items-center justify-between border-b bg-slate-100 px-6 py-4 dark:bg-slate-950/95"
          style={{ borderColor: accentStyles.borderSoft || undefined }}
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Confirm RSVP</h2>
            {event?.title && <p className="text-sm text-slate-600 dark:text-white/60">{event.title}</p>}
          </div>
          <button
            type="button"
            className="text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
            onClick={() => (!isProcessing ? onClose?.() : null)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 px-6 py-6 text-slate-600 dark:text-white/80">
          {event?.date && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-white/60">Date</span>
              <span className="text-slate-700 dark:text-white">{new Date(event.date).toLocaleString('en-NG', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}</span>
            </div>
          )}

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-white/60">Price per ticket</span>
              <span className="font-semibold" style={{ color: accentStyles.text }}>
                {formatPrice(ticketPrice)}
              </span>
            </div>

            <div
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/60"
              style={{
                borderColor: accentStyles.border || undefined,
                backgroundColor: accentStyles.surface || undefined,
              }}
            >
              <span className="text-slate-500 dark:text-white/60">Quantity</span>
              <span className="text-base font-semibold text-slate-900 dark:text-white">1 ticket</span>
            </div>

            <div className="flex items-center justify-between text-base">
              <span className="text-slate-600 dark:text-white/70">Total</span>
              <span className="text-xl font-semibold text-slate-900 dark:text-white">{currencyFormatter.format(totalAmount)}</span>
            </div>
          </div>

          {hasTicket && (
            <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-100">
              You already have a ticket for this event.
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
              {error}
            </div>
          )}

          {isSuccess && (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-200">
              RSVP confirmed! Redirecting to your tickets...
            </div>
          )}
        </div>

        <div
          className="border-t bg-slate-100 px-6 py-4 dark:bg-slate-950/90"
          style={{ borderColor: accentStyles.borderSoft || undefined }}
        >
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing || hasTicket}
            style={{
              '--brand-color': brandStyles.color,
              '--brand-soft': brandStyles.soft,
              boxShadow: brandStyles.shadow,
            }}
            className="inline-flex w-full items-center justify-center rounded-full bg-[var(--brand-color)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-soft)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isProcessing
              ? 'Connecting to Paystack...'
              : hasTicket
                ? 'Already attending'
                : ticketPrice === 0
                ? 'Confirm RSVP'
                : 'Confirm & Pay'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default EventCheckoutModal;
