import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout/AdminLayout';
import api from '../api/axios';

const AdminEventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const response = await api.get(`/admin/events/${id}`, config);
        setEvent(response.data);
      } catch (err) {
        setError('Failed to load event details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleAction = async (status) => {
    if (!window.confirm(`Are you sure you want to ${status} this event?`)) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await api.put(`/admin/events/${id}/status`, { status }, config);

      alert(`Event ${status} successfully!`);
      navigate('/admin/dashboard');
    } catch (err) {
      alert(`Failed to ${status} event.`);
      console.error(err);
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    const trimmedReason = rejectionReason.trim();

    if (!trimmedReason) {
      setRejectionError('Please provide a rejection reason.');
      return;
    }

    setRejectionError('');
    setActionLoading(true);

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await api.put(
        `/admin/events/${id}/status`,
        { status: 'rejected', rejectionReason: trimmedReason },
        config
      );

      alert('Event rejected successfully!');
      setIsRejectModalOpen(false);
      setRejectionReason('');
      navigate('/admin/dashboard');
    } catch (err) {
      alert('Failed to reject event.');
      console.error(err);
      setActionLoading(false);
    }
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="p-8 text-center">Loading Event...</div>
      </AdminLayout>
    );
  if (error)
    return (
      <AdminLayout>
        <div className="p-8 text-center text-red-500">{error}</div>
      </AdminLayout>
    );
  if (!event)
    return (
      <AdminLayout>
        <div className="p-8 text-center">Event not found.</div>
      </AdminLayout>
    );

  return (
    <>
      <AdminLayout>
        <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-start justify-between border-b border-gray-200 p-8">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{event.title}</h1>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    event.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : event.status === 'approved'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}
                >
                  {event.status.toUpperCase()}
                </span>
              </div>
              <p className="text-lg text-slate-500 dark:text-slate-400">
                {new Date(event.date).toLocaleDateString()} • {event.location}
              </p>
            </div>

            {event.status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction('approved')}
                  disabled={actionLoading}
                  className="rounded-lg bg-green-600 px-6 py-2 font-semibold text-white transition duration-200 hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={() => {
                    setRejectionError('');
                    setRejectionReason('');
                    setIsRejectModalOpen(true);
                  }}
                  disabled={actionLoading}
                  className="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white transition duration-200 hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Reject'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Description</h3>
                <p className="leading-relaxed text-slate-600 dark:text-slate-300">{event.description}</p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Category & Tags</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                    {event.category || 'General'}
                  </span>
                  {event.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-600 dark:bg-slate-800/60 dark:text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-fit space-y-6 rounded-lg bg-slate-50 p-6 dark:bg-slate-800/50">
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Organizer</h3>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nexus-primary text-lg font-bold text-white">
                    {event.organizer?.name?.charAt(0) || 'O'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {event.organizer?.organizationName || event.organizer?.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{event.organizer?.email}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 dark:border-slate-700/60">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Event Details
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Capacity:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{event.capacity || 'Unlimited'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Fee:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {event.registrationFee > 0 ? `$${event.registrationFee}` : 'Free'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>

      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Reject Event</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Please provide a reason for rejecting this event. The organizer will see this explanation.
            </p>
            <textarea
              className="mt-4 min-h-[140px] w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="Describe why this event is being rejected..."
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              disabled={actionLoading}
            />
            {rejectionError && (
              <p className="mt-2 text-sm text-red-500">{rejectionError}</p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => {
                  if (actionLoading) return;
                  setIsRejectModalOpen(false);
                  setRejectionReason('');
                  setRejectionError('');
                }}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                onClick={handleConfirmReject}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminEventDetails;
