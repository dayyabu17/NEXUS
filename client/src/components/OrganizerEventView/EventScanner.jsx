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

  const statusClasses = {
    idle: 'bg-white/10 text-white/70',
    pending: 'bg-blue-500/15 text-blue-200',
    success: 'bg-emerald-500/15 text-emerald-200',
    error: 'bg-red-500/15 text-red-200',
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[rgba(21,26,36,0.72)] p-6 shadow-lg shadow-black/30">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">QR check-in</h3>
          <p className="text-xs text-white/50">Point the scanner at the guest&apos;s ticket QR code.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[status]}`}>
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
                ? 'border border-red-400/60 bg-red-400/15 text-red-100 hover:bg-red-400/25'
                : 'border border-blue-400/60 bg-blue-400/15 text-blue-100 hover:bg-blue-400/25'
            }`}
          >
            {isScannerActive ? 'Close' : 'Scan'}
          </button>
        </div>
      </div>

      {isScannerActive ? (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          <Scanner
            constraints={{ facingMode: 'environment' }}
            onScan={handleDecode}
            onError={handleScannerError}
            className="aspect-square w-full"
          />
        </div>
      ) : (
        <div className="flex aspect-square w-full max-h-[45vh] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-black/20 text-center text-white/40">
          <span className="text-sm font-semibold uppercase tracking-[0.3em]">Scanner idle</span>
          <p className="max-w-[80%] text-xs text-white/45">
            Select Scan to activate your camera when you are ready to check in a guest.
          </p>
        </div>
      )}

      {message && (
        <p className={`mt-4 rounded-2xl border border-white/10 px-4 py-3 text-sm ${statusClasses[status]}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default EventScanner;
