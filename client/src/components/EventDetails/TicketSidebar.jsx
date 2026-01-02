import { useMemo } from 'react';

const TicketSidebar = ({ eventData, ticketStatus, theme, brandStyles, onOpenCheckout }) => {
  const accentStyles = theme?.accentStyles || theme;
  const hasTicket = Boolean(ticketStatus?.hasTicket);

  const registrationFee = eventData?.registrationFee;

  const registrationLabel = useMemo(() => {
    const feeValue = Number(registrationFee);
    if (Number.isFinite(feeValue) && feeValue > 0) {
      return `₦${feeValue.toLocaleString('en-NG', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    }
    return 'Free';
  }, [registrationFee]);

  return (
    <aside className="space-y-6">
      <div
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900"
        style={{
          boxShadow: accentStyles.cardShadow,
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-white/60">Ticket</p>
            <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">{registrationLabel}</p>
          </div>
          <button
            type="button"
            onClick={onOpenCheckout}
            disabled={hasTicket}
            style={{
              '--brand-color': brandStyles?.color,
              '--brand-soft': brandStyles?.soft,
              boxShadow: brandStyles?.shadow,
            }}
            className="inline-flex items-center justify-center rounded-full bg-[var(--brand-color)] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-soft)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {hasTicket ? 'You’re attending' : 'Get Ticket'}
          </button>
        </div>
        {hasTicket ? (
          <p className="mt-4 text-sm text-slate-700 dark:text-white/85">
            You’re all set! Your ticket is saved under My Tickets—see you there.
          </p>
        ) : (
          <p className="mt-4 text-xs text-slate-600 dark:text-white/70">
            Secure your spot now. You can cancel anytime up to 24 hours before the event.
          </p>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-[#0b1220]/80 dark:shadow-[0_30px_80px_rgba(5,10,25,0.35)]">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-white/60">Hosted by</h3>
        <div className="mt-4 flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-white shadow-lg transition"
            style={{
              background: accentStyles.highlight,
              boxShadow: eventData?.organizer?.avatarRingEnabled ? accentStyles.avatarRing : '0 0 0 1px rgba(255,255,255,0.12)',
            }}
          >
            {eventData?.organizer?.name?.[0]?.toUpperCase() || 'N'}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {eventData?.organizer?.organizationName || eventData?.organizer?.name || 'Nexus Organizer'}
            </p>
            {eventData?.organizer?.email && (
              <p className="text-sm text-slate-600 dark:text-white/60">{eventData.organizer.email}</p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default TicketSidebar;
