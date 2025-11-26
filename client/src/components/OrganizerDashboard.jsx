import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import OrganizerLayoutDark from './OrganizerLayoutDark';
import api from '../api/axios';

const SPLASH_STORAGE_KEY = 'hasSeenSplash';

const formatCurrency = (value) => {
  if (!value) {
    return '₦0';
  }

  if (value >= 1_000_000) {
    return `₦${(value / 1_000_000).toFixed(2)}M`;
  }

  if (value >= 1_000) {
    return `₦${(value / 1_000).toFixed(2)}K`;
  }

  return `₦${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

const getStatusConfig = (status) => {
  switch (status) {
    case 'approved':
      return { label: 'Approved', badgeClass: 'bg-[#7ba743]' };
    case 'rejected':
      return { label: 'Rejected', badgeClass: 'bg-[#802020]' };
    default:
      return { label: 'Pending', badgeClass: 'bg-[#5a3f00]' };
  }
};

const formatEventDate = (dateString) => {
  const date = new Date(dateString);
  return {
    timelineLabel: date.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' }),
    timeLabel: date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }),
    fullDateLabel: date.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  };
};

const relativeTimeFromNow = (dateString) => {
  if (!dateString) {
    return '';
  }
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return 'Just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
};

const AnimatedStatValue = ({ value, formatter, animate, delay = 0, duration = 900 }) => {
  const nodeRef = useRef(null);
  const target = Number(value) || 0;

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) {
      return undefined;
    }

    const formatValue = (input) => {
      const rounded = Math.round(input);
      if (formatter) {
        return formatter(rounded);
      }
      return rounded.toLocaleString();
    };

    if (!animate) {
      node.textContent = formatValue(target);
      return undefined;
    }

    let start;
    let rafId;
    let timeoutId;

    const step = (timestamp) => {
      if (start === undefined) {
        start = timestamp;
      }
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress) * (1 - progress); // easeOutCubic
      const current = target * eased;
      node.textContent = formatValue(current);

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    if (delay > 0) {
      timeoutId = window.setTimeout(() => {
        rafId = requestAnimationFrame(step);
      }, delay);
    } else {
      rafId = requestAnimationFrame(step);
    }

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [animate, delay, duration, formatter, target]);

  const initial = animate
    ? formatter
      ? formatter(0)
      : '0'
    : formatter
      ? formatter(target)
      : target.toLocaleString();
  return <span ref={nodeRef}>{initial}</span>;
};

const StatSparkline = ({ data, color = '#4d997a', animate, delay = 0, id }) => {
  const svgWidth = 112;
  const svgHeight = 56;

  const values = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return [0];
    }
    return data.map((point) => {
      if (typeof point === 'number') {
        return point;
      }
      if (point && typeof point === 'object') {
        return Number(point.value) || 0;
      }
      return 0;
    });
  }, [data]);

  const { pathD, areaD, lastPoint } = useMemo(() => {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const step = values.length > 1 ? svgWidth / (values.length - 1) : svgWidth;

    let pathString = '';

    values.forEach((value, index) => {
      const x = index * step;
      const normalized = (value - min) / range;
      const y = svgHeight - normalized * svgHeight;
      pathString += index === 0 ? `M${x} ${y}` : ` L${x} ${y}`;
    });

    const areaString = `${pathString} L${svgWidth} ${svgHeight} L0 ${svgHeight} Z`;
    const lastIndex = values.length - 1;
    const lastValue = values[lastIndex];
    const normalizedLast = (lastValue - min) / range;
    const lastY = svgHeight - normalizedLast * svgHeight;

    return {
      pathD: pathString,
      areaD: areaString,
      lastPoint: { x: lastIndex * step, y: lastY },
    };
  }, [values]);

  const transitionClass = animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2';

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className={`h-14 w-28 transform transition-all duration-700 ease-out ${transitionClass}`}
      style={{ transitionDelay: `${delay}ms` }}
      role="img"
      aria-labelledby={`sparkline-${id}`}
    >
      <title id={`sparkline-${id}`}>Recent trend</title>
      <defs>
        <linearGradient id={`sparkline-area-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sparkline-area-${id})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={lastPoint.x} cy={lastPoint.y} r="3" fill={color} />
    </svg>
  );
};

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUpcomingRsvps: 0,
      totalUpcomingRsvpsChange: 0,
      totalRevenue: 0,
      totalRevenueChange: 0,
      activeEvents: 0,
      activeEventsChange: 0,
    },
    upcomingEvents: [],
    activities: [],
    trends: {
      rsvps: [],
      revenue: [],
      active: [],
    },
  });

  const organizerProfile = useMemo(() => {
    const user = localStorage.getItem('user');
    const fallbackName = 'Organizer';
    const fallbackAvatar = '/images/default-avatar.jpeg';

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

  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      return !window.sessionStorage.getItem(SPLASH_STORAGE_KEY);
    } catch {
      return true;
    }
  });
  const splashFlagRef = useRef(false);

  useEffect(() => {
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
        const stats = response.data?.stats || {
          totalUpcomingRsvps: 0,
          totalUpcomingRsvpsChange: 0,
          totalRevenue: 0,
          totalRevenueChange: 0,
          activeEvents: 0,
          activeEventsChange: 0,
        };

        const nextEvents = (response.data?.upcomingEvents || [])
          .filter((event) => {
            const eventDate = new Date(event.date).getTime();
            return !Number.isNaN(eventDate) && eventDate >= Date.now();
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3);

        setDashboardData({
          stats,
          upcomingEvents: nextEvents,
          activities: response.data?.activities || [],
          trends: response.data?.trends || {
            rsvps: [],
            revenue: [],
            active: [],
          },
        });
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/sign-in');
          return;
        }
        setError(err.response?.data?.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  useEffect(() => {
    if (!showSplash || splashFlagRef.current || typeof window === 'undefined') {
      return;
    }

    try {
      window.sessionStorage.setItem(SPLASH_STORAGE_KEY, 'true');
    } catch {
      // Ignore storage errors (e.g., private browsing)
    }

    splashFlagRef.current = true;
  }, [showSplash]);

  useEffect(() => {
    if (!showSplash || loading) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setShowSplash(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [loading, showSplash]);

  const statsCards = [
    {
      id: 'rsvps',
      title: 'Total Upcoming RSVPs',
      value: dashboardData.stats.totalUpcomingRsvps,
      change: dashboardData.stats.totalUpcomingRsvpsChange,
      trendKey: 'rsvps',
      color: '#4d997a',
    },
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: dashboardData.stats.totalRevenue,
      change: dashboardData.stats.totalRevenueChange,
      formatter: formatCurrency,
      trendKey: 'revenue',
      color: '#6c9bff',
    },
    {
      id: 'active-events',
      title: 'Active Events',
      value: dashboardData.stats.activeEvents,
      change: dashboardData.stats.activeEventsChange,
      trendKey: 'active',
      color: '#f7b853',
    },
  ];

  const recentActivities = useMemo(
    () => dashboardData.activities.slice(0, 3),
    [dashboardData.activities],
  );

  return (
    <OrganizerLayoutDark suppressInitialLoader>
      <div className="relative min-h-screen bg-slate-950">
        <AnimatePresence mode="wait">
          {showSplash && (
              <Motion.div
              key="splash"
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950"
                exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                transition={{ duration: 1.6, ease: 'easeInOut' }}
            >
              <div className="absolute h-32 w-32 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 blur-2xl animate-[spin_12s_linear_infinite]" />
              <img
                src={organizerProfile.avatar}
                alt="Organizer profile"
                className="relative z-10 h-24 w-24 rounded-full border-4 border-slate-950 object-cover shadow-[0_10px_40px_rgba(46,134,222,0.45)]"
              />
              <Motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 1.2, ease: 'easeOut' }}
                className="relative z-10 mt-8 text-2xl font-bold text-white"
              >
                Welcome to Nexus, {organizerProfile.firstName}
              </Motion.h1>
            </Motion.div>
          )}
        </AnimatePresence>

        {loading && !showSplash && (
          <div className="flex min-h-[50vh] items-center justify-center text-sm text-white/60">
            Loading dashboard...
          </div>
        )}

        {!loading && (
          <section className="pb-16">
            <header className="pt-6">
              <h1 className="text-4xl font-semibold tracking-tight">
                Hello, {organizerProfile.name}
                <span className="ml-1" role="img" aria-label="waving hand">
                  👋
                </span>
              </h1>
            </header>

            {error && (
              <div
                className="mt-6 rounded-lg border border-red-400 bg-red-50/10 px-4 py-3 text-sm text-red-200"
              >
                {error}
              </div>
            )}

            <section className="mt-10 grid gap-6 lg:grid-cols-3">
              {statsCards.map(({ id, title, value, change, formatter, trendKey, color }) => {
                const numericValue = Number(value) || 0;
                const numericChange = Number(change) || 0;
                const trendColor = numericChange >= 0 ? 'text-[#4d997a]' : 'text-[#c26666]';
                const changePrefix = numericChange > 0 ? '+' : '';
                const trendSeries = dashboardData.trends?.[trendKey] || [];

                return (
                  <article
                    key={id}
                    className="rounded-xl border border-white/5 bg-[rgba(25,27,29,0.78)] px-6 py-8 shadow-lg shadow-black/20"
                  >
                    <p className="text-sm text-white/70">{title}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-3xl font-semibold">
                        <AnimatedStatValue
                          value={numericValue}
                          formatter={formatter}
                          animate={false}
                        />
                      </p>
                      <StatSparkline
                        id={id}
                        data={trendSeries}
                        color={color}
                        animate={false}
                      />
                    </div>
                    <p className={`mt-4 text-xs font-medium ${trendColor}`}>
                      {changePrefix}
                      {numericChange}% compared to last 7 days
                    </p>
                  </article>
                );
              })}
            </section>

            <section className="mt-12 flex flex-col gap-10 lg:flex-row">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-medium text-white">Upcoming Events</h2>
                  {dashboardData.upcomingEvents.length > 0 && (
                    <button
                      type="button"
                      className="flex items-center gap-2 text-xs font-medium text-white/80 transition-colors hover:text-white"
                    >
                      View All
                      <span aria-hidden className="text-lg">›</span>
                    </button>
                  )}
                </div>

                <div className="mt-6 space-y-6">
                  {dashboardData.upcomingEvents.length === 0 ? (
                    <p className="text-sm text-white/50">You have no upcoming events yet.</p>
                  ) : (
                    dashboardData.upcomingEvents.map((event, index) => {
                      const { timelineLabel, timeLabel, fullDateLabel } = formatEventDate(event.date);
                      const { label, badgeClass } = getStatusConfig(event.status);
                      const isLast = index === dashboardData.upcomingEvents.length - 1;
                      const imageSrc = event.imageUrl || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=640&q=80';

                      return (
                        <div
                          key={event.id}
                          className="relative pl-10"
                        >
                          <span className="absolute left-[11px] top-0 flex h-full flex-col items-center">
                            <span className="h-3 w-3 rounded-full bg-white/30" />
                            {!isLast && <span className="mt-1 h-full w-px bg-gradient-to-b from-white/30 to-transparent" />}
                          </span>

                          <div className="mb-2 flex items-center gap-2 text-sm text-white/60">
                            <span>{timelineLabel}</span>
                          </div>

                          <article className="flex flex-col justify-between gap-4 rounded-xl border border-white/5 bg-[rgba(25,27,29,0.78)] p-6 shadow-lg shadow-black/20 sm:flex-row">
                            <div className="flex-1 space-y-3">
                              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white ${badgeClass}`}>
                                {label}
                              </span>
                              <h3 className="text-2xl font-medium text-white">{event.title}</h3>
                              <p className="text-sm text-white/70">
                                {timeLabel} • {fullDateLabel}
                              </p>
                              <p className="flex items-center gap-2 text-xs text-white/60">
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs">🎟️</span>
                                {event.rsvpCount} RSVP&apos;d
                              </p>
                            </div>
                            <div className="h-36 w-full overflow-hidden rounded-lg sm:w-56">
                              <img
                                src={imageSrc}
                                alt={event.title}
                                className="h-full w-full rounded-lg object-cover"
                              />
                            </div>
                          </article>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <aside
                className="h-96 w-full max-w-md rounded-xl border border-white/5 bg-[#191b1d]/90 p-6 shadow-lg shadow-black/20"
              >
                <h2 className="text-2xl font-medium text-white">The Buzz</h2>
                <div className="mt-6 space-y-4">
                  {recentActivities.length === 0 ? (
                    <p className="text-sm text-white/60">No recent activity yet.</p>
                  ) : (
                    recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 rounded-lg border border-white/5 bg-black/60 px-4 py-3"
                      >
                        <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                          🎟️
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white">{activity.title}</p>
                          <p className="text-xs text-white/60">{relativeTimeFromNow(activity.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </aside>
            </section>
          </section>
        )}
      </div>
    </OrganizerLayoutDark>
  );
};

export default OrganizerDashboard;
