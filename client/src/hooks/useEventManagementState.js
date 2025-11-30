import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const useEventManagementState = (searchTerm = '') => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [organizerFilter, setOrganizerFilter] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/sign-in');
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await api.get('/admin/events', config);
        setEvents(response.data);
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('token');
          navigate('/sign-in');
        }
        setError('Failed to load events.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [navigate]);

  const uniqueCategories = useMemo(() => {
    return [...new Set(events.map((event) => event.category).filter(Boolean))];
  }, [events]);

  const uniqueOrganizers = useMemo(() => {
    const organizerMap = new Map();
    events.forEach((event) => {
      if (event.organizer) {
        organizerMap.set(
          event.organizer._id,
          event.organizer.organizationName || event.organizer.name,
        );
      }
    });
    return Array.from(organizerMap.entries());
  }, [events]);

  const filteredEvents = useMemo(() => {
    const term = (searchTerm || '').toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(term) ||
        (event.organizer?.name && event.organizer.name.toLowerCase().includes(term)) ||
        (event.organizer?.organizationName && event.organizer.organizationName.toLowerCase().includes(term));

      const matchesStatus = statusFilter ? event.status === statusFilter : true;
      const matchesCategory = categoryFilter ? event.category === categoryFilter : true;
      const matchesOrganizer = organizerFilter ? event.organizer?._id === organizerFilter : true;

      return matchesSearch && matchesStatus && matchesCategory && matchesOrganizer;
    });
  }, [events, searchTerm, statusFilter, categoryFilter, organizerFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event permanently?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await api.delete(`/admin/events/${id}`, config);
      setEvents((prev) => prev.filter((event) => event._id !== id));
      alert('Event deleted.');
    } catch (err) {
      alert(`Delete failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const clearFilters = () => {
    setStatusFilter('');
    setCategoryFilter('');
    setOrganizerFilter('');
  };

  return {
    events,
    filteredEvents,
    uniqueCategories,
    uniqueOrganizers,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    organizerFilter,
    setOrganizerFilter,
    clearFilters,
    handleDelete,
    loading,
    error,
  };
};

export default useEventManagementState;
