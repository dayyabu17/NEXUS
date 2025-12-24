import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/axios';

const DeleteEventModal = ({ isOpen, onClose, event, onDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
    }
  }, [isOpen]);

  const handleConfirmDelete = async () => {
    if (!event?._id) {
      return;
    }

    const eventDate = event?.date ? new Date(event.date) : null;
    if (eventDate && !Number.isNaN(eventDate.getTime()) && eventDate < new Date()) {
      setError('This event has already ended and cannot be cancelled.');
      return;
    }

    setIsDeleting(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please sign in again to continue.');
      setIsDeleting(false);
      return;
    }

    try {
      await api.delete(`/events/${event._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await onDeleted?.();
      onClose?.();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Unable to cancel this event right now.';
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={() => (!isDeleting ? onClose?.() : null)} />

      <div className="relative z-[10000] w-full max-w-lg overflow-hidden rounded-3xl border border-red-500/40 bg-[#1b0f14]/95 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-red-500/30 bg-red-500/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-red-200">Cancel Event</h2>
          <button
            type="button"
            className="rounded-full px-2 py-1 text-red-200/70 transition hover:bg-red-500/20 hover:text-red-100"
            onClick={() => (!isDeleting ? onClose?.() : null)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 px-6 py-6 text-sm text-white/80">
          <p className="text-base font-medium text-white">{event?.title || 'Unnamed event'}</p>
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            Warning: Cancelling this event will automatically send an email notification to all registered participants.
          </p>
          <p>
            This action cannot be undone. Your attendees will be informed immediately and any active ticketing will
            stop. Make sure you are ready to proceed.
          </p>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-red-500/20 bg-red-500/10 px-6 py-4">
          <button
            type="button"
            onClick={() => (!isDeleting ? onClose?.() : null)}
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white/70 transition hover:border-white/40 hover:text-white"
            disabled={isDeleting}
          >
            Keep Event
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-red-950 transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isDeleting}
          >
            {isDeleting ? 'Cancelling…' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default DeleteEventModal;
