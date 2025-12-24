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
      className="grid gap-4 rounded-3xl border border-white/10 bg-[rgba(21,26,36,0.72)] p-6 shadow-lg shadow-black/30 sm:grid-cols-[1.2fr_1.2fr_auto]"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="guest-name" className="text-xs uppercase tracking-[0.25em] text-white/50">
          Full name
        </label>
        <input
          id="guest-name"
          value={guestForm.name}
          onChange={onGuestInputChange('name')}
          placeholder="Add guest name"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="guest-email" className="text-xs uppercase tracking-[0.25em] text-white/50">
          Email address
        </label>
        <input
          id="guest-email"
          type="email"
          value={guestForm.email}
          onChange={onGuestInputChange('email')}
          placeholder="guest@email.com"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
          required
        />
      </div>
      <button
        type="submit"
        className="self-end rounded-2xl border border-white/10 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/80"
      >
        Add guest
      </button>
    </form>

    <section className="rounded-3xl border border-white/10 bg-[rgba(21,26,36,0.72)] p-6 shadow-lg shadow-black/30">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">
          Guest list
        </h3>
        <span className="text-xs text-white/50">{guestList.length} total</span>
      </div>

      {guestLoading ? (
        <p className="mt-6 text-sm text-white/60">Loading RSVPs...</p>
      ) : guestError ? (
        <p className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-4 text-sm text-red-200">
          {guestError}
        </p>
      ) : guestList.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-sm text-white/60">
          No RSVPs yet.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {!eventHasStarted && (
            <p className="rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
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
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-white/15 bg-white/10">
                      <img
                        src={resolveProfileImage(guest.avatar)}
                        alt={guest.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{guest.name}</p>
                      <p className="text-xs text-white/60">{guest.email}</p>
                      {manualEntry && (
                        <p className="text-[11px] text-white/40">Manual entry</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs ${
                        isCheckedIn
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {formatGuestStatus(guest.status, isCheckedIn)}
                    </span>
                    {isCheckedIn ? (
                      <button
                        type="button"
                        onClick={() => onUndoCheckIn(guest.id)}
                        disabled={isMutating}
                        className={`rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 transition ${
                          isMutating
                            ? 'cursor-not-allowed opacity-60'
                            : 'hover:border-white/40 hover:text-white'
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
                        className={`rounded-full border border-emerald-400/40 px-4 py-2 text-xs text-emerald-200 transition ${
                          isMutating || !eventHasStarted || manualEntry
                            ? 'cursor-not-allowed opacity-60'
                            : 'hover:border-emerald-300 hover:text-emerald-100'
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
