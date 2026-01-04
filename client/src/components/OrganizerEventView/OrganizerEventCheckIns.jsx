import React from 'react';
import { formatDateTime } from './eventViewUtils';
import EventScanner from './EventScanner';

const OrganizerEventCheckIns = ({ checkIns, onUndoCheckIn, checkInMutations, onScanTicket }) => (
  <section className="space-y-6">
    <EventScanner onScanTicket={onScanTicket} />

    <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-700 shadow-sm transition dark:border-white/10 dark:bg-[rgba(21,26,36,0.72)] dark:text-white dark:shadow-lg dark:shadow-black/30">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-white/60">
          Check-in list
        </h3>
        <span className="text-xs text-slate-500 dark:text-white/50">{checkIns.length} checked in</span>
      </div>

      {checkIns.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500 dark:border-white/15 dark:bg-white/5 dark:text-white/60">
          Nobody has been checked in yet. Use the guest list or QR scanner to check in attendees.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {checkIns.map((guest) => {
            const isMutating = Boolean(checkInMutations[guest.id]);

            return (
              <li
                key={guest.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 transition sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{guest.name}</p>
                  <p className="text-xs text-slate-600 dark:text-white/60">{guest.email}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-white/60">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-300" aria-hidden />
                    Checked in
                  </span>
                  <span className="text-slate-600 dark:text-white/60">
                    {guest.checkedInAt ? formatDateTime(guest.checkedInAt) : 'Time unknown'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUndoCheckIn(guest.id)}
                    disabled={isMutating}
                    className={`rounded-full px-4 py-2 text-xs transition ${
                      isMutating
                        ? 'border-slate-300 text-slate-600 cursor-not-allowed opacity-60 dark:border-white/15 dark:text-white/70'
                        : 'border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-800 dark:border-white/15 dark:text-white/70 dark:hover:border-white/35 dark:hover:text-white'
                    }`}
                  >
                    {isMutating ? 'Updating...' : 'Undo'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  </section>
);

export default OrganizerEventCheckIns;
