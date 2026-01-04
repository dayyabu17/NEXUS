import React from 'react';
import { formatGuestStatus } from './eventViewUtils';

const OrganizerEventGuests = ({
  guestForm,
  onGuestInputChange,
  onAddGuest,
  guestList,
  guestLoading,
  guestError,
  eventHasStarted,
  onCheckIn,
  onUndoCheckIn,
  checkInMutations,
  resolveProfileImage,
}) => (
  <div className="space-y-8">
    <form
      onSubmit={onAddGuest}
      className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 text-slate-700 shadow-sm transition dark:border-white/10 dark:bg-[rgba(21,26,36,0.72)] dark:text-white dark:shadow-lg dark:shadow-black/30 sm:grid-cols-[1.2fr_1.2fr_auto]"
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="guest-name"
          className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-white/50"
        >
          Full name
        </label>
        <input
          id="guest-name"
          value={guestForm.name}
          onChange={onGuestInputChange('name')}
          placeholder="Add guest name"
          className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white dark:placeholder:text-white/40 dark:focus:border-slate-500 dark:focus:ring-0"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="guest-email"
          className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-white/50"
        >
          Email address
        </label>
        <input
          id="guest-email"
          type="email"
          value={guestForm.email}
          onChange={onGuestInputChange('email')}
          placeholder="guest@email.com"
          className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white dark:placeholder:text-white/40 dark:focus:border-slate-500 dark:focus:ring-0"
          required
        />
      </div>
      <button
        type="submit"
        className="self-end rounded-2xl border border-slate-200 bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:border-white/10 dark:bg-white dark:text-black dark:hover:bg-white/80"
      >
        Add guest
      </button>
    </form>

    <section className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-700 shadow-sm transition dark:border-white/10 dark:bg-[rgba(21,26,36,0.72)] dark:text-white dark:shadow-lg dark:shadow-black/30">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-white/60">
          Guest list
        </h3>
        <span className="text-xs text-slate-500 dark:text-white/50">{guestList.length} total</span>
      </div>

      {guestLoading ? (
        <p className="mt-6 text-sm text-slate-500 dark:text-white/60">Loading RSVPs...</p>
      ) : guestError ? (
        <p className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
          {guestError}
        </p>
      ) : guestList.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500 dark:border-white/15 dark:bg-white/5 dark:text-white/60">
          No RSVPs yet.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {!eventHasStarted && (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200">
              Check-in buttons stay disabled until the scheduled start time passes.
            </p>
          )}
          <ul className="space-y-3">
            {guestList.map((guest) => {
              const isMutating = Boolean(checkInMutations[guest.id]);
              const hasBackendIdentity = Boolean(guest.ticketId || guest.userId);
              const manualEntry = !hasBackendIdentity;
              const isCheckedIn = Boolean(guest.isCheckedIn);
              const checkInTitle = !eventHasStarted
                ? 'Check-in opens once the event starts.'
                : manualEntry
                  ? 'This guest is not linked to a ticket; check-in is disabled.'
                  : undefined;

              return (
                <li
                  key={guest.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 transition sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-white/15 dark:bg-white/10">
                      <img
                        src={resolveProfileImage(guest.avatar)}
                        alt={guest.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{guest.name}</p>
                      <p className="text-xs text-slate-600 dark:text-white/60">{guest.email}</p>
                      {manualEntry && (
                        <p className="text-[11px] text-slate-500 dark:text-white/40">Manual entry</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs ${
                        isCheckedIn
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white/70'
                      }`}
                    >
                      {formatGuestStatus(guest.status, isCheckedIn)}
                    </span>
                    {isCheckedIn ? (
                      <button
                        type="button"
                        onClick={() => onUndoCheckIn(guest.id)}
                        disabled={isMutating}
                        className={`rounded-full px-4 py-2 text-xs transition ${
                          isMutating
                            ? 'border-slate-300 text-slate-600 cursor-not-allowed opacity-60 dark:border-white/15 dark:text-white/70'
                            : 'border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-800 dark:border-white/15 dark:text-white/70 dark:hover:border-white/40 dark:hover:text-white'
                        }`}
                      >
                        {isMutating ? 'Updating...' : 'Undo'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onCheckIn(guest.id)}
                        disabled={isMutating || !eventHasStarted || manualEntry}
                        title={checkInTitle}
                        className={`rounded-full px-4 py-2 text-xs transition ${
                          isMutating || !eventHasStarted || manualEntry
                            ? 'border-emerald-300 text-emerald-700 cursor-not-allowed opacity-60 dark:border-emerald-400/40 dark:text-emerald-200'
                            : 'border-emerald-300 text-emerald-700 hover:border-emerald-400 hover:text-emerald-800 dark:border-emerald-400/40 dark:text-emerald-200 dark:hover:border-emerald-300 dark:hover:text-emerald-100'
                        }`}
                      >
                        {isMutating ? 'Updating...' : 'Mark checked in'}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  </div>
);

export default OrganizerEventGuests;
