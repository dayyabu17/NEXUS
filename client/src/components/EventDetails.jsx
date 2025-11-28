import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import GuestNavbar from './GuestNavbar';
import api from '../api/axios';
import { getTravelTime } from '../services/locationService';
import EventCheckoutModal from './EventCheckoutModal';

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
const LOCATION_STORAGE_KEY = 'userLocation';

/**
 * Component to fit the map bounds to include specific points.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Array<Array<number>>} props.points - Array of [lat, lng] coordinates.
 * @returns {null} This component does not render any visible elements.
 */
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

/**
 * EventDetails component.
 * Displays comprehensive details about a specific event, including a map with directions,
 * travel time estimates, and ticket purchasing options.
 *
 * @component
 * @returns {JSX.Element} The rendered EventDetails page.
 */
const EventDetails = () => {
    const { id } = useParams();
    console.log('Event ID from URL:', id);

    const [eventData, setEventData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [geoMessage, setGeoMessage] = useState('');
    const [distanceInfo, setDistanceInfo] = useState(null);
    const [distanceError, setDistanceError] = useState('');
    const [isComputingDistance, setIsComputingDistance] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchEvent = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/events/${id}`);
                if (!isMounted) {
                    return;
                }

                setEventData(response.data);
                setError('');
            } catch (err) {
                if (!isMounted) {
                    return;
                }

                if (err?.response?.status === 404) {
                    setError('Event not found.');
                } else {
                    setError('We ran into a problem loading this event. Please try again shortly.');
                }
                setEventData(null);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchEvent();

        return () => {
            isMounted = false;
        };
    }, [id]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            const storedRaw = window.localStorage.getItem('user');
            if (!storedRaw) {
                return;
            }

            const stored = JSON.parse(storedRaw);
            if (stored && stored._id) {
                setCurrentUser(stored);
            }
        } catch (storageError) {
            console.warn('Unable to parse stored user details', storageError);
        }
    }, []);

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
                    console.log('Using Manual Location:', stored.name || 'Manual Selection');
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
                        : 'We were unable to access your current location.',
                );
            },
            { enableHighAccuracy: true, timeout: 10000 },
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

    const formattedDate = useMemo(() => {
        if (!eventData?.date) {
            return 'Date TBA';
        }

        try {
            return new Intl.DateTimeFormat('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
            }).format(new Date(eventData.date));
        } catch (err) {
            console.warn('Unable to format event date', err);
            return new Date(eventData.date).toLocaleString();
        }
    }, [eventData?.date]);

    const registrationLabel = eventData?.registrationFee > 0 ? `$${eventData.registrationFee.toFixed(2)}` : 'Free';
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

        return undefined;
    }, [distanceInfo]);
    const travelTimeLabel = distanceInfo?.duration?.text;

    const renderSkeleton = () => (
        <div className="min-h-screen bg-slate-950 text-white">
            <GuestNavbar />
            <div className="animate-pulse space-y-10 px-6 py-24">
                <div className="h-[320px] rounded-3xl bg-slate-900" />
                <div className="grid gap-8 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-6">
                        <div className="h-6 w-3/4 rounded bg-slate-800" />
                        <div className="space-y-3">
                            <div className="h-4 rounded bg-slate-800" />
                            <div className="h-4 rounded bg-slate-800" />
                            <div className="h-4 rounded bg-slate-800" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="h-40 rounded-2xl bg-slate-900" />
                        <div className="h-32 rounded-2xl bg-slate-900" />
                    </div>
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return renderSkeleton();
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 text-white">
                <GuestNavbar />
                <div className="flex flex-col items-center justify-center px-6 py-32 text-center">
                    <h1 className="text-3xl font-semibold text-white">Event details unavailable</h1>
                    <p className="mt-4 max-w-xl text-white/60">{error}</p>
                </div>
            </div>
        );
    }

    if (!eventData) {
        return (
            <div className="min-h-screen bg-slate-950 text-white">
                <GuestNavbar />
                <div className="flex flex-col items-center justify-center px-6 py-32 text-center">
                    <h1 className="text-3xl font-semibold text-white">Event not found</h1>
                    <p className="mt-4 max-w-xl text-white/60">
                        We could not locate the event you are looking for. Please double-check the link or explore other experiences.
                    </p>
                </div>
            </div>
        );
    }

    const heroStyles = {
        backgroundImage: eventData.imageUrl
            ? `linear-gradient(180deg, rgba(2,6,23,0.2) 0%, rgba(2,6,23,0.75) 60%, rgba(2,6,23,0.95) 100%), url(${eventData.imageUrl})`
            : 'linear-gradient(180deg, rgba(6,11,25,0.95), rgba(2,6,23,1))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    const mapCenter = mapPoints[0] || DEFAULT_CENTER;

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <GuestNavbar />
            <main className="pb-24">
                <section className="relative mx-4 mt-6 overflow-hidden rounded-3xl border border-white/10 shadow-[0_40px_120px_rgba(5,10,30,0.35)]" style={heroStyles}>
                    <div className="relative z-10 flex flex-col gap-6 px-8 py-24 md:px-16 md:py-32 lg:py-40">
                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-wide text-white/90 backdrop-blur">
                            {eventData.category || 'Featured Event'}
                        </span>
                        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                            {eventData.title}
                        </h1>
                        <p className="text-lg text-white/80 md:text-xl">{formattedDate}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-white/70">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M12 22s8-4.5 8-11a8 8 0 0 0-16 0c0 6.5 8 11 8 11Z" />
                                    <circle cx="12" cy="11" r="3" />
                                </svg>
                                {eventData.location || 'Location coming soon'}
                            </span>
                            {travelTimeLabel && (
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M12 6v6l3 3" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="12" cy="12" r="9" />
                                    </svg>
                                    {travelTimeLabel}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80" />
                </section>

                <section className="mx-auto mt-12 grid max-w-6xl gap-10 px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
                    <article className="space-y-10">
                        <div className="rounded-3xl border border-white/10 bg-[#0b1220]/80 p-8 shadow-[0_30px_80px_rgba(5,10,25,0.35)]">
                            <h2 className="text-xl font-semibold text-white">About this experience</h2>
                            <p className="mt-4 leading-relaxed text-white/70">
                                {eventData.description || 'The organizer will share more information about this experience shortly.'}
                            </p>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-[#0b1220]/80 p-6 shadow-[0_30px_80px_rgba(5,10,25,0.35)]">
                            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/60">Hosted by</h3>
                            <div className="mt-4 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
                                    {eventData.organizer?.name?.[0]?.toUpperCase() || 'N'}
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-white">
                                        {eventData.organizer?.organizationName || eventData.organizer?.name || 'Nexus Organizer'}
                                    </p>
                                    {eventData.organizer?.email && (
                                        <p className="text-sm text-white/60">{eventData.organizer.email}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </article>

                    <aside className="space-y-6">
                        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#050b18] shadow-[0_30px_80px_rgba(5,10,25,0.35)]">
                            <div className="absolute right-6 top-6 z-20 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur">
                                {isComputingDistance ? 'Calculating distance…' : distanceLabel || distanceError || 'Distance unavailable'}
                            </div>
                            <div className="h-[380px]">
                                {mapPoints.length > 0 ? (
                                    <MapContainer
                                        center={mapCenter}
                                        zoom={13}
                                        scrollWheelZoom
                                        className="h-full w-full"
                                        style={{ background: '#0b1220' }}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution="&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
                                            className="map-tiles"
                                        />
                                        <FitBounds points={mapPoints} />
                                        {Number.isFinite(eventData.locationLatitude) && Number.isFinite(eventData.locationLongitude) && (
                                            <Marker
                                                position={[eventData.locationLatitude, eventData.locationLongitude]}
                                                icon={EVENT_MARKER_ICON}
                                            >
                                                <Tooltip
                                                    direction="top"
                                                    offset={[0, -40]}
                                                    opacity={1}
                                                    permanent
                                                >
                                                    {eventData.title?.length > 15
                                                        ? `${eventData.title.substring(0, 15)}...`
                                                        : eventData.title || 'Event'}
                                                </Tooltip>
                                            </Marker>
                                        )}
                                        {userLocation && (
                                            <Marker
                                                position={[userLocation.lat, userLocation.lng]}
                                                icon={USER_MARKER_ICON}
                                            >
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
                                        {userLocation && Number.isFinite(eventData.locationLatitude) && Number.isFinite(eventData.locationLongitude) && (
                                            <Polyline
                                                positions={[
                                                    [userLocation.lat, userLocation.lng],
                                                    [eventData.locationLatitude, eventData.locationLongitude],
                                                ]}
                                                pathOptions={{ color: '#38bdf8', weight: 3, dashArray: '8 8', opacity: 0.7 }}
                                            />
                                        )}
                                    </MapContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center bg-[#060b18] text-white/50">
                                        Location details coming soon
                                    </div>
                                )}
                            </div>
                            {geoMessage && (
                                <div className="border-t border-white/10 bg-black/40 px-6 py-3 text-xs text-white/60">
                                    {geoMessage}
                                </div>
                            )}
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/60 to-purple-600/40 p-6 shadow-[0_30px_80px_rgba(5,10,25,0.35)]">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.3em] text-white/60">Ticket</p>
                                    <p className="mt-1 text-3xl font-semibold text-white">{registrationLabel}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsCheckoutOpen(true)}
                                    className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                                >
                                    Get Ticket
                                </button>
                            </div>
                            <p className="mt-4 text-xs text-white/70">
                                Secure your spot now. You can cancel anytime up to 24 hours before the event.
                            </p>
                        </div>
                    </aside>
                </section>
            </main>
            <EventCheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                event={eventData}
                userId={currentUser?._id}
                email={currentUser?.email}
            />
        </div>
    );
};

export default EventDetails;
