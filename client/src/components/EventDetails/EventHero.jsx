import { useMemo } from 'react';

const EventHero = ({ eventData, theme, travelTimeLabel, hasTicket }) => {
  const accentStyles = theme?.accentStyles || theme;

  const eventDate = eventData?.date;

  const formattedDate = useMemo(() => {
    if (!eventDate) {
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
      }).format(new Date(eventDate));
    } catch (err) {
      console.warn('Unable to format event date', err);
      return new Date(eventDate).toLocaleString();
    }
  }, [eventDate]);

  const eventImage = eventData?.imageUrl;

  const heroStyles = useMemo(
    () => ({
      backgroundImage: eventImage
        ? `linear-gradient(180deg, rgba(2,6,23,0.2) 0%, rgba(2,6,23,0.75) 60%, rgba(2,6,23,0.95) 100%), url(${eventImage})`
        : 'linear-gradient(180deg, rgba(6,11,25,0.95), rgba(2,6,23,1))',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }),
    [eventImage]
  );

  return (
    <section
      className="relative mx-4 mt-6 overflow-hidden rounded-3xl border border-slate-200 shadow-2xl dark:border-slate-800 dark:shadow-[0_40px_120px_rgba(5,10,30,0.35)]"
      style={heroStyles}
    >
      <div className="relative z-10 flex flex-col gap-6 px-8 py-24 md:px-16 md:py-32 lg:py-40">
        <span
          className="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-1 text-sm font-semibold uppercase tracking-wide text-white backdrop-blur"
          style={{
            backgroundColor: accentStyles.badgeBg,
            borderColor: accentStyles.badgeBorder,
          }}
        >
          {eventData?.category || 'Featured Event'}
        </span>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
          {eventData?.title}
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
            {eventData?.location || 'Location coming soon'}
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
  );
};

export default EventHero;
