import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const useEventFeedback = (eventId) => {
  const navigate = useNavigate();
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  const refreshFeedback = useCallback(async () => {
    setFeedbackLoading(true);
    setFeedbackError('');

    if (!eventId) {
      setFeedbackLoading(false);
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/sign-in');
      setFeedbackLoading(false);
      return;
    }

    try {
      const response = await api.get(`/organizer/events/${eventId}/feedback`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = Array.isArray(response.data?.feedback)
        ? response.data.feedback
        : [];

      setFeedbackList(payload);
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('nexus-auth:changed', { detail: { user: null } }));
        navigate('/sign-in');
      } else {
        setFeedbackError(err?.response?.data?.message || 'Unable to load feedback right now.');
      }
    } finally {
      setFeedbackLoading(false);
    }
  }, [eventId, navigate]);

  return { feedbackList, feedbackLoading, feedbackError, refreshFeedback };
};

export default useEventFeedback;
