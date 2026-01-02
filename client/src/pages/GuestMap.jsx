import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import GuestNavbar from '../components/GuestNavbar';
import api from '../api/axios';
import 'leaflet/dist/leaflet.css';

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const eventMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const userMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const DEFAULT_CENTER = [9.05785, 7.49508];
const DEFAULT_ZOOM = 13;
const LOCATION_STORAGE_KEY = 'userLocation';
const MAP_HEIGHT = 'calc(100vh - 8rem)';

const fitBoundsToMarkers = (mapInstance, markers) => {
  if (!mapInstance || markers.length === 0) {
    return;
  }

  const bounds = L.latLngBounds(markers.map((marker) => [marker.lat, marker.lng]));
  mapInstance.flyToBounds(bounds, {
    padding: [64, 64],
    duration: 1.2,
  });
};

const FlyToBounds = ({ markers }) => {
  const mapInstance = useMap();
  const markersRef = useRef(markers);

  useEffect(() => {
    if (mapInstance) {
      mapInstance.invalidateSize();
    }

    const prev = markersRef.current;
    markersRef.current = markers;

    if (markers.length === 0 && prev.length === 0) {
      return;
    }

    fitBoundsToMarkers(mapInstance, markers);
  }, [mapInstance, markers]);

  return null;
};

const MapEvents = () => {
  const mapInstance = useMap();

  useEffect(() => {
    if (!mapInstance || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const container = mapInstance.getContainer();
    if (!container) {
      return undefined;
    }

    let frameId = window.requestAnimationFrame(() => {
      mapInstance.invalidateSize();
    });

    const observer = new ResizeObserver((entries) => {
      const entry = entries?.[0];
      if (!entry) {
        return;
      }

      const { width, height } = entry.contentRect;
      if (width === 0 || height === 0) {
        return;
      }

      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        mapInstance.invalidateSize();
      });
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [mapInstance]);

  return null;
};

const GuestMap = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeView, setActiveView] = useState('explore');
  const [userLocation, setUserLocation] = useState(null);
  const [map, setMap] = useState(null);
  const navigate = useNavigate();

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
          console.log('Using Manual Location (Map):', stored.name || 'Manual Selection');
          setUserLocation({ lat: stored.lat, lng: stored.lng });
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
      },
      (geoError) => {
        console.warn('GPS failed', geoError);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!map || !userLocation) {
      return;
    }

    map.flyTo([userLocation.lat, userLocation.lng], DEFAULT_ZOOM, {
      duration: 1,
    });
    map.invalidateSize();
  }, [userLocation, map]);

  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        if (!isMounted) {
          return;
        }

        const dataArray = Array.isArray(response.data) ? response.data : [];
        const withCoords = dataArray.filter((event) =>
          typeof event.locationLatitude === 'number' && typeof event.locationLongitude === 'number',
        );
        setEvents(withCoords);
        setErrorMessage('');
      } catch (error) {
        if (isMounted) {
          console.error('Failed to fetch events', error);
          setEvents([]);
          setErrorMessage('Unable to load events right now. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const exploreMarkers = useMemo(
    () =>
      events.map((event) => ({
        id: event._id,
        title: event.title,
        lat: event.locationLatitude,
        lng: event.locationLongitude,
        imageUrl: event.imageUrl,
        fee: event.registrationFee,
        date: event.date,
        location: event.location,
      })),
    [events],
  );

  const scheduleMarkers = useMemo(() => {
    return exploreMarkers.filter((_, index) => index % 2 === 0);
  }, [exploreMarkers]);

  const activeMarkers = activeView === 'explore' ? exploreMarkers : scheduleMarkers;

  useEffect(() => {
    if (!map) {
      return undefined;
    }

    const handleResize = () => {
      window.requestAnimationFrame(() => {
        map.invalidateSize();
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  useEffect(() => {
    if (!map) {
      return;
    }
    map.invalidateSize();
  }, [activeView, map]);

  useEffect(() => {
    if (!map) {
      return undefined;
    }

    map.invalidateSize();

    const timeout100 = window.setTimeout(() => {
      map.invalidateSize();
    }, 100);

    const timeout400 = window.setTimeout(() => {
      map.invalidateSize();
    }, 400);

    return () => {
      window.clearTimeout(timeout100);
      window.clearTimeout(timeout400);
    };
  }, [map, isLoading]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      <GuestNavbar />
      <div className="relative">
        <div className="absolute inset-x-0 top-16 z-40 flex justify-center px-4">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-2 py-2 text-sm font-medium text-slate-700 shadow-lg backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 dark:text-white">
            <button
              type="button"
              onClick={() => setActiveView('explore')}
              className={`rounded-full px-4 py-1 transition ${
                activeView === 'explore'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-white/70 dark:hover:bg-white/10'
              }`}
            >
              Explore
            </button>
            <button
              type="button"
              onClick={() => setActiveView('schedule')}
              className={`rounded-full px-4 py-1 transition ${
                activeView === 'schedule'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-white/70 dark:hover:bg-white/10'
              }`}
            >
              My Schedule
            </button>
          </div>
        </div>

        <div className="pt-16 px-4">
          <div className="relative z-0 overflow-hidden rounded-2xl border border-slate-200 shadow-lg dark:border-slate-800">
            <MapContainer
              center={userLocation ? [userLocation.lat, userLocation.lng] : DEFAULT_CENTER}
              zoom={DEFAULT_ZOOM}
              scrollWheelZoom
              className="w-full bg-slate-200 grayscale-0 dark:bg-slate-900"
              style={{ height: MAP_HEIGHT }}
              ref={setMap}
            >
              <MapEvents />
              <TileLayer
                url={OSM_TILE_URL}
                attribution={TILE_ATTRIBUTION}
                className="map-tiles"
              />
              <FlyToBounds markers={activeMarkers} />
              {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userMarkerIcon}>
                  <Tooltip
                    direction="top"
                    offset={[0, -40]}
                    opacity={1}
                    permanent
                    className="font-bold text-red-600"
                  >
                    This is you
                  </Tooltip>
                </Marker>
              )}
              {activeMarkers.map((marker) => (
                <Marker
                  key={`${activeView}-${marker.id}`}
                  position={[marker.lat, marker.lng]}
                  icon={eventMarkerIcon}
                >
                  <Tooltip direction="top" offset={[0, -40]} opacity={1} permanent>
                    {marker.title?.length > 15 ? `${marker.title.substring(0, 15)}...` : marker.title}
                  </Tooltip>
                  <Popup className="rounded-xl border border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-[#0f1729] dark:text-white">
                    <div className="w-56 space-y-3">
                      <div className="overflow-hidden rounded-lg">
                        <img
                          src={marker.imageUrl}
                          alt={marker.title}
                          className="h-32 w-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold">{marker.title}</h3>
                        <p className="text-xs text-slate-600 dark:text-white/60">
                          {marker.date
                            ? new Date(marker.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Date TBA'}
                          {' • '}
                          {marker.location || 'Location TBA'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/events/${marker.id}`)}
                        className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                      >
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {isLoading && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-slate-200/70 text-sm text-slate-600 dark:bg-[#0b1220]/60 dark:text-white/60">
            Loading events…
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="pointer-events-none absolute inset-x-0 top-24 z-30 flex justify-center">
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-700 shadow-lg dark:border-slate-800 dark:bg-[#101725]/95 dark:text-white/80 dark:shadow-[0_20px_60px_rgba(5,10,20,0.55)]">
              {errorMessage}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestMap;
