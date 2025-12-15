import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const TIMER_INTERVAL_MS = 15000;

const useEventDetails = (eventId) => {
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, TIMER_INTERVAL_MS);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/sign-in');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/organizer/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvent(response.data);
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/sign-in');
        } else {
          setError(err?.response?.data?.message || 'Unable to load event right now.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId, navigate]);

  const eventHasStarted = useMemo(() => {
    if (!event?.date) {
      return false;
    }

    const startTimestamp = new Date(event.date).getTime();
    if (Number.isNaN(startTimestamp)) {
      return false;
    }

    return currentTime >= startTimestamp;
  }, [event?.date, currentTime]);

  return { event, loading, error, eventHasStarted };
};

export default useEventDetails;
