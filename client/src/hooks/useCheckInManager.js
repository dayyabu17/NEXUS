import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const useCheckInManager = (
  eventId,
  guestList,
  setGuestList,
  refreshGuests,
  setGuestError,
) => {
  const navigate = useNavigate();
  const [checkInMutations, setCheckInMutations] = useState({});

  const mergeGuestFromPayload = useCallback(
    (guestId, payload) => {
      if (!payload) {
        return;
      }

      const isCheckedIn = Boolean(payload.isCheckedIn || payload.status === 'checked-in');

      const normalized = {
        id: payload.ticketId || payload.id || guestId,
        name: payload.name || 'Unknown Guest',
        email: payload.email || 'unknown@nexus.app',
        status: payload.status || (isCheckedIn ? 'checked-in' : 'confirmed'),
        ticketId: payload.ticketId || payload.id || guestId,
        avatar: payload.avatar || null,
        checkedInAt: isCheckedIn
          ? payload.checkedInAt || payload.updatedAt || new Date().toISOString()
          : null,
        isCheckedIn,
        userId: payload.userId || null,
      };

      setGuestList((prevGuests) => {
        let exists = false;
        const nextGuests = prevGuests.map((guest) => {
          if (
            guest.id === guestId ||
            guest.ticketId === normalized.ticketId ||
            (normalized.userId && guest.userId === normalized.userId)
          ) {
            exists = true;
            return { ...guest, ...normalized };
          }
          return guest;
        });

        if (!exists) {
          nextGuests.push(normalized);
        }

        return nextGuests;
      });
    },
    [setGuestList],
  );

  const performCheckIn = useCallback(
    async (body, fallbackId) => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/sign-in');
        throw new Error('AUTH_REQUIRED');
      }

      try {
        const response = await api.post(
          '/tickets/check-in',
          body,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data?.guest) {
          mergeGuestFromPayload(fallbackId, response.data.guest);
        } else {
          await refreshGuests();
        }

        return response.data?.guest || null;
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.dispatchEvent(new CustomEvent('nexus-auth:changed', { detail: { user: null } }));
          navigate('/sign-in');
          throw err;
        }

        throw err;
      }
    },
    [mergeGuestFromPayload, navigate, refreshGuests],
  );

  const handleCheckIn = useCallback(
    async (guestId) => {
      const guest = guestList.find((item) => item.id === guestId);

      if (!guest) {
        return;
      }

      setCheckInMutations((prev) => ({ ...prev, [guestId]: true }));
      setGuestError?.('');

      try {
        const payload = guest.ticketId
          ? { ticketId: guest.ticketId }
          : guest.userId
            ? { userId: guest.userId, eventId }
            : null;

        if (!payload) {
          setGuestError?.('Guest record is missing ticket information.');
          return;
        }

        await performCheckIn(payload, guest.ticketId || guest.id);
      } catch (err) {
        const message =
          err?.response?.data?.message || 'Unable to check in this guest right now.';
        setGuestError?.(message);
      } finally {
        setCheckInMutations((prev) => {
          const next = { ...prev };
          delete next[guestId];
          return next;
        });
      }
    },
    [eventId, guestList, performCheckIn, setGuestError],
  );

  const handleUndoCheckIn = useCallback(
    async (guestId) => {
      const guest = guestList.find((item) => item.id === guestId);

      if (!guest) {
        return;
      }

      if (!guest.ticketId) {
        setGuestError?.('Only guests with valid tickets can be unchecked.');
        return;
      }

      setCheckInMutations((prev) => ({ ...prev, [guestId]: true }));
      setGuestError?.('');

      try {
        const token = localStorage.getItem('token');

        if (!token) {
          navigate('/sign-in');
          return;
        }

        const response = await api.patch(
          `/organizer/events/${eventId}/guests/${guest.ticketId}/check-in`,
          { checkedIn: false },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data?.guest) {
          mergeGuestFromPayload(guestId, response.data.guest);
        } else {
          await refreshGuests();
        }
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.dispatchEvent(new CustomEvent('nexus-auth:changed', { detail: { user: null } }));
          navigate('/sign-in');
        } else {
          const message =
            err?.response?.data?.message || 'Unable to update check-in status right now.';
          setGuestError?.(message);
        }
      } finally {
        setCheckInMutations((prev) => {
          const next = { ...prev };
          delete next[guestId];
          return next;
        });
      }
    },
    [eventId, guestList, mergeGuestFromPayload, navigate, refreshGuests, setGuestError],
  );

  const checkInByTicketId = useCallback(
    async (ticketId) => {
      if (!ticketId) {
        throw new Error('Missing ticket identifier.');
      }

      try {
        return await performCheckIn({ ticketId }, ticketId);
      } catch (err) {
        throw err;
      }
    },
    [performCheckIn],
  );

  return {
    handleCheckIn,
    handleUndoCheckIn,
    checkInMutations,
    checkInByTicketId,
  };
};

export default useCheckInManager;
