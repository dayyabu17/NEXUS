import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const MIN_MESSAGE_LENGTH = 5;

const TicketFeedbackPanel = ({ ticket }) => {
  const event = ticket?.event;
  const rawEventId = event?._id || event?.id;
  const eventId = useMemo(() => {
    if (!rawEventId) {
      return '';
    }
    if (typeof rawEventId === 'string') {
      return rawEventId;
    }
    if (typeof rawEventId.toString === 'function') {
      return rawEventId.toString();
    }
    return '';
  }, [rawEventId]);
  const eventDate = event?.date;

  const eventHasStarted = useMemo(() => {
    if (!eventDate) {
      return false;
    }
    const parsed = new Date(eventDate);
    if (Number.isNaN(parsed.getTime())) {
      return false;
    }
    return Date.now() >= parsed.getTime();
  }, [eventDate]);

  const [message, setMessage] = useState('');
  const [rating, setRating] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitState, setSubmitState] = useState({ status: 'idle', error: '' });

  useEffect(() => {
    if (!eventHasStarted || !eventId) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    let isMounted = true;

    const fetchExistingFeedback = async () => {
      setLoading(true);
      setSubmitState({ status: 'idle', error: '' });
      try {
        const response = await api.get(`/events/${eventId}/feedback/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!isMounted) {
          return;
        }
        const feedback = response.data?.feedback;
        if (feedback) {
          setMessage(feedback.message || '');
          setRating(
            Number.isFinite(feedback.rating) && feedback.rating !== null
              ? String(feedback.rating)
              : ''
          );
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }
        const errMessage = error?.response?.data?.message;
        setSubmitState({ status: 'idle', error: errMessage || '' });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchExistingFeedback();

    return () => {
      isMounted = false;
    };
  }, [eventHasStarted, eventId]);

  const handleSubmit = async (evt) => {
    evt.preventDefault();

    if (!eventId) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setSubmitState({ status: 'error', error: 'You need to sign in to leave feedback.' });
      return;
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length < MIN_MESSAGE_LENGTH) {
      setSubmitState({
        status: 'error',
        error: `Feedback must be at least ${MIN_MESSAGE_LENGTH} characters long.`,
      });
      return;
    }

    const payload = { message: trimmedMessage };
    if (rating) {
      payload.rating = Number(rating);
    }

    try {
      setSubmitState({ status: 'submitting', error: '' });
      await api.post(`/events/${eventId}/feedback`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmitState({ status: 'success', error: '' });
    } catch (error) {
      const errMessage = error?.response?.data?.message || 'Unable to send feedback right now.';
      setSubmitState({ status: 'error', error: errMessage });
    }
  };

  if (!eventHasStarted) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-[#11192a] dark:text-white/60">
        Feedback opens once the event begins. Check back after the start time.
      </div>
    );
  }

  if (!eventId) {
    return null;
  }

  const isSubmitting = submitState.status === 'submitting';
  const canSubmit =
    message.trim().length >= MIN_MESSAGE_LENGTH && !isSubmitting && !loading;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#11192a]">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Share your feedback</h3>
        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-white/40">
          Help the organizer improve future experiences
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex items-center gap-3">
          <label htmlFor={`ticket-feedback-rating-${ticket?._id || 'manual'}`} className="text-sm text-slate-600 dark:text-white/60">
            Rating
          </label>
          <select
            id={`ticket-feedback-rating-${ticket?._id || 'manual'}`}
            value={rating}
            onChange={(evt) => setRating(evt.target.value)}
            disabled={loading || isSubmitting}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none dark:border-white/10 dark:bg-[#0f1729] dark:text-white"
          >
            <option value="">Optional</option>
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`ticket-feedback-message-${ticket?._id || 'manual'}`} className="block text-sm font-medium text-slate-700 dark:text-white/70">
            Message
          </label>
          <textarea
            id={`ticket-feedback-message-${ticket?._id || 'manual'}`}
            value={message}
            onChange={(evt) => setMessage(evt.target.value)}
            placeholder="Tell us about your experience..."
            rows={4}
            disabled={loading || isSubmitting}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none dark:border-white/10 dark:bg-[#0f1729] dark:text-white"
          />
          <p className="mt-1 text-xs text-slate-400 dark:text-white/40">
            Minimum {MIN_MESSAGE_LENGTH} characters.
          </p>
        </div>

        {submitState.error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
            {submitState.error}
          </div>
        )}

        {submitState.status === 'success' && !submitState.error && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-200">
            Feedback saved. Thank you!
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className={`inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition ${
            canSubmit ? 'hover:bg-blue-500' : 'cursor-not-allowed opacity-60'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit feedback'}
        </button>
      </form>
    </div>
  );
};

export default TicketFeedbackPanel;
