import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import api from '../api/axios';

const STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(STATUS.LOADING);
  const [message, setMessage] = useState('Verifying your payment...');
  const [ticketId, setTicketId] = useState('');
  const confettiFired = useRef(false);
  const redirectTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const reference = searchParams.get('reference');

    if (!reference) {
      Promise.resolve().then(() => {
        if (!isMounted) {
          return;
        }
        setStatus(STATUS.ERROR);
        setMessage('We could not find a transaction reference in the callback URL.');
      });
      return () => {
        isMounted = false;
      };
    }

    const verifyPayment = async () => {
      try {
        const response = await api.get('/payment/rsvp/verify', {
          params: { reference },
        });

        if (!isMounted) {
          return;
        }

        if (response.data?.success) {
          setTicketId(response.data.ticketId || '');
          setStatus(STATUS.SUCCESS);
          setMessage('Payment confirmed! Your ticket is ready.');
        } else {
          setStatus(STATUS.ERROR);
          setMessage(response.data?.message || 'Payment verification failed.');
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }
        const fallback = error.response?.data?.message || 'Unable to verify payment.';
        setStatus(STATUS.ERROR);
        setMessage(fallback);
      }
    };

    verifyPayment();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  useEffect(() => {
    if (status !== STATUS.SUCCESS || confettiFired.current) {
      return;
    }

    confettiFired.current = true;
    confetti({
      particleCount: 140,
      spread: 65,
      startVelocity: 45,
      origin: { y: 0.6 },
    });
  }, [status]);

  useEffect(() => {
    if (status !== STATUS.SUCCESS || redirectTimeoutRef.current) {
      return;
    }

    redirectTimeoutRef.current = window.setTimeout(() => {
      navigate('/guest/tickets');
    }, 2000);

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, [status, navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute right-24 bottom-16 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[rgba(14,19,33,0.92)] px-8 py-10 shadow-[0_40px_90px_rgba(5,10,25,0.55)] backdrop-blur">
        {status === STATUS.LOADING && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="relative h-16 w-16">
              <span className="absolute inset-0 rounded-full border-4 border-white/15" />
              <span className="absolute inset-0 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
            <h1 className="text-2xl font-semibold">Verifying your payment...</h1>
            <p className="text-sm text-white/60">Please hold on while we confirm your transaction with Paystack.</p>
          </div>
        )}

        {status === STATUS.SUCCESS && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-9 w-9 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold">Payment Successful!</h1>
            <p className="text-sm text-white/65">{message}</p>
            {ticketId && (
              <p className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-white/50">
                Ticket reference: {ticketId}
              </p>
            )}
            <button
              type="button"
              onClick={() => navigate('/guest/tickets')}
              className="inline-flex items-center justify-center rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-400"
            >
              View My Ticket
            </button>
            <p className="text-xs text-white/40">You will be redirected automatically in a moment.</p>
          </div>
        )}

        {status === STATUS.ERROR && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold">Transaction Failed</h1>
            <p className="text-sm text-white/65">{message}</p>
            <button
              type="button"
              onClick={() => navigate('/guest/dashboard')}
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/35"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;
