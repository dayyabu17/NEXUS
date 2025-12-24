import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/axios';
import UpdateStatusModal from './UpdateStatusModal';

const formatDateInput = (value) => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTimeInput = (value) => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    if (typeof value === 'string') {
      return value;
    }
    return '';
  }
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

const buildIsoDateTime = (dateString, timeString) => {
  if (!dateString) {
    return null;
  }
  const candidate = timeString ? `${dateString}T${timeString}` : `${dateString}T00:00`;
  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const EMPTY_FORM = {
  title: '',
  date: '',
  time: '',
  location: '',
  description: '',
};

const FEEDBACK_DEFAULT = {
  isOpen: false,
  variant: 'success',
  message: '',
  onConfirm: null,
  onDismiss: null,
};

const WARNING_WINDOW_MS = 24 * 60 * 60 * 1000;

const EditEventModal = ({ isOpen, onClose, event, onUpdated }) => {
  console.log('EditModal received event prop:', event);
  const [formData, setFormData] = useState(() => ({ ...EMPTY_FORM }));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [targetEventId, setTargetEventId] = useState('');
  const [feedbackModal, setFeedbackModal] = useState(FEEDBACK_DEFAULT);
  const originalSnapshotRef = useRef(null);
  const pendingSubmissionRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
      setError('');
      setTargetEventId('');
      setFormData({ ...EMPTY_FORM });
      originalSnapshotRef.current = null;
      return;
    }

    const eventId = event?._id || event?.id;
    if (event && eventId) {
      console.log('Setting form data with ID:', eventId);

      setTargetEventId(String(eventId));
      const nextState = {
        title: event.title || '',
        date: formatDateInput(event.date),
        time: formatTimeInput(event.date) || event.endTime || '',
        location: event.location || '',
        description: event.description || '',
      };

      setFormData(nextState);
      originalSnapshotRef.current = JSON.stringify(nextState);
      setError('');
    }
  }, [event, isOpen]);

  const closeFeedbackModal = () => {
    const { onDismiss } = feedbackModal;
    setFeedbackModal(FEEDBACK_DEFAULT);
    if (typeof onDismiss === 'function') {
      onDismiss();
    }
  };

  const confirmFeedbackModal = () => {
    const { onConfirm } = feedbackModal;
    setFeedbackModal(FEEDBACK_DEFAULT);
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const performUpdate = async (payload, token) => {
    pendingSubmissionRef.current = null;
    setIsLoading(true);
    setError('');

    try {
      const requestPath = `/organizer/events/${targetEventId}`;
      const logPath = `/api${requestPath}`;
      console.log('Sending Request to:', logPath);

      const response = await api.put(requestPath, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setError('');
      onUpdated?.(response?.data?.event ?? null);
      setFeedbackModal({
        isOpen: true,
        variant: 'success',
        message: 'Success! Event updated and participants have been notified.',
        onConfirm: null,
        onDismiss: () => {
          onClose?.();
        },
      });
    } catch (error) {
      console.error('Update failed:', error?.response?.data || error?.message);
      const message =
        error?.response?.data?.message || error?.message || 'Unable to update this event right now.';
      setError(message);
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        message,
        onConfirm: null,
        onDismiss: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!targetEventId) {
      const message = 'Error: Cannot update. Event ID is missing.';
      setError(message);
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        message,
        onConfirm: null,
        onDismiss: null,
      });
      return;
    }

    const currentSnapshot = JSON.stringify(formData);
    if (originalSnapshotRef.current && currentSnapshot === originalSnapshotRef.current) {
      setFeedbackModal({
        isOpen: true,
        variant: 'info',
        message: 'No changes made. No email was sent.',
        onConfirm: null,
        onDismiss: () => {
          onClose?.();
        },
      });
      return;
    }

    const eventDate = event?.date ? new Date(event.date) : null;
    if (eventDate && !Number.isNaN(eventDate.getTime()) && eventDate < new Date()) {
      const message = 'This event has already ended and cannot be modified.';
      setError(message);
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        message,
        onConfirm: null,
        onDismiss: null,
      });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      const message = 'Please sign in again to continue.';
      setError(message);
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        message,
        onConfirm: null,
        onDismiss: null,
      });
      return;
    }

    const isoDate = buildIsoDateTime(formData.date, formData.time);
    if (!isoDate) {
      const message = 'Please provide a valid date and time.';
      setError(message);
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        message,
        onConfirm: null,
        onDismiss: null,
      });
      return;
    }

    const payload = {
      title: formData.title.trim(),
      date: isoDate,
      location: formData.location.trim(),
      description: formData.description.trim(),
    };

    if (formData.time) {
      payload.endTime = formData.time;
    }

    const msUntilEvent = eventDate ? eventDate.getTime() - Date.now() : null;
    if (msUntilEvent !== null && msUntilEvent > 0 && msUntilEvent <= WARNING_WINDOW_MS) {
      pendingSubmissionRef.current = { payload, token };
      setFeedbackModal({
        isOpen: true,
        variant: 'warning',
        message:
          'Heads up! This event begins in less than 24 hours. Guests will receive an immediate notification. Proceed with the update?',
        onConfirm: () => {
          const submission = pendingSubmissionRef.current;
          pendingSubmissionRef.current = null;
          if (submission) {
            performUpdate(submission.payload, submission.token);
          }
        },
        onDismiss: () => {
          pendingSubmissionRef.current = null;
        },
      });
      return;
    }

    performUpdate(payload, token);
  };

  const shouldRenderModal = isOpen && typeof document !== 'undefined';
  const confirmHandler =
    feedbackModal.variant === 'warning' && typeof feedbackModal.onConfirm === 'function'
      ? confirmFeedbackModal
      : undefined;

  return (
    <>
      {shouldRenderModal
        ? createPortal(
            <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="absolute inset-0" onClick={() => (!isLoading ? onClose?.() : null)} />

              <div className="relative z-[10000] w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#101626]/95 text-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
                  <div>
                    <h2 className="text-lg font-semibold">Edit Event</h2>
                    <p className="text-xs text-white/60">Update the essentials before sharing with guests.</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full px-2 py-1 text-white/60 transition hover:bg-white/10 hover:text-white"
                    onClick={() => (!isLoading ? onClose?.() : null)}
                    aria-label="Close"
                  >
                    X
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2 text-sm">
                      <span className="text-white/60">Title</span>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
                      />
                    </label>

                    <label className="space-y-2 text-sm">
                      <span className="text-white/60">Date</span>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
                      />
                    </label>

                    <label className="space-y-2 text-sm">
                      <span className="text-white/60">Time</span>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
                      />
                    </label>

                    <label className="space-y-2 text-sm">
                      <span className="text-white/60">Location</span>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
                      />
                    </label>
                  </div>

                  <label className="block space-y-2 text-sm">
                    <span className="text-white/60">Description</span>
                    <textarea
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
                    />
                  </label>

                  {error && (
                    <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => (!isLoading ? onClose?.() : null)}
                      className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white/70 transition hover:border-white/40 hover:text-white"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Updating & Notifying...' : 'Save changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
      <UpdateStatusModal
        isOpen={feedbackModal.isOpen}
        variant={feedbackModal.variant}
        message={feedbackModal.message}
        onClose={closeFeedbackModal}
        onConfirm={confirmHandler}
      />
    </>
  );
};

export default EditEventModal;
