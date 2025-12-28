import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { searchAddress as searchAddressService } from '../services/locationService';

const WARM_TILE_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const MARKER_ICON_CONFIGURED = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};

MARKER_ICON_CONFIGURED();

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_DELAY = 500;
const DEFAULT_COORDS = { lat: 9.05785, lng: 7.49508 }; // Abuja fallback keeps the map centered in Nigeria.
const RecenterMap = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (!position) {
      return;
    }

    map.flyTo(position, 14, { duration: 1.4 });
  }, [map, position]);

  return null;
};

const LocationPicker = ({ value, coordinates, onChange }) => {
  const [query, setQuery] = useState(() => value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [position, setPosition] = useState(() => {
    if (coordinates && !Number.isNaN(coordinates.lat) && !Number.isNaN(coordinates.lng)) {
      return { lat: Number(coordinates.lat), lng: Number(coordinates.lng) };
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    if (coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number') {
      setPosition({ lat: coordinates.lat, lng: coordinates.lng });
    }
  }, [coordinates]);

  const handleClearLocation = () => {
    setQuery('');
    setPosition(null);
    setSuggestions([]);
    setIsLoading(false);
    setError('');

    if (onChange) {
      onChange({ address: '', lat: null, lng: null });
    }
  };

  useEffect(() => {
    if (!query || query.trim().length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setIsLoading(false);
      setError('');
      return undefined;
    }

    setIsLoading(true);
    setError('');

    let isCancelled = false;
    const handler = window.setTimeout(async () => {
      try {
        const results = await searchAddressService(query);
        if (isCancelled) {
          return;
        }

        const mappedSuggestions = Array.isArray(results)
          ? results
              .map((result, index) => {
                const label = result?.__label;
                const lat = result?.geometry?.location?.lat;
                const lng = result?.geometry?.location?.lng;

                if (!label || !Number.isFinite(lat) || !Number.isFinite(lng)) {
                  return null;
                }

                return {
                  id: result.place_id || `${lat}-${lng}-${index}`,
                  label,
                  detail: result.types?.[0] || null,
                  lat,
                  lng,
                };
              })
              .filter(Boolean)
          : [];

        if (mappedSuggestions.length > 0) {
          setSuggestions(mappedSuggestions);
          setError('');
        } else {
          setSuggestions([]);
          setError('No matching locations found. Try another search.');
        }
      } catch (fetchError) {
        if (isCancelled) {
          return;
        }
        console.error('Geocoding error:', fetchError?.message || fetchError);
        setSuggestions([]);
        setError('Unable to fetch locations right now. Try again in a moment.');
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_DELAY);

    return () => {
      isCancelled = true;
      window.clearTimeout(handler);
    };
  }, [query]);

  const handleSelectSuggestion = (suggestion) => {
    const latitude = typeof suggestion.lat === 'number' ? suggestion.lat : Number.parseFloat(suggestion.lat);
    const longitude = typeof suggestion.lng === 'number' ? suggestion.lng : Number.parseFloat(suggestion.lng);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    const nextPosition = { lat: latitude, lng: longitude };
    setPosition(nextPosition);
    setSuggestions([]);
    setQuery(suggestion.label);

    if (onChange) {
      onChange({
        address: suggestion.label,
        lat: latitude,
        lng: longitude,
      });
    }
  };

  const mapCenter = useMemo(() => position || DEFAULT_COORDS, [position]);

  return (
    <div className="relative">
      <label htmlFor="event-location" className="text-sm font-medium text-white/80">
        Location
      </label>
      <div className="relative mt-3">
        <input
          id="event-location"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (onChange && !event.target.value) {
              onChange({ address: '', lat: null, lng: null });
            }
          }}
          placeholder="Search for a venue or landmark"
          className="w-full rounded-[18px] border border-white/10 bg-[#151b27] px-5 py-4 pr-20 text-base text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none"
          autoComplete="off"
        />

        {position && (
          <button
            type="button"
            onClick={handleClearLocation}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400 transition-colors hover:text-red-400"
          >
            Clear
          </button>
        )}

        {isLoading && (
          <div className="absolute right-4 top-full mt-2 text-xs text-white/50" aria-live="polite">
            Searching…
          </div>
        )}

        {suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-[#0f1729] shadow-[0_18px_40px_rgba(4,8,16,0.55)]">
            {suggestions.map((suggestion) => (
              <li key={suggestion.id}>
                <button
                  type="button"
                  className="flex w-full flex-col items-start gap-1 px-4 py-3 text-left text-sm text-white/85 transition hover:bg-white/5"
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  <span className="font-semibold text-white">{suggestion.label}</span>
                  {suggestion.detail && (
                    <span className="text-xs text-white/45">{suggestion.detail}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-300" role="alert">
          {error}
        </p>
      )}

      {position && (
        <div className="mt-4 h-64 overflow-hidden rounded-xl border border-white/10">
          <MapContainer
            center={mapCenter}
            zoom={14}
            scrollWheelZoom={false}
            className="h-full w-full"
            style={{ background: '#f9f3ea' }}
          >
            <TileLayer url={WARM_TILE_URL} attribution={TILE_ATTRIBUTION} />
            <RecenterMap position={mapCenter} />
            <Marker position={mapCenter} />
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
