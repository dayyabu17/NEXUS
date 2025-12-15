import React from 'react';
import OrganizerLayoutDark from './OrganizerLayoutDark';
import OrganizerSplashScreen from './OrganizerDashboard/OrganizerSplashScreen';
import OrganizerStatsSection from './OrganizerDashboard/OrganizerStatsSection';
import OrganizerUpcomingEvents from './OrganizerDashboard/OrganizerUpcomingEvents';
import OrganizerActivitiesPanel from './OrganizerDashboard/OrganizerActivitiesPanel';
import useOrganizerDashboard from '../hooks/useOrganizerDashboard';

const OrganizerDashboard = () => {
  const {
    organizerProfile,
    loading,
    error,
    showSplash,
    statsCards,
    upcomingEvents,
    recentActivities,
  } = useOrganizerDashboard();

  return (
    <OrganizerLayoutDark suppressInitialLoader>
      <div className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
        <OrganizerSplashScreen showSplash={showSplash} organizerProfile={organizerProfile} />

        {loading && !showSplash && (
          <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-600 dark:text-white/60">
            Loading dashboard...
          </div>
        )}

        {!loading && (
          <section className="pb-16">
            <header className="pt-6">
              <h1 className="text-4xl font-semibold tracking-tight">
                Hello, {organizerProfile.name}
                <span className="ml-1" role="img" aria-label="waving hand">
                  👋
                </span>
              </h1>
            </header>

            {error && (
              <div
                className="mt-6 rounded-lg border border-red-400 bg-red-50/10 px-4 py-3 text-sm text-red-200"
              >
                {error}
              </div>
            )}

            <OrganizerStatsSection statsCards={statsCards} />

            <section className="mt-12 flex flex-col gap-10 lg:flex-row">
              <OrganizerUpcomingEvents events={upcomingEvents} />
              <OrganizerActivitiesPanel activities={recentActivities} />
            </section>
          </section>
        )}
      </div>
    </OrganizerLayoutDark>
  );
};

export default OrganizerDashboard;
