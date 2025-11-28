const GEOCODING_ENDPOINT = 'https://api.distancematrix.ai/maps/api/geocode/json';
const DISTANCE_MATRIX_ENDPOINT = 'https://api.distancematrix.ai/maps/api/distancematrix/json';


const geocodingApiKey = import.meta.env.VITE_GEOCODING_API_KEY;
const distanceMatrixApiKey = import.meta.env.VITE_DISTANCE_MATRIX_API_KEY;


// console.log("DEBUG: Using Hardcoded Key:", API_KEY);

/**
 * Helper function to perform a fetch request and handle errors.
 *
 * @async
 * @function withGuardedFetch
 * @param {string} url - The URL to fetch.
 * @param {Object} [options={}] - Fetch options.
 * @returns {Promise<any>} The parsed JSON response.
 * @throws {Error} Throws an error if the response is not OK.
 */
const withGuardedFetch = async (url, options = {}) => {
  const response = await fetch(url, options);

  if (!response.ok) {
    const error = new Error('Request failed');
    error.status = response.status;
    try {
      error.payload = await response.json();
    } catch {
      // Ignore JSON parsing errors; payload stays undefined.
    }
    throw error;
  }

  return response.json();
};

/**
 * Searches for an address using the Geocoding API.
 *
 * @async
 * @function searchAddress
 * @param {string} query - The address to search for.
 * @returns {Promise<Array<Object>>} A list of location results with formatted labels.
 * @throws {Error} Throws an error if the API request fails.
 */
export const searchAddress = async (query) => {
  const trimmed = query?.trim();
  if (!trimmed) {
    return [];
  }

  if (!geocodingApiKey) {
    console.warn('Missing VITE_GEOCODING_API_KEY environment variable.');
    return [];
  }

  const params = new URLSearchParams({
    address: trimmed,
    key: geocodingApiKey,
  });

  const url = `${GEOCODING_ENDPOINT}?${params.toString()}`;
  console.log('Searching API:', url);

  const payload = await withGuardedFetch(url);

  if (payload?.status && payload.status !== 'OK') {
    const message = payload?.error_message || 'Geocoding request failed.';
    const error = new Error(message);
    error.status = payload.status;
    throw error;
  }

  const results = Array.isArray(payload?.result) ? payload.result : [];

  return results.map((item, index) => {
    const formatted = item?.formatted_address?.trim();
    const latitude = item?.geometry?.location?.lat;
    const longitude = item?.geometry?.location?.lng;

    let label = formatted;
    if (!label) {
      if (index === 0 && trimmed) {
        label = trimmed;
      } else if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        label = `Location at [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]`;
      } else {
        label = 'Unnamed location';
      }
    }

    return {
      ...item,
      __label: label,
    };
  });
};

/**
 * Calculates travel time between an origin and a destination using the Distance Matrix API.
 *
 * @async
 * @function getTravelTime
 * @param {Object} origin - The starting point with lat and lng properties.
 * @param {Object} destination - The destination with lat and lng properties.
 * @returns {Promise<Object>} The distance matrix element containing duration and distance.
 * @throws {Error} Throws an error if parameters are missing or the API request fails.
 */
export const getTravelTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error('Origin and destination are required to compute travel time.');
  }

  if (!distanceMatrixApiKey) {
    throw new Error('Missing VITE_DISTANCE_MATRIX_API_KEY environment variable.');
  }

  const params = new URLSearchParams({
    origins: `${origin.lat},${origin.lng}`,
    destinations: `${destination.lat},${destination.lng}`,
    key: distanceMatrixApiKey,
  });

  const payload = await withGuardedFetch(`${DISTANCE_MATRIX_ENDPOINT}?${params.toString()}`);
  const element = payload?.rows?.[0]?.elements?.[0];
  if (!element) {
    throw new Error('Unable to retrieve travel time data.');
  }

  return element;
};

/**
 * Performs reverse geocoding to find a location name from coordinates.
 *
 * @async
 * @function reverseGeocode
 * @param {number} lat - The latitude.
 * @param {number} lng - The longitude.
 * @returns {Promise<string>} The name of the location (e.g., city or area).
 * @throws {Error} Throws an error if coordinates are invalid or the API request fails.
 */
export const reverseGeocode = async (lat, lng) => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error('Latitude and longitude are required for reverse geocoding.');
  }

  if (!geocodingApiKey) {
    throw new Error('Missing VITE_GEOCODING_API_KEY environment variable.');
  }

  const params = new URLSearchParams({
    latlng: `${lat},${lng}`,
    key: geocodingApiKey,
  });

  const payload = await withGuardedFetch(`${GEOCODING_ENDPOINT}?${params.toString()}`);
  const results = Array.isArray(payload?.result) ? payload.result : [];

  if (!results.length) {
    return 'Nearby';
  }

  const [primary] = results;
  console.log('API RAW ADDRESS:', primary?.formatted_address);
  const components = Array.isArray(primary?.address_components) ? primary.address_components : [];

  const preferredTypes = new Set(['locality', 'administrative_area_level_2']);

  const match = components.find((component) => {
    const types = Array.isArray(component?.types) ? component.types : [];
    return types.some((type) => preferredTypes.has(type));
  });

  if (match?.short_name) {
    return match.short_name;
  }

  if (match?.long_name) {
    return match.long_name;
  }

  const formatted = typeof primary?.formatted_address === 'string' ? primary.formatted_address : '';
  if (formatted.length > 0) {
    return formatted.split(',')[0].trim() || 'Nearby';
  }

  return 'Nearby';
};
