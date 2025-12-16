import { useEffect } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';

const EVENT_MARKER_ICON = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const USER_MARKER_ICON = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const DEFAULT_CENTER = [9.05785, 7.49508];

const FitBounds = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) {
      return;
    }

    const [first] = points;
    if (points.length === 1) {
      map.setView(first, 13);
      return;
    }

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [60, 60] });
  }, [map, points]);

  return null;
};

const EventMapSection = ({
  mapPoints,
  eventData,
  userLocation,
  geoMessage,
  theme,
  distanceLabel,
  isComputingDistance,
}) => {
  const accentStyles = theme?.accentStyles || theme;
  const mapCenter = mapPoints[0] || DEFAULT_CENTER;
  const distanceDisplay = isComputingDistance ? 'Calculating distance…' : distanceLabel || 'Distance unavailable';

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-[#050b18] dark:shadow-[0_30px_80px_rgba(5,10,25,0.35)]">
      <div
        className="absolute right-6 top-6 z-20 rounded-full border px-4 py-2 text-sm font-semibold text-slate-900 backdrop-blur dark:text-white"
        style={{
          backgroundColor: accentStyles.badgeBg,
          borderColor: accentStyles.badgeBorder,
        }}
      >
        {distanceDisplay}
      </div>
      <div className="h-[380px]">
        {mapPoints.length > 0 ? (
          <MapContainer
            center={mapCenter}
            zoom={13}
            scrollWheelZoom
            className="h-full w-full border border-slate-200 dark:border-slate-800"
            style={{ background: '#e2e8f0' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
              className="map-tiles"
            />
            <FitBounds points={mapPoints} />
            {Number.isFinite(eventData?.locationLatitude) && Number.isFinite(eventData?.locationLongitude) && (
              <Marker position={[eventData.locationLatitude, eventData.locationLongitude]} icon={EVENT_MARKER_ICON}>
                <Tooltip direction="top" offset={[0, -40]} opacity={1} permanent>
                  {eventData?.title?.length > 15
                    ? `${eventData.title.substring(0, 15)}...`
                    : eventData?.title || 'Event'}
                </Tooltip>
              </Marker>
            )}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={USER_MARKER_ICON}>
                <Tooltip direction="top" offset={[0, -40]} opacity={1} permanent className="font-bold text-red-600">
                  This is you
                </Tooltip>
              </Marker>
            )}
            {userLocation && Number.isFinite(eventData?.locationLatitude) && Number.isFinite(eventData?.locationLongitude) && (
              <Polyline
                positions={[
                  [userLocation.lat, userLocation.lng],
                  [eventData.locationLatitude, eventData.locationLongitude],
                ]}
                pathOptions={{
                  color: accentStyles.pathColor,
                  weight: 3,
                  dashArray: '8 8',
                  opacity: 0.8,
                }}
              />
            )}
          </MapContainer>
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-100 text-slate-500 dark:bg-[#060b18] dark:text-white/50">
            Location details coming soon
          </div>
        )}
      </div>
      {geoMessage && (
        <div className="border-t border-slate-200 bg-slate-50/90 px-6 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-black/40 dark:text-white/60">
          {geoMessage}
        </div>
      )}
    </div>
  );
};

export default EventMapSection;
