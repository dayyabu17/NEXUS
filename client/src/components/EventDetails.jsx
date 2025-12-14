import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import GuestNavbar from './GuestNavbar';
import api from '../api/axios';
import { getTravelTime } from '../services/locationService';
import EventCheckoutModal from './EventCheckoutModal';
import TicketFeedbackPanel from './TicketFeedbackPanel';
import { resolveAccentPalette, DEFAULT_ACCENT, DEFAULT_BRAND_COLOR } from '../constants/accentTheme';
import { hexToRgba } from '../utils/color';

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
const hexPattern = /^#([0-9A-Fa-f]{6})$/;

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
    const [ticketStatus, setTicketStatus] = useState({ checked: false, hasTicket: false, ticketId: null });

    const accentId = useMemo(
        () => eventData?.organizer?.accentPreference || DEFAULT_ACCENT,
        [eventData?.organizer?.accentPreference],
    );

    const accentPalette = useMemo(() => resolveAccentPalette(accentId), [accentId]);

    const brandColor = useMemo(() => {
        const candidate = eventData?.organizer?.brandColor;
        if (typeof candidate === 'string' && hexPattern.test(candidate)) {
            return candidate.toUpperCase();
        }
        return DEFAULT_BRAND_COLOR;
    }, [eventData?.organizer?.brandColor]);

    const accentStyles = useMemo(
        () => ({
            chipBg: hexToRgba(accentPalette[500], 0.18),
            chipBorder: hexToRgba(accentPalette[500], 0.32),
            badgeBg: hexToRgba(accentPalette[600], 0.22),
            badgeBorder: hexToRgba(accentPalette[600], 0.38),
            highlight: accentPalette[600],
            highlightSoft: hexToRgba(accentPalette[500], 0.9),
            cardGradient: `linear-gradient(135deg, ${hexToRgba(accentPalette[500], 0.55)} 0%, ${hexToRgba(accentPalette[700], 0.6)} 100%)`,
            cardShadow: `0 30px 80px ${hexToRgba(accentPalette[700], 0.35)}`,
            avatarRing: `0 0 0 3px ${hexToRgba(accentPalette[500], 0.45)}`,
            pathColor: hexToRgba(accentPalette[500], 0.75),
        }),
        [accentPalette],
    );

    const brandStyles = useMemo(
        () => ({
            color: brandColor,
            soft: hexToRgba(brandColor, 0.85),
            shadow: `0 20px 55px ${hexToRgba(brandColor, 0.3)}`,
        }),
        [brandColor],
    );

    const eventIdentifier = eventData?._id || eventData?.id;
    const hasTicket = ticketStatus.hasTicket;
    const ticketButtonLabel = hasTicket ? 'You’re attending' : 'Get Ticket';

    const fetchTicketStatus = useCallback(async () => {
        if (!eventIdentifier) {
            return;
        }

        if (!currentUser?._id) {
            setTicketStatus((prev) =>
                prev.checked ? prev : { checked: true, hasTicket: false, ticketId: null },
            );
            return;
        }

        if (typeof window === 'undefined') {
            return;
        }

        const token = window.localStorage.getItem('token');
        if (!token) {
            setTicketStatus({ checked: true, hasTicket: false, ticketId: null });
            return;
        }

        try {
            const response = await api.get(`/tickets/status/${eventIdentifier}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setTicketStatus({
                checked: true,
                hasTicket: Boolean(response.data?.hasTicket),
                ticketId: response.data?.ticketId || null,
            });
        } catch (statusError) {
            console.warn('Ticket status unavailable', statusError);
            setTicketStatus({ checked: true, hasTicket: false, ticketId: null });
        }
    }, [currentUser?._id, eventIdentifier]);

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
        if (!eventIdentifier) {
            return;
        }

        setTicketStatus({ checked: false, hasTicket: false, ticketId: null });
    }, [eventIdentifier]);

    useEffect(() => {
        if (!eventIdentifier) {
            return;
        }

        fetchTicketStatus();
    }, [eventIdentifier, fetchTicketStatus]);

    const handleOpenCheckout = () => {
        if (!hasTicket) {
            setIsCheckoutOpen(true);
        }
    };

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
        <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
            <GuestNavbar />
            <div className="animate-pulse space-y-10 px-6 py-24">
                <div className="h-[320px] rounded-3xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900" />
                <div className="grid gap-8 md:grid-cols-3">
                    <div className="space-y-6 md:col-span-2">
                        <div className="h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                        <div className="space-y-3">
                            <div className="h-4 rounded bg-slate-200 dark:bg-slate-800" />
                            <div className="h-4 rounded bg-slate-200 dark:bg-slate-800" />
                            <div className="h-4 rounded bg-slate-200 dark:bg-slate-800" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="h-40 rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900" />
                        <div className="h-32 rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900" />
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
            <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
                <GuestNavbar />
                <div className="flex flex-col items-center justify-center px-6 py-32 text-center">
                    <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Event details unavailable</h1>
                    <p className="mt-4 max-w-xl text-slate-500 dark:text-slate-400">{error}</p>
                </div>
            </div>
        );
    }

    if (!eventData) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
                <GuestNavbar />
                <div className="flex flex-col items-center justify-center px-6 py-32 text-center">
                    <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Event not found</h1>
                    <p className="mt-4 max-w-xl text-slate-500 dark:text-slate-400">
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
        <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
            <GuestNavbar />
            <main className="pb-24">
            <section className="relative mx-4 mt-6 overflow-hidden rounded-3xl border border-slate-200 shadow-2xl dark:border-slate-800 dark:shadow-[0_40px_120px_rgba(5,10,30,0.35)]" style={heroStyles}>
                    <div className="relative z-10 flex flex-col gap-6 px-8 py-24 md:px-16 md:py-32 lg:py-40">
                        <span
                            className="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-1 text-sm font-semibold uppercase tracking-wide text-white backdrop-blur"
                            style={{
                                backgroundColor: accentStyles.badgeBg,
                                borderColor: accentStyles.badgeBorder,
                            }}
                        >
                            {eventData.category || 'Featured Event'}
                        </span>
                        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                            {eventData.title}
                        </h1>
                        <p className="text-lg text-white/80 md:text-xl">{formattedDate}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-white/80">
                            <span
                                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur"
                                style={{
                                    backgroundColor: accentStyles.chipBg,
                                    borderColor: accentStyles.chipBorder,
                                }}
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M12 22s8-4.5 8-11a8 8 0 0 0-16 0c0 6.5 8 11 8 11Z" />
                                    <circle cx="12" cy="11" r="3" />
                                </svg>
                                {eventData.location || 'Location coming soon'}
                            </span>
                            {travelTimeLabel && (
                                <span
                                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur"
                                    style={{
                                        backgroundColor: accentStyles.chipBg,
                                        borderColor: accentStyles.chipBorder,
                                    }}
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M12 6v6l3 3" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="12" cy="12" r="9" />
                                    </svg>
                                    {travelTimeLabel}
                                </span>
                            )}
                            {hasTicket && (
                                <span
                                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white"
                                    style={{
                                        backgroundColor: accentStyles.badgeBg,
                                        borderColor: accentStyles.badgeBorder,
                                    }}
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    You’re attending
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80" />
                </section>

                <section className="mx-auto mt-12 grid max-w-6xl gap-10 px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
                    <article className="space-y-10">
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-[#0b1220]/80 dark:shadow-[0_30px_80px_rgba(5,10,25,0.35)]">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">About this experience</h2>
                            <p className="mt-4 leading-relaxed text-slate-800 dark:text-white/70">
                                {eventData.description || 'The organizer will share more information about this experience shortly.'}
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-[#0b1220]/80 dark:shadow-[0_30px_80px_rgba(5,10,25,0.35)]">
                            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-white/60">Hosted by</h3>
                            <div className="mt-4 flex items-center gap-4">
                                <div
                                    className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-white shadow-lg transition"
                                    style={{
                                        background: accentStyles.highlight,
                                        boxShadow: eventData.organizer?.avatarRingEnabled
                                            ? accentStyles.avatarRing
                                            : '0 0 0 1px rgba(255,255,255,0.12)',
                                    }}
                                >
                                    {eventData.organizer?.name?.[0]?.toUpperCase() || 'N'}
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                        {eventData.organizer?.organizationName || eventData.organizer?.name || 'Nexus Organizer'}
                                    </p>
                                    {eventData.organizer?.email && (
                                        <p className="text-sm text-slate-600 dark:text-white/60">{eventData.organizer.email}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </article>

                    <aside className="space-y-6">
                        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-[#050b18] dark:shadow-[0_30px_80px_rgba(5,10,25,0.35)]">
                            <div
                                className="absolute right-6 top-6 z-20 rounded-full border px-4 py-2 text-sm font-semibold text-slate-900 backdrop-blur dark:text-white"
                                style={{
                                    backgroundColor: accentStyles.badgeBg,
                                    borderColor: accentStyles.badgeBorder,
                                }}
                            >
                                {isComputingDistance ? 'Calculating distance…' : distanceLabel || distanceError || 'Distance unavailable'}
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

                        <div
                            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900"
                            style={{
                                boxShadow: accentStyles.cardShadow,
                            }}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-white/60">Ticket</p>
                                    <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">{registrationLabel}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleOpenCheckout}
                                    disabled={hasTicket}
                                    style={{
                                        '--brand-color': brandStyles.color,
                                        '--brand-soft': brandStyles.soft,
                                        boxShadow: brandStyles.shadow,
                                    }}
                                    className="inline-flex items-center justify-center rounded-full bg-[var(--brand-color)] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-soft)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {ticketButtonLabel}
                                </button>
                            </div>
                            {hasTicket ? (
                                <p className="mt-4 text-sm text-slate-700 dark:text-white/85">
                                    You’re all set! Your ticket is saved under My Tickets—see you there.
                                </p>
                            ) : (
                                <p className="mt-4 text-xs text-slate-600 dark:text-white/70">
                                    Secure your spot now. You can cancel anytime up to 24 hours before the event.
                                </p>
                            )}
                        </div>

                        {hasTicket && (
                            <TicketFeedbackPanel
                                ticket={{
                                    _id: ticketStatus.ticketId,
                                    event: eventData,
                                }}
                            />
                        )}
                    </aside>
                </section>
            </main>
            <EventCheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                event={eventData}
                userId={currentUser?._id}
                email={currentUser?.email}
                theme={{
                    brandColor,
                    accentColor: accentStyles.highlight,
                }}
                hasTicket={hasTicket}
                onPurchaseComplete={fetchTicketStatus}
            />
        </div>
    );
};

export default EventDetails;