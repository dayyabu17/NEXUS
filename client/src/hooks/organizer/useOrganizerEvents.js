import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

const useOrganizerEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterMenuRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/sign-in');
        return;
      }

      try {
        const response = await api.get('/organizer/events', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!isMounted) {
          return;
        }

        setEvents(response.data);
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.dispatchEvent(new CustomEvent('nexus-auth:changed', { detail: { user: null } }));
          navigate('/sign-in');
          return;
        }

        if (isMounted) {
          setError(err.response?.data?.message || 'Unable to load events.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const toggleFilterMenu = useCallback(() => {
    setShowFilterMenu((prev) => !prev);
  }, []);

  const selectStatusFilter = useCallback((value) => {
    setStatusFilter(value);
    setShowFilterMenu(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };

    if (showFilterMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterMenu]);

  const filteredEvents = useMemo(() => {
    if (statusFilter === 'all') {
      return events;
    }

    return events.filter(
      (event) => (event.status || '').toLowerCase() === statusFilter,
    );
  }, [events, statusFilter]);

  const groupedEvents = useMemo(() => {
    const groups = new Map();

    filteredEvents.forEach((event) => {
      const date = new Date(event.date);
      const key = date.toISOString().split('T')[0];
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push({ ...event, date });
    });

    return Array.from(groups.entries())
      .map(([key, items]) => {
        const sortedItems = items.sort((a, b) => a.date - b.date);
        return {
          key,
          date: sortedItems[0]?.date || new Date(key),
          items: sortedItems,
        };
      })
      .sort((a, b) => a.date - b.date);
  }, [filteredEvents]);

  const activeFilterLabel = useMemo(
    () => statusOptions.find((option) => option.value === statusFilter)?.label,
    [statusFilter],
  );

  return {
    loading,
    error,
    showFilterMenu,
    statusFilter,
    statusOptions,
    filterMenuRef,
    toggleFilterMenu,
    selectStatusFilter,
    activeFilterLabel,
    filteredEvents,
    groupedEvents,
  };
};

export default useOrganizerEvents;
