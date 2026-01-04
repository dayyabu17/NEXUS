import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

const STATUS_RESET_DELAY = 2500;

const EventScanner = ({ onScanTicket }) => {
  const [status, setStatus] = useState('idle'); // idle | pending | success | error
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const resetTimer = useRef(null);

  useEffect(() => () => {
    if (resetTimer.current) {
      window.clearTimeout(resetTimer.current);
    }
  }, []);

  const scheduleReset = useCallback(() => {
    if (resetTimer.current) {
      window.clearTimeout(resetTimer.current);
    }
    resetTimer.current = window.setTimeout(() => {
      setStatus('idle');
      setMessage('');
    }, STATUS_RESET_DELAY);
  }, []);

  const handleDecode = useCallback(
    async (detectedCodes) => {
      if (isProcessing || !Array.isArray(detectedCodes) || detectedCodes.length === 0) {
        return;
      }

      const [first] = detectedCodes;
      const rawValue = first?.rawValue || first?.rawData || first?.text || first;
      const ticketId = typeof rawValue === 'string' ? rawValue.trim() : '';

      if (!ticketId) {
        return;
      }

      setIsProcessing(true);
      setStatus('pending');
      setMessage('Processing ticket…');

      try {
        await onScanTicket(ticketId);
        setStatus('success');
        setMessage('Check-in successful.');
      } catch (err) {
        const responseMessage = err?.response?.data?.message || err?.message || 'Unable to check in ticket.';
        setStatus('error');
        setMessage(responseMessage);
      } finally {
        scheduleReset();
        setIsProcessing(false);
      }
    },
    [isProcessing, onScanTicket, scheduleReset],
  );

  const handleScannerError = useCallback(
    (error) => {
      if (status === 'error') {
        return;
      }

      setStatus('error');
      setMessage(error?.message || 'Camera error. Please retry.');
      scheduleReset();
    },
    [scheduleReset, status],
  );

  const handleToggleScanner = useCallback(() => {
    setIsScannerActive((prev) => {
      const nextActive = !prev;
      if (!nextActive) {
        if (resetTimer.current) {
          window.clearTimeout(resetTimer.current);
          resetTimer.current = null;
        }
        setStatus('idle');
        setMessage('');
        setIsProcessing(false);
      }
      return nextActive;
    });
  }, []);

  const statusBadgeClasses = {
    idle: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white/70',
    pending: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200',
    error: 'bg-rose-100 text-rose-700 dark:bg-red-500/15 dark:text-red-200',
  };

  const statusMessageClasses = {
    idle: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-white/70',
    pending: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-200',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-200',
    error: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-red-500/25 dark:bg-red-500/15 dark:text-red-200',
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-700 shadow-sm transition dark:border-white/10 dark:bg-[rgba(21,26,36,0.72)] dark:text-white dark:shadow-lg dark:shadow-black/30">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-white/60">QR check-in</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Point the scanner at the guest&apos;s ticket QR code.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClasses[status]}`}>
            {status === 'pending'
              ? 'Processing…'
              : status === 'idle'
              ? 'Ready'
              : status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          <button
            type="button"
            onClick={handleToggleScanner}
            className={`rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] transition ${
              isScannerActive
                ? 'border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-red-400/60 dark:bg-red-400/15 dark:text-red-100 dark:hover:bg-red-400/25'
                : 'border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-400/60 dark:bg-blue-400/15 dark:text-blue-100 dark:hover:bg-blue-400/25'
            }`}
          >
            {isScannerActive ? 'Close' : 'Scan'}
          </button>
        </div>
      </div>

      {isScannerActive ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black transition dark:border-white/10 dark:bg-black/40">
          <Scanner
            constraints={{ facingMode: 'environment' }}
            onScan={handleDecode}
            onError={handleScannerError}
            className="aspect-square w-full"
          />
        </div>
      ) : (
        <div className="flex aspect-square w-full max-h-[45vh] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center text-slate-500 transition dark:border-white/15 dark:bg-black/20 dark:text-white/40">
          <span className="text-sm font-semibold uppercase tracking-[0.3em]">Scanner idle</span>
          <p className="max-w-[80%] text-xs text-slate-500 dark:text-white/45">
            Select Scan to activate your camera when you are ready to check in a guest.
          </p>
        </div>
      )}

      {message && (
        <p className={`mt-4 rounded-2xl border px-4 py-3 text-sm transition ${statusMessageClasses[status]}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default EventScanner;
