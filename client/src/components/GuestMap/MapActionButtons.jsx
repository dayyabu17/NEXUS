import React from 'react';

const MapActionButtons = ({ latitude, longitude, address }) => {
  const parsedLatitude = typeof latitude === 'string' ? Number.parseFloat(latitude) : latitude;
  const parsedLongitude = typeof longitude === 'string' ? Number.parseFloat(longitude) : longitude;
  const hasCoordinates = Number.isFinite(parsedLatitude) && Number.isFinite(parsedLongitude);
  const trimmedAddress = typeof address === 'string' ? address.trim() : '';
  const hasAddress = trimmedAddress.length > 0;

  if (!hasCoordinates && !hasAddress) {
    return null;
  }

  const encodedAddress = hasAddress ? encodeURIComponent(trimmedAddress) : null;

  const googleUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${parsedLatitude},${parsedLongitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

  const appleUrl = hasCoordinates
    ? `https://maps.apple.com/?daddr=${parsedLatitude},${parsedLongitude}`
    : `https://maps.apple.com/?q=${encodedAddress}`;

  const commonClasses =
    'flex flex-1 min-w-[150px] items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700';

  return (
    <div className="mt-4 space-y-2">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Tap Google Maps or Apple Maps to open directions straight to the venue on your device.
      </p>
      <div className="flex flex-wrap gap-3">
      <a
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={commonClasses}
        aria-label="Open location in Google Maps"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path
            fill="#EA4335"
            d="M12 11.4c-1.66 0-3-1.35-3-3s1.34-3 3-3c.83 0 1.58.34 2.12.88l1.42-1.42A4.977 4.977 0 0 0 12 4c-2.76 0-5 2.24-5 5 0 2.04 1.22 3.79 2.96 4.57L12 19l2.04-4.43C15.78 12.79 17 11.04 17 9c0-.5-.08-.98-.22-1.42l-1.53 1.53c-.13.6-.66 1.29-1.25 1.29Z"
          />
          <path
            fill="#4285F4"
            d="M17.78 7.58c-.11-.34-.26-.66-.43-.97l-1.53 1.53c.07.26.1.54.1.82 0 1.2-.7 2.24-1.7 2.75L12 19l2.04-4.43c.9-.41 1.63-1.12 2.1-1.99.41-.8.64-1.71.64-2.64 0-.46-.07-.91-.2-1.36Z"
            opacity=".8"
          />
        </svg>
        <span>Google Maps</span>
      </a>

      <a
        href={appleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={commonClasses}
        aria-label="Open location in Apple Maps"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path
            fill="currentColor"
            d="M19.44 15.02c-.33.77-.73 1.47-1.2 2.09-.63.82-1.14 1.38-1.54 1.69-.62.54-1.28.81-1.97.82-.5 0-1.1-.14-1.82-.41-.72-.27-1.39-.4-2-.4-.62 0-1.31.13-2.07.4-.76.27-1.33.41-1.71.42-.66.03-1.32-.24-1.99-.82-.43-.36-.96-.96-1.59-1.8-.68-.89-1.23-1.92-1.65-3.09-.46-1.29-.68-2.55-.68-3.78 0-1.39.3-2.59.9-3.6.47-.83 1.1-1.49 1.88-1.98.79-.49 1.63-.74 2.53-.75.5 0 1.15.15 1.93.45.79.3 1.29.45 1.51.45.16 0 .7-.17 1.61-.5.86-.31 1.59-.44 2.19-.41 1.61.13 2.82.82 3.64 2.07-1.45.88-2.17 2.12-2.16 3.72.01 1.24.46 2.28 1.36 3.1.4.38.85.67 1.36.87-.11.32-.23.62-.38.9Z"
          />
          <path
            fill="currentColor"
            d="M15.84 4.32c0 .78-.28 1.51-.85 2.17-.68.82-1.5 1.29-2.39 1.21a2.65 2.65 0 0 1-.02-.33c0-.75.32-1.55.9-2.2.29-.32.65-.59 1.1-.81.44-.21.86-.33 1.26-.34Z"
            opacity=".8"
          />
        </svg>
        <span>Apple Maps</span>
      </a>
      </div>
    </div>
  );
};

export default MapActionButtons;
