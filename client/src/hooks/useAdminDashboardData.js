import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const useAdminDashboardData = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    totalUsers: 0,
    totalOrganizers: 0,
    totalEvents: 0,
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/sign-in');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const statsResponse = await api.get('/admin/stats', config);
        setStats(statsResponse.data);

        const eventsResponse = await api.get('/admin/events/pending', config);
        setEvents(eventsResponse.data);
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/sign-in');
        }
        setError('Error loading dashboard data. Check server connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]);

  const statsDisplay = [
    { name: 'Pending Approvals', value: stats.pendingApprovals },
    { name: 'Total Users', value: stats.totalUsers },
    { name: 'Total Organizers', value: stats.totalOrganizers },
    { name: 'Total Events', value: stats.totalEvents },
  ];

  return {
    statsDisplay,
    events,
    loading,
    error,
  };
};

export default useAdminDashboardData;
