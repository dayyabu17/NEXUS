import React from 'react';
import { formatDateTime } from './eventViewUtils';

const OrganizerEventFeedback = ({
  feedbackList,
  feedbackLoading,
  feedbackError,
  resolveProfileImage,
}) => (
  <section className="rounded-3xl border border-white/10 bg-[rgba(21,26,36,0.72)] p-6 shadow-lg shadow-black/30">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">
        Attendee feedback
      </h3>
      <span className="text-xs text-white/50">{feedbackList.length} entries</span>
    </div>

    {feedbackLoading ? (
      <p className="mt-6 text-sm text-white/60">Loading feedback...</p>
    ) : feedbackError ? (
      <p className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-4 text-sm text-red-200">
        {feedbackError}
      </p>
    ) : feedbackList.length === 0 ? (
      <p className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-sm text-white/60">
        No feedback has been submitted yet. Encourage attendees to share their thoughts after the event.
      </p>
    ) : (
      <ul className="mt-6 space-y-4">
        {feedbackList.map((entry) => {
          const avatarSrc = resolveProfileImage(entry.user?.avatar);
          const ratingLabel = entry.rating ? `${entry.rating}/5` : null;

          return (
            <li
              key={entry.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full border border-white/15 bg-white/10">
                    <img
                      src={avatarSrc}
                      alt={entry.user?.name || 'Attendee'}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{entry.user?.name || 'Attendee'}</p>
                    <p className="text-xs text-white/60">
                      {entry.user?.email || 'unknown@nexus.app'}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-white/50">
                  {entry.createdAt ? formatDateTime(entry.createdAt) : 'Time unknown'}
                </div>
              </div>
              <p className="mt-4 text-sm text-white/80">{entry.message}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                {ratingLabel ? (
                  <span className="inline-flex items-center rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-amber-200">
                    Rating: {ratingLabel}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1">
                    No rating provided
                  </span>
                )}
                <span className="text-[11px] uppercase tracking-[0.25em] text-white/35">
                  Feedback #{entry.id?.toString().slice(-6) || '—'}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </section>
);

export default OrganizerEventFeedback;
