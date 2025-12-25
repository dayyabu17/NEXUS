import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatTime } from '../layouts/OrganizerLayout/layoutUtils';

const CLOCK_INTERVAL_MS = 30000;

const useLayoutUI = (suppressInitialLoader = false) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(() => formatTime(new Date()));
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showInitialLoader, setShowInitialLoader] = useState(() => {
    if (suppressInitialLoader || typeof window === 'undefined') {
      return false;
    }

    if (!location.state?.fromSignIn) {
      try {
        window.sessionStorage.removeItem('organizer:show-loader');
      } catch {
        // Ignore storage issues
      }
      return false;
    }

    try {
      return window.sessionStorage.getItem('organizer:show-loader') === 'true';
    } catch {
      return false;
    }
  });
  const [showBrandSpotlight, setShowBrandSpotlight] = useState(false);
  const brandTimeoutRef = useRef(null);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatTime(new Date()));
    }, CLOCK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!showProfileMenu) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [showProfileMenu]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (suppressInitialLoader) {
      try {
        window.sessionStorage.removeItem('organizer:show-loader');
      } catch {
        // Ignore storage issues
      }
      return undefined;
    }

    if (!showInitialLoader) {
      try {
        window.sessionStorage.removeItem('organizer:show-loader');
      } catch {
        // Ignore storage issues
      }
      return undefined;
    }

    const timer = setTimeout(() => {
      setShowInitialLoader(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [showInitialLoader, suppressInitialLoader]);

  useEffect(() => {
    if (location.state?.fromSignIn) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(
    () => () => {
      if (brandTimeoutRef.current) {
        clearTimeout(brandTimeoutRef.current);
        brandTimeoutRef.current = null;
      }
    },
    [],
  );

  const openSearch = useCallback(() => {
    setShowSearch(true);
  }, []);

  const closeSearch = useCallback(() => {
    setShowSearch(false);
  }, []);

  const handleBrandSpotlight = useCallback(() => {
    if (brandTimeoutRef.current) {
      clearTimeout(brandTimeoutRef.current);
    }

    setShowBrandSpotlight(true);
    brandTimeoutRef.current = setTimeout(() => {
      setShowBrandSpotlight(false);
      brandTimeoutRef.current = null;
    }, 10000);
  }, []);

  const handleCloseBrandSpotlight = useCallback(() => {
    if (brandTimeoutRef.current) {
      clearTimeout(brandTimeoutRef.current);
      brandTimeoutRef.current = null;
    }
    setShowBrandSpotlight(false);
  }, []);

  const state = useMemo(
    () => ({
      location,
      currentTime,
      showSearch,
      openSearch,
      closeSearch,
      showProfileMenu,
      setShowProfileMenu,
      profileMenuRef,
      showInitialLoader,
      showBrandSpotlight,
      handleBrandSpotlight,
      handleCloseBrandSpotlight,
    }),
    [
      location,
      currentTime,
      showSearch,
      showProfileMenu,
      showInitialLoader,
      showBrandSpotlight,
      handleBrandSpotlight,
      handleCloseBrandSpotlight,
    ],
  );

  return state;
};

export default useLayoutUI;
