import React from 'react';
import OrganizerLayoutDark from './OrganizerLayoutDark';
import useOrganizerEventView from '../hooks/useOrganizerEventView';
import OrganizerEventHeader from './OrganizerEventView/OrganizerEventHeader';
import OrganizerEventOverview from './OrganizerEventView/OrganizerEventOverview';
import OrganizerEventGuests from './OrganizerEventView/OrganizerEventGuests';
import OrganizerEventCheckIns from './OrganizerEventView/OrganizerEventCheckIns';
import OrganizerEventFeedback from './OrganizerEventView/OrganizerEventFeedback';
import OrganizerEventEarnings from './OrganizerEventView/OrganizerEventEarnings';

const OrganizerEventView = () => {
  const {
    loading,
    error,
    event,
    activeTab,
    tabs,
    handleTabChange,
    handleGoBack,
    guestForm,
    handleGuestInputChange,
    handleAddGuest,
    guestList,
    guestLoading,
    guestError,
    handleCheckIn,
    handleUndoCheckIn,
    checkIns,
    checkInMutations,
    feedbackList,
    feedbackLoading,
    feedbackError,
    eventHasStarted,
    resolveProfileImage,
  } = useOrganizerEventView();

  return (
    <OrganizerLayoutDark>
      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-[rgba(21,26,36,0.72)] p-8 text-center text-white/70">
          Loading event details...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200">
          {error}
        </div>
      ) : !event ? (
        <div className="rounded-3xl border border-white/10 bg-[rgba(21,26,36,0.72)] p-8 text-center text-white/70">
          Event not found.
        </div>
      ) : (
        <div className="space-y-12">
          <OrganizerEventHeader
            event={event}
            onBack={handleGoBack}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          {activeTab === 'overview' && <OrganizerEventOverview event={event} />}
          {activeTab === 'guests' && (
            <OrganizerEventGuests
              guestForm={guestForm}
              onGuestInputChange={handleGuestInputChange}
              onAddGuest={handleAddGuest}
              guestList={guestList}
              guestLoading={guestLoading}
              guestError={guestError}
              eventHasStarted={eventHasStarted}
              onCheckIn={handleCheckIn}
              onUndoCheckIn={handleUndoCheckIn}
              checkInMutations={checkInMutations}
              resolveProfileImage={resolveProfileImage}
            />
          )}
          {activeTab === 'check-ins' && (
            <OrganizerEventCheckIns
              checkIns={checkIns}
              onUndoCheckIn={handleUndoCheckIn}
              checkInMutations={checkInMutations}
            />
          )}
          {activeTab === 'feedbacks' && (
            <OrganizerEventFeedback
              feedbackList={feedbackList}
              feedbackLoading={feedbackLoading}
              feedbackError={feedbackError}
              resolveProfileImage={resolveProfileImage}
            />
          )}
          {activeTab === 'earnings' && (
            <OrganizerEventEarnings event={event} checkIns={checkIns} />
          )}
        </div>
      )}
    </OrganizerLayoutDark>
  );
};

export default OrganizerEventView;
