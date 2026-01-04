import React from 'react';
import { motion } from 'framer-motion';
import OrganizerLayoutDark from '../../layouts/OrganizerLayoutDark';
import OrganizerEventsHeader from '../../components/OrganizerEvents/OrganizerEventsHeader';
import OrganizerEventsList from '../../components/OrganizerEvents/OrganizerEventsList';
import useOrganizerEvents from '../../hooks/organizer/useOrganizerEvents';

const MotionSection = motion.section;

const OrganizerEvents = () => {
  const {
    loading,
    error,
    showFilterMenu,
    statusFilter,
    statusOptions,
    filterMenuRef,
    toggleFilterMenu,
    selectStatusFilter,
    activeFilterLabel,
    filteredEvents,
    groupedEvents,
  } = useOrganizerEvents();

  return (
    <OrganizerLayoutDark>
      <MotionSection
        className="pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <OrganizerEventsHeader
          activeFilterLabel={activeFilterLabel}
          showFilterMenu={showFilterMenu}
          onToggleFilterMenu={toggleFilterMenu}
          statusOptions={statusOptions}
          statusFilter={statusFilter}
          onSelectFilter={selectStatusFilter}
          filterMenuRef={filterMenuRef}
        />

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/40 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-12 text-center text-slate-500 dark:text-white/60">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="mt-12 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-600 dark:border-white/10 dark:bg-black/40 dark:text-white/70">
            No events match the selected filter.
          </div>
        ) : (
          <OrganizerEventsList groupedEvents={groupedEvents} />
        )}
      </MotionSection>
    </OrganizerLayoutDark>
  );
};

export default OrganizerEvents;
