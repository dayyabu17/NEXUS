import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

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

const EventCheckoutModal = ({ isOpen, onClose, event, userId, email }) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
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

  const totalAmount = useMemo(() => ticketPrice * quantity, [ticketPrice, quantity]);

  const handleQuantityChange = (direction) => {
    setQuantity((prev) => {
      const next = direction === 'decrement' ? prev - 1 : prev + 1;
      return next < 1 ? 1 : next;
    });
  };

  const handleConfirm = async () => {
    if (!event?._id) {
      setError('Event details are missing.');
      return;
    }

    if (!userId || !email) {
      setError('We need your account email to continue.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await api.post('/payment/rsvp/initialize', {
        userId,
        eventId: event._id,
        quantity,
        email,
        amount: ticketPrice,
      });

      const data = response.data;
      if (!data?.success) {
        throw new Error(data?.message || 'Unable to start RSVP.');
      }

      if (data.isFree) {
        setIsSuccess(true);
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
      const message = err.response?.data?.message || err.message || 'Unable to process RSVP.';
      console.error('Payment Init Failed:', err);
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={() => (!isProcessing ? onClose?.() : null)} />

      <div className="relative z-[10000] w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Confirm RSVP</h2>
            {event?.title && <p className="text-sm text-white/60">{event.title}</p>}
          </div>
          <button
            type="button"
            className="text-slate-400 transition hover:text-white"
            onClick={() => (!isProcessing ? onClose?.() : null)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 px-6 py-6 text-white/80">
          {event?.date && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Date</span>
              <span>{new Date(event.date).toLocaleString('en-NG', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Price per ticket</span>
            <span className="font-semibold text-white">{formatPrice(ticketPrice)}</span>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-3">
            <span className="text-sm text-white/60">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-lg text-white transition hover:border-slate-400"
                onClick={() => handleQuantityChange('decrement')}
                disabled={isProcessing}
              >
                −
              </button>
              <span className="w-8 text-center text-base font-semibold text-white">{quantity}</span>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-lg text-white transition hover:border-slate-400"
                onClick={() => handleQuantityChange('increment')}
                disabled={isProcessing}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-base">
            <span className="text-white/60">Total</span>
            <span className="text-xl font-semibold text-white">{currencyFormatter.format(totalAmount)}</span>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {isSuccess && (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              RSVP confirmed! Redirecting to your tickets...
            </div>
          )}
        </div>

        <div className="border-t border-slate-800 bg-slate-950/80 px-6 py-4">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isProcessing
              ? 'Connecting to Paystack...'
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
