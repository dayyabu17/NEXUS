import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const getEventId = (event) => {
  if (!event) {
    return null;
  }

  const sourceId = event._id ?? event.id;
  if (sourceId === undefined || sourceId === null) {
    return null;
  }

  try {
    return sourceId.toString();
  } catch {
    return `${sourceId}`;
  }
};

const normalizeEvent = (event) => {
  if (!event) {
    return null;
  }

  const eventId = getEventId(event);
  if (!eventId) {
    return event;
  }

  if (event.eventId === eventId) {
    return event;
  }

  return { ...event, eventId };
};

const useGuestDashboard = () => {
  const navigate = useNavigate();
  const [heroEvent, setHeroEvent] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [errorMessage, setErrorMessage] = useState('');

  const handleViewEvent = useCallback(
    (eventId) => {
      if (!eventId) {
        return;
      }
      navigate(`/events/${eventId}`);
    },
    [navigate]
  );

  useEffect(() => {
    let isMounted = true;

    const dedupeById = (list = []) => {
      if (!Array.isArray(list)) {
        return [];
      }

      const seen = new Set();
      return list.flatMap((item) => {
        const normalized = normalizeEvent(item);
        if (!normalized) {
          return [];
        }

        const id = getEventId(normalized);
        if (!id) {
          return [normalized];
        }

        if (seen.has(id)) {
          return [];
        }

        seen.add(id);
        return [normalized];
      });
    };

    const fetchDashboard = async () => {
      setIsLoading(true);

      let userId;
      if (typeof window !== 'undefined') {
        try {
          const storedRaw = window.localStorage.getItem('user');
          if (storedRaw) {
            const stored = JSON.parse(storedRaw);
            userId = stored?._id;
          }
        } catch (error) {
          console.warn('Unable to parse stored user details', error);
        }
      }

      const requestConfig = {};
      if (userId) {
        requestConfig.params = { userId };
      }

      try {
        const response = await api.get('/events/dashboard', requestConfig);
        if (!isMounted) {
          return;
        }

        const { heroEvent: hero, recommendedEvents, recentEvents } = response.data || {};

        const heroId = getEventId(hero);

        const excludeHero = (list = []) =>
          list.filter((item) => {
            const id = getEventId(item);
            if (!heroId) {
              return true;
            }
            return id !== heroId;
          });

        const sanitizedRecommended = excludeHero(dedupeById(recommendedEvents)).slice(0, 6);
        const sanitizedRecent = excludeHero(dedupeById(recentEvents));

        setHeroEvent(normalizeEvent(hero) || null);
        setRecommended(sanitizedRecommended.map(normalizeEvent).filter(Boolean));
        setAllEvents(sanitizedRecent.map(normalizeEvent).filter(Boolean));
        setErrorMessage('');
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
        if (isMounted) {
          setHeroEvent(null);
          setRecommended([]);
          setAllEvents([]);
          setErrorMessage('Unable to load events right now. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const combinedEvents = useMemo(() => {
    const map = new Map();

    const addToMap = (event) => {
      const normalized = normalizeEvent(event);
      if (!normalized) {
        return;
      }

      const id = getEventId(normalized);
      if (!id) {
        return;
      }

      if (!map.has(id)) {
        map.set(id, normalized);
      }
    };

    if (heroEvent) {
      addToMap(heroEvent);
    }
    recommended.forEach(addToMap);
    allEvents.forEach(addToMap);

    return Array.from(map.values());
  }, [heroEvent, recommended, allEvents]);

  const categories = useMemo(() => {
    if (!combinedEvents.length) {
      return ['All'];
    }
    const distinct = new Set(
      combinedEvents
        .map((event) => event?.category)
        .filter((category) => typeof category === 'string' && category.trim().length > 0)
    );
    return ['All', ...distinct];
  }, [combinedEvents]);

  useEffect(() => {
    if (activeCategory === 'All') {
      return;
    }

    const categoryExists = combinedEvents.some((event) => event?.category === activeCategory);
    if (!categoryExists) {
      setActiveCategory('All');
    }
  }, [combinedEvents, activeCategory]);

  const visibleRecommended = useMemo(() => {
    if (activeCategory === 'All') {
      return recommended;
    }
    return recommended.filter((event) => event?.category === activeCategory);
  }, [activeCategory, recommended]);

  const heroDisplay = useMemo(() => {
    if (heroEvent) {
      return heroEvent;
    }
    if (visibleRecommended.length) {
      return visibleRecommended[0];
    }
    if (allEvents.length) {
      return allEvents[0];
    }
    return null;
  }, [heroEvent, visibleRecommended, allEvents]);

  return {
    heroEvent,
    recommended,
    allEvents,
    isLoading,
    activeCategory,
    errorMessage,
    categories,
    visibleRecommended,
    heroDisplay,
    setActiveCategory,
    handleViewEvent,
  };
};

export default useGuestDashboard;
