import { useState } from 'react';
import { useParams } from 'react-router-dom';
import GuestNavbar from './GuestNavbar';
import EventHero from '../components/EventDetails/EventHero';
import EventMapSection from '../components/EventDetails/EventMapSection';
import TicketSidebar from '../components/EventDetails/TicketSidebar';
import EventCheckoutModal from '../components/EventCheckoutModal';
import TicketFeedbackPanel from '../components/TicketFeedbackPanel';
import useEventPage from '../hooks/useEventPage';
import useEventLocation from '../hooks/useEventLocation';

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

const renderErrorState = (title, message) => (
  <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
    <GuestNavbar />
    <div className="flex flex-col items-center justify-center px-6 py-32 text-center">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{title}</h1>
      <p className="mt-4 max-w-xl text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  </div>
);

const EventDetails = () => {
  const { id } = useParams();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const { eventData, isLoading, error, currentUser, ticketStatus, fetchTicketStatus, theme } = useEventPage(id);
  const {
    userLocation,
    isComputingDistance,
    geoMessage,
    mapPoints,
    distanceLabel,
    travelTimeLabel,
  } = useEventLocation(eventData);

  if (isLoading) {
    return renderSkeleton();
  }

  if (error) {
    return renderErrorState('Event details unavailable', error);
  }

  if (!eventData) {
    return renderErrorState(
      'Event not found',
      'We could not locate the event you are looking for. Please double-check the link or explore other experiences.'
    );
  }

  const hasTicket = Boolean(ticketStatus?.hasTicket);

  const handleOpenCheckout = () => {
    if (!hasTicket) {
      setIsCheckoutOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      <GuestNavbar />
      <main className="pb-24">
        <EventHero
          eventData={eventData}
          theme={theme}
          travelTimeLabel={travelTimeLabel}
          hasTicket={hasTicket}
        />

        <section className="mx-auto mt-12 grid max-w-6xl gap-10 px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
          <article className="space-y-10">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-[#0b1220]/80 dark:shadow-[0_30px_80px_rgba(5,10,25,0.35)]">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">About this experience</h2>
              <p className="mt-4 leading-relaxed text-slate-800 dark:text-white/70">
                {eventData.description || 'The organizer will share more information about this experience shortly.'}
              </p>
            </div>
          </article>

          <div className="space-y-6">
            <TicketSidebar
              eventData={eventData}
              ticketStatus={ticketStatus}
              theme={theme}
              brandStyles={theme?.brandStyles}
              onOpenCheckout={handleOpenCheckout}
            />
            {hasTicket && (
              <TicketFeedbackPanel
                ticket={{
                  _id: ticketStatus?.ticketId,
                  event: eventData,
                }}
              />
            )}
          </div>

          <div className="lg:col-span-2">
            <EventMapSection
              mapPoints={mapPoints}
              eventData={eventData}
              userLocation={userLocation}
              geoMessage={geoMessage}
              theme={theme}
              distanceLabel={distanceLabel}
              isComputingDistance={isComputingDistance}
            />
          </div>
        </section>
      </main>

      <EventCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        event={eventData}
        userId={currentUser?._id}
        email={currentUser?.email}
        theme={{
          brandColor: theme?.brandColor,
          accentColor: theme?.accentStyles?.highlight,
        }}
        hasTicket={hasTicket}
        onPurchaseComplete={fetchTicketStatus}
      />
    </div>
  );
};

export default EventDetails;
