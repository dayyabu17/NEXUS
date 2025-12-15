import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const normalizeStatus = (value) =>
  (value || '')
    .toString()
    .toLowerCase()
    .replace(/[_\s-]/g, '');

const useCheckInManager = (
  eventId,
  guestList,
  setGuestList,
  eventHasStarted,
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

      const normalizedStatus = normalizeStatus(payload.status);
      const isCheckedIn = normalizedStatus === 'checkedin';

      const normalized = {
        id: payload.ticketId || payload.id || guestId,
        name: payload.name || 'Unknown Guest',
        email: payload.email || 'unknown@nexus.app',
        status: isCheckedIn ? 'checked-in' : payload.status || 'confirmed',
        ticketId: payload.ticketId || payload.id || guestId,
        avatar: payload.avatar || null,
        checkedInAt: isCheckedIn
          ? payload.checkedInAt || payload.updatedAt || new Date().toISOString()
          : null,
      };

      setGuestList((prevGuests) => {
        const nextGuests = prevGuests.map((guest) => {
          if (
            guest.id === guestId ||
            (normalized.ticketId && guest.ticketId === normalized.ticketId)
          ) {
            return { ...guest, ...normalized };
          }
          return guest;
        });

        const exists = nextGuests.some(
          (guest) =>
            guest.id === normalized.id || guest.ticketId === normalized.ticketId,
        );

        if (!exists) {
          nextGuests.push(normalized);
        }

        return nextGuests;
      });
    },
    [setGuestList],
  );

  const handleCheckIn = useCallback(
    async (guestId) => {
      const guest = guestList.find((item) => item.id === guestId);

      if (!guest) {
        return;
      }

      if (!eventHasStarted) {
        setGuestError?.('Check-in becomes available once the event has started.');
        return;
      }

      if (!guest.ticketId) {
        setGuestError?.('');
        setGuestList((prevGuests) =>
          prevGuests.map((item) =>
            item.id === guestId
              ? {
                  ...item,
                  status: 'checked-in',
                  checkedInAt: item.checkedInAt || new Date().toISOString(),
                }
              : item,
          ),
        );
        return;
      }

      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/sign-in');
        return;
      }

      setCheckInMutations((prev) => ({ ...prev, [guestId]: true }));
      setGuestError?.('');

      try {
        const response = await api.patch(
          `/organizer/events/${eventId}/guests/${guest.ticketId}/check-in`,
          { checkedIn: true },
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
    [eventHasStarted, eventId, guestList, mergeGuestFromPayload, navigate, refreshGuests, setGuestError, setGuestList],
  );

  const handleUndoCheckIn = useCallback(
    async (guestId) => {
      const guest = guestList.find((item) => item.id === guestId);

      if (!guest) {
        return;
      }

      if (!guest.ticketId) {
        setGuestError?.('');
        setGuestList((prevGuests) =>
          prevGuests.map((item) =>
            item.id === guestId
              ? {
                  ...item,
                  status: 'confirmed',
                  checkedInAt: null,
                }
              : item,
          ),
        );
        return;
      }

      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/sign-in');
        return;
      }

      setCheckInMutations((prev) => ({ ...prev, [guestId]: true }));
      setGuestError?.('');

      try {
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
    [eventId, guestList, mergeGuestFromPayload, navigate, refreshGuests, setGuestError, setGuestList],
  );

  return {
    handleCheckIn,
    handleUndoCheckIn,
    checkInMutations,
  };
};

export default useCheckInManager;
