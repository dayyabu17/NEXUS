import React, { useMemo, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import QRCode from 'react-qr-code';

const gradientBorderClass = 'bg-[radial-gradient(circle_at_top_left,_#3b82f660,_transparent),radial-gradient(circle_at_bottom_right,_#a855f760,_transparent)]';

const formatDateTime = (input) => {
  if (!input) {
    return 'Date TBA';
  }

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return 'Date TBA';
  }

  return date.toLocaleString('en-NG', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const TicketCard = ({ ticket }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const event = ticket?.event ?? {};
  const rawStatus = ticket?.status;
  const ticketStatus =
    rawStatus === 'checked-in'
      ? 'Checked-In'
      : rawStatus === 'confirmed'
        ? 'Confirmed'
        : rawStatus || 'Pending';
  const displayDate = useMemo(() => formatDateTime(event?.date), [event?.date]);

  const handleToggle = () => {
    setIsFlipped((prev) => !prev);
  };

  const cardRotation = {
    rotateY: isFlipped ? 180 : 0,
  };
  return (
    <Motion.div
      className={`group relative h-[500px] w-full cursor-pointer select-none rounded-[28px] ${gradientBorderClass} p-[2px] shadow-[0_25px_60px_rgba(8,15,32,0.45)] transition-shadow hover:shadow-[0_35px_80px_rgba(10,20,45,0.55)] [perspective:1200px]`}
      onClick={handleToggle}
      whileHover={{ scale: 1.02 }}
    >
      <Motion.div
        className="relative h-full w-full rounded-[26px] bg-slate-950/95 shadow-[0_20px_45px_rgba(8,15,32,0.4)] [transform-style:preserve-3d]"
        initial={false}
        animate={cardRotation}
        transition={{ type: 'spring', duration: 0.5, stiffness: 140, damping: 18 }}
      >
        <div className="absolute inset-0 flex h-full w-full flex-col overflow-hidden rounded-[26px] border border-white/10 bg-slate-950/95 [backface-visibility:hidden]">
          <div className="relative h-40 w-full overflow-hidden">
            {event?.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title || 'Event cover'}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-900 text-white/40">
                No Cover Image
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-transparent" />
          </div>

          <div className="flex flex-1 flex-col gap-3 px-6 py-5 text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-white/40">Event</p>
                <h3 className="text-xl font-semibold leading-tight text-white/90">
                  {event?.title || 'Untitled Experience'}
                </h3>
              </div>
              <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                {ticketStatus}
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
              <p className="font-medium text-white">{displayDate}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-white/40">Date &amp; Time</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
              <p className="max-h-16 overflow-hidden font-medium text-white/90">
                {event?.location || 'Venue to be announced'}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-white/40">Location</p>
            </div>

            <div className="mt-auto flex items-center justify-between text-xs text-white/50">
              <span>Tap to flip</span>
              <span>Qty: {ticket?.quantity || 1}</span>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-4 rounded-[26px] bg-slate-50 px-6 text-center text-slate-900 [backface-visibility:hidden] [transform:rotateY(180deg)] dark:bg-white">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-[0_18px_45px_rgba(8,15,32,0.15)] dark:border-slate-800 dark:bg-white">
            <QRCode value={ticket?._id || 'invalid-ticket'} size={150} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">Ticket ID</h3>
            <p className="break-all text-sm text-slate-600">{ticket?._id}</p>
          </div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Show this to the organizer at the gate.
          </p>
          <span className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Tap to return</span>
        </div>
      </Motion.div>
    </Motion.div>
  );
};

export default TicketCard;
