import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { formatCurrency } from '../components/OrganizerDashboard/dashboardUtils';

const defaultStats = {
  totalUpcomingRsvps: 0,
  totalUpcomingRsvpsChange: 0,
  totalRevenue: 0,
  totalRevenueChange: 0,
  activeEvents: 0,
  activeEventsChange: 0,
};

const defaultTrends = {
  rsvps: [],
  revenue: [],
  active: [],
};

const defaultDashboardState = {
  stats: defaultStats,
  upcomingEvents: [],
  activities: [],
  trends: defaultTrends,
};

const useOrganizerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(defaultDashboardState);
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      return window.sessionStorage.getItem('showWelcome') === 'true';
    } catch {
      return false;
    }
  });

  const organizerProfile = useMemo(() => {
    const fallbackName = 'Organizer';
    const fallbackAvatar = '/images/default-avatar.jpeg';
    const user = localStorage.getItem('user');

    if (!user) {
      return {
        name: fallbackName,
        firstName: fallbackName,
        avatar: fallbackAvatar,
      };
    }

    try {
      const parsed = JSON.parse(user);
      const name = parsed?.name?.trim() || fallbackName;
      const firstName = name.split(' ')[0] || fallbackName;
      const avatar = parsed?.profilePicture || fallbackAvatar;

      return {
        name,
        firstName,
        avatar,
      };
    } catch {
      return {
        name: fallbackName,
        firstName: fallbackName,
        avatar: fallbackAvatar,
      };
    }
  }, []);

  const dismissSplash = useCallback(() => {
    setShowSplash(false);

    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.sessionStorage.removeItem('showWelcome');
    } catch {
      // Ignore storage errors (e.g., private browsing)
    }
  }, []);

  useEffect(() => {
    if (!showSplash || typeof window === 'undefined') {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      dismissSplash();
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [dismissSplash, showSplash]);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/sign-in');
        return;
      }

      try {
        const response = await api.get('/organizer/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const stats = response.data?.stats || defaultStats;

        const nextEvents = (response.data?.upcomingEvents || [])
          .filter((event) => {
            const eventDate = new Date(event.date).getTime();
            return !Number.isNaN(eventDate) && eventDate >= Date.now();
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3);

        if (!isMounted) {
          return;
        }

        setDashboardData({
          stats,
          upcomingEvents: nextEvents,
          activities: response.data?.activities || [],
          trends: response.data?.trends || defaultTrends,
        });
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/sign-in');
          return;
        }

        if (isMounted) {
          setError(err.response?.data?.message || 'Unable to load dashboard data.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const statsCards = useMemo(
    () => [
      {
        id: 'rsvps',
        title: 'Total Upcoming RSVPs',
        value: dashboardData.stats.totalUpcomingRsvps,
        change: dashboardData.stats.totalUpcomingRsvpsChange,
        formatter: null,
        trendSeries: dashboardData.trends?.rsvps || [],
        color: '#4d997a',
      },
      {
        id: 'revenue',
        title: 'Total Revenue',
        value: dashboardData.stats.totalRevenue,
        change: dashboardData.stats.totalRevenueChange,
        formatter: formatCurrency,
        trendSeries: dashboardData.trends?.revenue || [],
        color: '#6c9bff',
      },
      {
        id: 'active-events',
        title: 'Active Events',
        value: dashboardData.stats.activeEvents,
        change: dashboardData.stats.activeEventsChange,
        formatter: null,
        trendSeries: dashboardData.trends?.active || [],
        color: '#f7b853',
      },
    ],
    [dashboardData.stats, dashboardData.trends],
  );

  const recentActivities = useMemo(
    () => dashboardData.activities.slice(0, 3),
    [dashboardData.activities],
  );

  return {
    organizerProfile,
    loading,
    error,
    showSplash,
    statsCards,
    upcomingEvents: dashboardData.upcomingEvents,
    recentActivities,
  };
};

export default useOrganizerDashboard;
