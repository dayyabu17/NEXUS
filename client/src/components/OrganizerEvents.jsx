import React from 'react';
import { motion } from 'framer-motion';
import OrganizerLayoutDark from '../layouts/OrganizerLayoutDark';
import OrganizerEventsHeader from './OrganizerEvents/OrganizerEventsHeader';
import OrganizerEventsList from './OrganizerEvents/OrganizerEventsList';
import useOrganizerEvents from '../hooks/organizer/useOrganizerEvents';

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
          <div className="mt-6 rounded-lg border border-red-400 bg-red-50/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-12 text-center text-white/60">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="mt-12 rounded-xl border border-white/10 bg-black/40 px-6 py-12 text-center text-white/70">
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
