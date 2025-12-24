import React from 'react';
import { formatDateTime } from './eventViewUtils';
import EventScanner from './EventScanner';

const OrganizerEventCheckIns = ({ checkIns, onUndoCheckIn, checkInMutations, onScanTicket }) => (
  <section className="space-y-6">
    <EventScanner onScanTicket={onScanTicket} />

    <div className="rounded-3xl border border-white/10 bg-[rgba(21,26,36,0.72)] p-6 shadow-lg shadow-black/30">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">
          Check-in list
        </h3>
        <span className="text-xs text-white/50">{checkIns.length} checked in</span>
      </div>

      {checkIns.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-sm text-white/60">
          Nobody has been checked in yet. Use the guest list or QR scanner to check in attendees.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {checkIns.map((guest) => {
            const isMutating = Boolean(checkInMutations[guest.id]);

            return (
              <li
                key={guest.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-white">{guest.name}</p>
                  <p className="text-xs text-white/60">{guest.email}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/60">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-300" aria-hidden />
                    Checked in
                  </span>
                  <span>
                    {guest.checkedInAt ? formatDateTime(guest.checkedInAt) : 'Time unknown'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUndoCheckIn(guest.id)}
                    disabled={isMutating}
                    className={`rounded-full border border-white/15 px-4 py-2 text-white/70 transition ${
                      isMutating
                        ? 'cursor-not-allowed opacity-60'
                        : 'hover:border-white/35 hover:text-white'
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
