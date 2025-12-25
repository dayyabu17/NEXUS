import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GuestLayout from '../layouts/GuestLayout';
import TicketCard from '../components/TicketCard';
import api from '../api/axios';

const STATUS = {
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error',
};

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState(STATUS.LOADING);
  const [message, setMessage] = useState('Fetching your tickets...');
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    if (hasFetched.current) {
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/sign-in');
      return;
    }

    const fetchTickets = async () => {
      try {
        const response = await api.get('/tickets/my-tickets', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!isMountedRef.current) {
          return;
        }

        const payload = Array.isArray(response.data?.tickets) ? response.data.tickets : [];
        setTickets(payload);
        setStatus(STATUS.READY);
        setMessage('');
      } catch (error) {
        console.error('Failed to load tickets', error);
        if (!isMountedRef.current) {
          return;
        }
        const fallback = error.response?.data?.message || 'Unable to load your tickets right now.';
        setStatus(STATUS.ERROR);
        setMessage(fallback);
      }
    };

    fetchTickets();

    return () => {
      isMountedRef.current = false;
    };
  }, [navigate]);

  const hasTickets = useMemo(() => tickets.length > 0, [tickets]);

  return (
    <GuestLayout mainClassName="mx-auto max-w-6xl px-6 pb-20 pt-24">
      <>
        <header className="mb-10 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-white/40">My wallet</p>
          <h1 className="text-4xl font-semibold text-slate-900 dark:text-white">Your Tickets</h1>
          <p className="max-w-2xl text-base text-slate-600 dark:text-white/60">
            Access every experience you have unlocked. Flip a ticket to reveal its QR code for entry.
          </p>
        </header>

        {status === STATUS.LOADING && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-[28px] border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-[#131b2a]/70"
              />
            ))}
          </div>
        )}

        {status === STATUS.ERROR && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-[28px] border border-red-200 bg-red-50 px-6 py-12 text-center dark:border-red-500/40 dark:bg-red-500/10">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">We hit a snag</h2>
            <p className="max-w-xl text-sm text-slate-600 dark:text-white/70">{message}</p>
            <button
              type="button"
              onClick={() => navigate('/guest/dashboard')}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Explore Events
            </button>
          </div>
        )}

        {status === STATUS.READY && !hasTickets && (
          <Motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-5 rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-white/10 dark:bg-[#11192a]/80 dark:shadow-[0_30px_80px_rgba(5,10,20,0.55)]"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-100 dark:border-white/15 dark:bg-white/5">
              <span className="text-2xl" aria-hidden>🎟️</span>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">No tickets yet</h2>
            <p className="max-w-md text-sm text-slate-600 dark:text-white/60">
              When you RSVP or purchase an event pass, it will appear here instantly. Discover new events to fill your wallet.
            </p>
            <button
              type="button"
              onClick={() => navigate('/guest/dashboard')}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Explore Events
            </button>
          </Motion.div>
        )}

        {status === STATUS.READY && hasTickets && (
          <Motion.section
            initial="hidden"
            animate="visible"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {tickets.map((ticket) => {
              if (!ticket?.event) {
                return null;
              }

              return (
                <Motion.div
                  key={ticket._id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                >
                  <TicketCard ticket={ticket} />
                </Motion.div>
              );
            })}
          </Motion.section>
        )}
      </>
    </GuestLayout>
  );
};

export default MyTickets;
