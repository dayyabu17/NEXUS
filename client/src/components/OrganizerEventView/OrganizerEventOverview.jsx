import React from 'react';
import { formatCurrency, formatDateTime } from './eventViewUtils';

const OrganizerEventOverview = ({ event }) => {
  if (!event) {
    return null;
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-[rgba(21,26,36,0.72)] p-8 shadow-lg shadow-black/30">
          <span className="text-xs uppercase tracking-[0.3em] text-white/50">Event summary</span>
          <h2 className="mt-4 text-3xl font-semibold text-white">{event.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70">{event.description}</p>
          <dl className="mt-6 grid gap-4 text-sm text-white/70 sm:grid-cols-2">
            <div className="space-y-1 rounded-2xl border border-white/10 bg-white/5 p-4">
              <dt className="text-xs uppercase tracking-[0.2em] text-white/50">When</dt>
              <dd className="text-base text-white">{formatDateTime(event.date)}</dd>
            </div>
            <div className="space-y-1 rounded-2xl border border-white/10 bg-white/5 p-4">
              <dt className="text-xs uppercase tracking-[0.2em] text-white/50">Where</dt>
              <dd className="text-base text-white">{event.location}</dd>
            </div>
            <div className="space-y-1 rounded-2xl border border-white/10 bg-white/5 p-4">
              <dt className="text-xs uppercase tracking-[0.2em] text-white/50">Category</dt>
              <dd className="text-base text-white">{event.category || 'Not set'}</dd>
            </div>
            <div className="space-y-1 rounded-2xl border border-white/10 bg-white/5 p-4">
              <dt className="text-xs uppercase tracking-[0.2em] text-white/50">Capacity</dt>
              <dd className="text-base text-white">{event.capacity || 'Unlimited'}</dd>
            </div>
          </dl>
          {event.tags && event.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[rgba(21,26,36,0.72)] p-6 shadow-lg shadow-black/30">
            <span className="text-xs uppercase tracking-[0.3em] text-white/50">Status</span>
            <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium text-white">
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
              {event.status || 'Pending'}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[rgba(21,26,36,0.72)] p-6 shadow-lg shadow-black/30 space-y-3">
            <span className="text-xs uppercase tracking-[0.3em] text-white/50">Ticketing</span>
            <p className="text-lg font-semibold text-white">
              {Number(event.registrationFee) > 0
                ? `${formatCurrency(event.registrationFee)} per ticket`
                : 'Free event'}
            </p>
            <p className="text-sm text-white/60">RSVPs recorded: {event.rsvpCount || 0}</p>
          </div>

          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="mx-auto h-[500px] w-[500px] max-w-full rounded-3xl border border-white/10 object-cover"
            />
          )}
        </aside>
      </section>
    </div>
  );
};

export default OrganizerEventOverview;
