import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const TIMEZONE_OPTIONS = [
  { value: 'GMT', label: 'GMT +0:00', location: 'Greenwich' },
  { value: 'GMT+1', label: 'GMT +1:00', location: 'Lagos' },
  { value: 'GMT+2', label: 'GMT +2:00', location: 'Cape Town' },
  { value: 'GMT-5', label: 'GMT -5:00', location: 'New York' },
  { value: 'GMT+8', label: 'GMT +8:00', location: 'Singapore' },
];

const TITLE_PLACEHOLDER = 'Event Name';

const INITIAL_FORM = {
  title: '',
  description: '',
  date: '',
  time: '',
  endDate: '',
  endTime: '',
  location: '',
  locationLatitude: null,
  locationLongitude: null,
  category: '',
  capacity: '',
  price: '0',
  imageUrl: '',
  tags: '',
  timezone: TIMEZONE_OPTIONS[0].value,
};

const useOrganizerCreateEvent = () => {
  const navigate = useNavigate();
  const successTimeoutRef = useRef(null);
  const [formData, setFormData] = useState(() => ({ ...INITIAL_FORM }));
  const [coverPreview, setCoverPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => () => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
  }, []);

  const clearSuccess = useCallback(() => {
    setSuccess('');
  }, []);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess('');

    if (name === 'imageUrl') {
      setCoverPreview(value);
    }
  }, []);

  const handleCoverUpload = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setFormData((prev) => ({ ...prev, imageUrl: result }));
      setCoverPreview(result);
    };
    reader.readAsDataURL(file);
    setSuccess('');
  }, []);

  const handleRemoveCover = useCallback(() => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    setCoverPreview('');
    setSuccess('');
  }, []);

  const handleLocationSelect = useCallback(({ address, lat, lng }) => {
    setFormData((prev) => ({
      ...prev,
      location: address || '',
      locationLatitude: typeof lat === 'number' ? lat : null,
      locationLongitude: typeof lng === 'number' ? lng : null,
    }));
    setSuccess('');
  }, []);

  const handleCategorySelect = useCallback((category) => {
    setFormData((prev) => ({
      ...prev,
      category,
    }));
    setSuccess('');
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const requiredFields = [
      'title',
      'description',
      'date',
      'time',
      'category',
      'location',
      'locationLatitude',
      'locationLongitude',
    ];

    const missing = requiredFields.filter((field) => {
      const value = formData[field];
      return value === null || value === undefined || value === '';
    });

    if (missing.length > 0) {
      setError('Please fill out all required fields and confirm the event location from the suggestions.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/sign-in');
      return;
    }

    const startDate = new Date(`${formData.date}T${formData.time}`);
    if (Number.isNaN(startDate.getTime())) {
      setError('Invalid start date or time.');
      return;
    }

    if (startDate.getTime() < Date.now()) {
      setError('Start date and time must be in the future.');
      return;
    }

    let formattedEndDate;
    if (formData.endDate) {
      const candidate = new Date(`${formData.endDate}T${formData.endTime || '00:00'}`);
      if (!Number.isNaN(candidate.getTime())) {
        formattedEndDate = candidate.toISOString();
      }
    }

    const parsedPrice = Number(formData.price);
    const normalizedPrice = Number.isFinite(parsedPrice) && parsedPrice > 0 ? Math.floor(parsedPrice) : 0;

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: startDate.toISOString(),
      location: formData.location.trim(),
      locationLatitude: formData.locationLatitude,
      locationLongitude: formData.locationLongitude,
      category: formData.category.trim() || undefined,
      capacity: formData.capacity,
      registrationFee: normalizedPrice,
      imageUrl: formData.imageUrl,
      tags: formData.tags,
      timezone: formData.timezone,
    };

    if (formattedEndDate) {
      payload.endDate = formattedEndDate;
    }
    if (formData.endTime) {
      payload.endTime = formData.endTime;
    }

    setSubmitting(true);
    try {
      await api.post('/organizer/events', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({ ...INITIAL_FORM });
      setCoverPreview('');
      setSuccess('Event submitted for approval. Pending status until admin review.');

      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }

      successTimeoutRef.current = setTimeout(() => {
        navigate('/organizer/events');
      }, 1200);
    } catch (submissionError) {
      const message =
        submissionError?.response?.data?.message || 'Something went wrong while creating the event.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }, [formData, navigate]);

  const selectedTimezone = useMemo(
    () => TIMEZONE_OPTIONS.find((option) => option.value === formData.timezone) || TIMEZONE_OPTIONS[0],
    [formData.timezone],
  );

  return {
    formData,
    setFormData,
    coverPreview,
    submitting,
    error,
    setError,
    success,
    setSuccess,
    handleChange,
    handleCoverUpload,
    handleRemoveCover,
    handleLocationSelect,
    handleCategorySelect,
    handleSubmit,
    clearSuccess,
    selectedTimezone,
    timezoneOptions: TIMEZONE_OPTIONS,
    titlePlaceholder: TITLE_PLACEHOLDER,
  };
};

export default useOrganizerCreateEvent;
