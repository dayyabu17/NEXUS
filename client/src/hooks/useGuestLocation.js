import { useCallback, useEffect, useRef, useState } from 'react';
import { reverseGeocode } from '../services/locationService';

const STORAGE_KEY = 'userLocation';
const DETECTING_LABEL = 'Detecting...';

const getInitialLocationName = () => {
  if (typeof window !== 'undefined') {
    try {
      const storedRaw = window.sessionStorage.getItem(STORAGE_KEY);
      if (storedRaw) {
        const stored = JSON.parse(storedRaw);
        if (stored?.name) {
          return stored.name;
        }
      }
    } catch (error) {
      console.warn('Failed to parse stored location', error);
    }
  }

  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    return DETECTING_LABEL;
  }

  return 'Campus';
};

const useGuestLocation = () => {
  const hasRequestedRef = useRef(false);
  const [locationName, setLocationName] = useState(getInitialLocationName);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const clearPersistedLocation = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear stored location', error);
    }
  }, []);

  const persistLocation = useCallback((name, coords) => {
    setLocationName(name);

    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          name,
          lat: Number.isFinite(coords?.lat) ? coords.lat : null,
          lng: Number.isFinite(coords?.lng) ? coords.lng : null,
        })
      );
    } catch (error) {
      console.warn('Failed to persist location', error);
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }

    hasRequestedRef.current = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const resolveLocation = async () => {
          try {
            const city = await reverseGeocode(latitude, longitude);
            persistLocation(city || 'Nearby', { lat: latitude, lng: longitude });
          } catch (error) {
            console.error('Failed to reverse geocode user location', error);
            persistLocation('Nearby', { lat: latitude, lng: longitude });
          }
        };

        resolveLocation();
      },
      (error) => {
        console.warn('Geolocation Error:', error?.message || error);
        if (error?.code === 1) {
          setLocationName('Location Denied');
        } else if (error?.code === 2) {
          setLocationName('GPS Error');
        } else {
          setLocationName('Kano (Default)');
        }
        clearPersistedLocation();
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [clearPersistedLocation, persistLocation]);

  useEffect(() => {
    if (locationName !== DETECTING_LABEL) {
      return;
    }

    if (!hasRequestedRef.current) {
      requestLocation();
    }
  }, [locationName, requestLocation]);

  const handleLocationClick = useCallback(() => {
    if (
      locationName === 'Location Denied' ||
      locationName === DETECTING_LABEL ||
      locationName === 'GPS Error'
    ) {
      setLocationName(DETECTING_LABEL);
      hasRequestedRef.current = false;
      requestLocation();
    }
    setIsModalOpen(true);
  }, [locationName, requestLocation]);

  const handleUseGps = useCallback(() => {
    setIsModalOpen(false);
    setLocationName(DETECTING_LABEL);
    hasRequestedRef.current = false;
    requestLocation();
  }, [requestLocation]);

  const handleSelectShoprite = useCallback(() => {
    persistLocation('Shoprite Kano', { lat: 11.9746, lng: 8.5323 });
    setIsModalOpen(false);
  }, [persistLocation]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return {
    locationName,
    isModalOpen,
    handleLocationClick,
    handleUseGps,
    handleSelectShoprite,
    handleModalClose,
    persistLocation,
    requestLocation,
  };
};

export default useGuestLocation;
