import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { createGuestRecord } from '../components/OrganizerEventView/eventViewUtils';

const useEventGuests = (eventId) => {
  const navigate = useNavigate();
  const [guestList, setGuestList] = useState([]);
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState('');
  const [guestForm, setGuestForm] = useState({ name: '', email: '' });

  const refreshGuests = useCallback(async () => {
    setGuestLoading(true);
    setGuestError('');

    if (!eventId) {
      setGuestLoading(false);
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/sign-in');
      setGuestLoading(false);
      return;
    }

    try {
      const response = await api.get(`/organizer/events/${eventId}/guests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const tickets = Array.isArray(response.data) ? response.data : [];

      const normalizedGuests = tickets.map((ticket) => ({
        id: ticket._id,
        name: ticket.user?.name || 'Unknown Guest',
        email: ticket.user?.email || ticket.email || 'unknown@nexus.app',
        status: ticket.status || 'confirmed',
        ticketId: ticket._id,
        avatar: ticket.user?.profilePicture || null,
        checkedInAt:
          ticket.status === 'checked-in' || ticket.isCheckedIn
            ? ticket.checkedInAt || ticket.updatedAt || ticket.createdAt || null
            : null,
        isCheckedIn: Boolean(ticket.isCheckedIn || ticket.status === 'checked-in'),
        userId: ticket.user?._id || ticket.user || null,
      }));

      setGuestList(normalizedGuests);
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/sign-in');
      } else {
        setGuestError(err?.response?.data?.message || 'Unable to load guests right now.');
      }
    } finally {
      setGuestLoading(false);
    }
  }, [eventId, navigate]);

  const handleGuestInputChange = useCallback((field) => (evt) => {
    const { value } = evt.target;
    setGuestForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleAddGuest = useCallback((evt) => {
    evt.preventDefault();
    const name = guestForm.name.trim();
    const email = guestForm.email.trim();

    if (!name || !email) {
      return;
    }

    setGuestList((prev) => [...prev, createGuestRecord(name, email)]);
    setGuestForm({ name: '', email: '' });
  }, [guestForm]);

  return {
    guestList,
    setGuestList,
    guestLoading,
    guestError,
    setGuestError,
    guestForm,
    handleGuestInputChange,
    handleAddGuest,
    refreshGuests,
  };
};

export default useEventGuests;
