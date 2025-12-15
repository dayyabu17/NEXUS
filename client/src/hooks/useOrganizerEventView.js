import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useEventDetails from './useEventDetails';
import useEventGuests from './useEventGuests';
import useCheckInManager from './useCheckInManager';
import useEventFeedback from './useEventFeedback';
import { resolveProfileImage } from '../components/OrganizerEventView/eventViewUtils';

const normalizeStatus = (value) =>
  (value || '')
    .toString()
    .toLowerCase()
    .replace(/[_\s-]/g, '');

const useOrganizerEventView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { event, loading, error, eventHasStarted } = useEventDetails(id);

  const {
    guestList,
    setGuestList,
    guestLoading,
    guestError,
    setGuestError,
    guestForm,
    handleGuestInputChange,
    handleAddGuest,
    refreshGuests,
  } = useEventGuests(id);

  const {
    feedbackList,
    feedbackLoading,
    feedbackError,
    refreshFeedback,
  } = useEventFeedback(id);

  const { handleCheckIn, handleUndoCheckIn, checkInMutations } = useCheckInManager(
    id,
    guestList,
    setGuestList,
    eventHasStarted,
    refreshGuests,
    setGuestError,
  );

  const tabs = useMemo(() => {
    const base = [
      { id: 'overview', label: 'Overview' },
      { id: 'guests', label: 'Guests' },
      { id: 'check-ins', label: 'Check-ins' },
      { id: 'feedbacks', label: 'Feedback' },
    ];

    if (event && Number(event.registrationFee) > 0) {
      base.push({ id: 'earnings', label: 'Earnings' });
    }

    return base;
  }, [event]);

  const resolvedActiveTab = useMemo(() => {
    if (tabs.length === 0) {
      return activeTab;
    }

    if (tabs.some((tab) => tab.id === activeTab)) {
      return activeTab;
    }

    return tabs[0].id;
  }, [activeTab, tabs]);

  useEffect(() => {
    if (resolvedActiveTab === 'guests' || resolvedActiveTab === 'check-ins') {
      refreshGuests();
    }
  }, [resolvedActiveTab, refreshGuests]);

  useEffect(() => {
    if (resolvedActiveTab === 'feedbacks') {
      refreshFeedback();
    }
  }, [resolvedActiveTab, refreshFeedback]);

  const checkIns = useMemo(
    () =>
      guestList.filter((guest) => {
        const normalized = normalizeStatus(guest.status);

        if (normalized === 'checkedin') {
          return true;
        }

        return Boolean(guest.checkedInAt);
      }),
    [guestList],
  );

  const handleTabChange = useCallback(
    (tabId) => {
      if (tabs.some((tab) => tab.id === tabId)) {
        setActiveTab(tabId);
      }
    },
    [tabs],
  );

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return {
    loading,
    error,
    event,
    activeTab: resolvedActiveTab,
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
  };
};

export default useOrganizerEventView;
