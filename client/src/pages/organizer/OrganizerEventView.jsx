import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrganizerLayoutDark from '../../layouts/OrganizerLayoutDark';
import useOrganizerEventView from '../../hooks/organizer/useOrganizerEventView';
import OrganizerEventHeader from '../../components/OrganizerEventView/OrganizerEventHeader';
import OrganizerEventOverview from '../../components/OrganizerEventView/OrganizerEventOverview';
import OrganizerEventGuests from '../../components/OrganizerEventView/OrganizerEventGuests';
import OrganizerEventCheckIns from '../../components/OrganizerEventView/OrganizerEventCheckIns';
import OrganizerEventFeedback from '../../components/OrganizerEventView/OrganizerEventFeedback';
import OrganizerEventEarnings from '../../components/OrganizerEventView/OrganizerEventEarnings';
import EditEventModal from '../../components/OrganizerEventView/EditEventModal';
import DeleteEventModal from '../../components/OrganizerEventView/DeleteEventModal';

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
    checkInByTicketId,
    feedbackList,
    feedbackLoading,
    feedbackError,
    eventHasStarted,
    resolveProfileImage,
    refreshEvent,
  } = useOrganizerEventView();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const isPastEvent = eventHasStarted;

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
          <div className="space-y-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <OrganizerEventHeader
                event={event}
                onBack={handleGoBack}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />

              {isPastEvent ? (
                <span className="inline-flex items-center justify-center rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white/60">
                  Event Completed
                </span>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(true)}
                    className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 shadow-[0_12px_30px_rgba(16,185,129,0.35)] transition hover:bg-emerald-400"
                  >
                    Edit Event
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDeleteOpen(true)}
                    className="inline-flex items-center justify-center rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-red-950 shadow-[0_12px_30px_rgba(239,68,68,0.35)] transition hover:bg-red-400"
                  >
                    Cancel Event
                  </button>
                </div>
              )}
            </div>
          </div>

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
              onScanTicket={checkInByTicketId}
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

      <EditEventModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        event={event}
        onUpdated={refreshEvent}
      />

      <DeleteEventModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        event={event}
        onDeleted={() => navigate('/organizer/events')}
      />
    </OrganizerLayoutDark>
  );
};

export default OrganizerEventView;
