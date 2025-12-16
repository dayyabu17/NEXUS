import { useEffect, useMemo, useState } from 'react';
import { getTravelTime } from '../services/locationService';

const LOCATION_STORAGE_KEY = 'userLocation';

const useEventLocation = (eventData) => {
  const [userLocation, setUserLocation] = useState(null);
  const [geoMessage, setGeoMessage] = useState('');
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [distanceError, setDistanceError] = useState('');
  const [isComputingDistance, setIsComputingDistance] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const tryManualLocation = () => {
      if (typeof window === 'undefined') {
        return false;
      }

      try {
        const storedRaw = window.sessionStorage.getItem(LOCATION_STORAGE_KEY);
        if (!storedRaw) {
          return false;
        }

        const stored = JSON.parse(storedRaw);
        if (!stored || !Number.isFinite(stored.lat) || !Number.isFinite(stored.lng)) {
          return false;
        }

        if (isMounted) {
          setUserLocation({ lat: stored.lat, lng: stored.lng });
          setGeoMessage('');
        }

        return true;
      } catch (storageError) {
        console.warn('Failed to parse stored manual location', storageError);
        return false;
      }
    };

    if (tryManualLocation()) {
      return () => {
        isMounted = false;
      };
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      if (isMounted) {
        setGeoMessage('Location services are not supported on this device.');
      }
      return () => {
        isMounted = false;
      };
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isMounted) {
          return;
        }

        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeoMessage('');
      },
      (geoError) => {
        if (!isMounted) {
          return;
        }

        setGeoMessage(
          geoError?.code === 1
            ? 'Enable location access to see how far you are from this event.'
            : 'We were unable to access your current location.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const eventLat = eventData?.locationLatitude;
    const eventLng = eventData?.locationLongitude;

    if (!userLocation || !Number.isFinite(eventLat) || !Number.isFinite(eventLng)) {
      return () => {
        isMounted = false;
      };
    }

    const computeDistance = async () => {
      setIsComputingDistance(true);
      setDistanceError('');
      try {
        const result = await getTravelTime(userLocation, { lat: eventLat, lng: eventLng });
        if (!isMounted) {
          return;
        }
        setDistanceInfo(result);
      } catch (distanceErr) {
        if (!isMounted) {
          return;
        }
        console.error('Unable to compute travel distance', distanceErr);
        setDistanceError('Distance unavailable right now.');
        setDistanceInfo(null);
      } finally {
        if (isMounted) {
          setIsComputingDistance(false);
        }
      }
    };

    computeDistance();

    return () => {
      isMounted = false;
    };
  }, [eventData?.locationLatitude, eventData?.locationLongitude, userLocation]);

  const mapPoints = useMemo(() => {
    const points = [];
    const eventLat = eventData?.locationLatitude;
    const eventLng = eventData?.locationLongitude;
    if (Number.isFinite(eventLat) && Number.isFinite(eventLng)) {
      points.push([eventLat, eventLng]);
    }
    if (userLocation) {
      points.push([userLocation.lat, userLocation.lng]);
    }
    return points;
  }, [eventData?.locationLatitude, eventData?.locationLongitude, userLocation]);

  const distanceLabel = useMemo(() => {
    if (distanceInfo?.distance?.text) {
      const textValue = distanceInfo.distance.text.trim();
      return textValue.endsWith('away') ? textValue : `${textValue} away`;
    }

    const rawValue = distanceInfo?.distance?.value;
    if (typeof rawValue === 'number') {
      if (rawValue >= 1000) {
        return `${(rawValue / 1000).toFixed(1)} km away`;
      }
      return `${Math.round(rawValue)} m away`;
    }

    return distanceError;
  }, [distanceInfo, distanceError]);

  const travelTimeLabel = distanceInfo?.duration?.text;

  return {
    userLocation,
    distanceInfo,
    isComputingDistance,
    geoMessage,
    mapPoints,
    distanceLabel,
    travelTimeLabel,
  };
};

export default useEventLocation;
