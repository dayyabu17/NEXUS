import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { resolveAccentPalette, DEFAULT_ACCENT, DEFAULT_BRAND_COLOR } from '../constants/accentTheme';
import { hexToRgba } from '../utils/color';

const hexPattern = /^#([0-9A-Fa-f]{6})$/;
const INITIAL_TICKET_STATUS = { checked: false, hasTicket: false, ticketId: null };

const useEventPage = (eventId) => {
  const [eventData, setEventData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [ticketStatus, setTicketStatus] = useState(INITIAL_TICKET_STATUS);

  const eventIdentifier = eventData?._id || eventData?.id;

  useEffect(() => {
    if (!eventId) {
      setEventData(null);
      setIsLoading(false);
      setError('Event not found.');
      return;
    }

    let isMounted = true;

    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/events/${eventId}`);
        if (!isMounted) {
          return;
        }

        setEventData(response.data);
        setError('');
      } catch (err) {
        if (!isMounted) {
          return;
        }

        if (err?.response?.status === 404) {
          setError('Event not found.');
        } else {
          setError('We ran into a problem loading this event. Please try again shortly.');
        }
        setEventData(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchEvent();

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const storedRaw = window.localStorage.getItem('user');
      if (!storedRaw) {
        return;
      }

      const stored = JSON.parse(storedRaw);
      if (stored && stored._id) {
        setCurrentUser(stored);
      }
    } catch (storageError) {
      console.warn('Unable to parse stored user details', storageError);
    }
  }, []);

  useEffect(() => {
    setTicketStatus(INITIAL_TICKET_STATUS);
  }, [eventIdentifier]);

  const fetchTicketStatus = useCallback(async () => {
    if (!eventIdentifier) {
      return;
    }

    if (!currentUser?._id) {
      setTicketStatus((prev) => (prev.checked ? prev : { ...INITIAL_TICKET_STATUS, checked: true }));
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const token = window.localStorage.getItem('token');
    if (!token) {
      setTicketStatus({ ...INITIAL_TICKET_STATUS, checked: true });
      return;
    }

    try {
      const response = await api.get(`/tickets/status/${eventIdentifier}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTicketStatus({
        checked: true,
        hasTicket: Boolean(response.data?.hasTicket),
        ticketId: response.data?.ticketId || null,
      });
    } catch (statusError) {
      console.warn('Ticket status unavailable', statusError);
      setTicketStatus({ ...INITIAL_TICKET_STATUS, checked: true });
    }
  }, [currentUser?._id, eventIdentifier]);

  useEffect(() => {
    if (!eventIdentifier) {
      return;
    }

    fetchTicketStatus();
  }, [eventIdentifier, fetchTicketStatus]);

  const accentId = useMemo(
    () => eventData?.organizer?.accentPreference || DEFAULT_ACCENT,
    [eventData?.organizer?.accentPreference]
  );

  const accentPalette = useMemo(() => resolveAccentPalette(accentId), [accentId]);

  const accentStyles = useMemo(
    () => ({
      chipBg: hexToRgba(accentPalette[500], 0.18),
      chipBorder: hexToRgba(accentPalette[500], 0.32),
      badgeBg: hexToRgba(accentPalette[600], 0.22),
      badgeBorder: hexToRgba(accentPalette[600], 0.38),
      highlight: accentPalette[600],
      highlightSoft: hexToRgba(accentPalette[500], 0.9),
      cardGradient: `linear-gradient(135deg, ${hexToRgba(accentPalette[500], 0.55)} 0%, ${hexToRgba(
        accentPalette[700],
        0.6
      )} 100%)`,
      cardShadow: `0 30px 80px ${hexToRgba(accentPalette[700], 0.35)}`,
      avatarRing: `0 0 0 3px ${hexToRgba(accentPalette[500], 0.45)}`,
      pathColor: hexToRgba(accentPalette[500], 0.75),
    }),
    [accentPalette]
  );

  const brandColor = useMemo(() => {
    const candidate = eventData?.organizer?.brandColor;
    if (typeof candidate === 'string' && hexPattern.test(candidate)) {
      return candidate.toUpperCase();
    }
    return DEFAULT_BRAND_COLOR;
  }, [eventData?.organizer?.brandColor]);

  const brandStyles = useMemo(
    () => ({
      color: brandColor,
      soft: hexToRgba(brandColor, 0.85),
      shadow: `0 20px 55px ${hexToRgba(brandColor, 0.3)}`,
    }),
    [brandColor]
  );

  return {
    eventData,
    isLoading,
    error,
    currentUser,
    ticketStatus,
    fetchTicketStatus,
    theme: {
      accentStyles,
      brandStyles,
      brandColor,
    },
  };
};

export default useEventPage;
