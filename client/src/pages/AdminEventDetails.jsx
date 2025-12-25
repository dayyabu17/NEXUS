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
    <AdminLayout>
      <div className="mx-auto max-w-4xl overflow-hidden rounded-xl bg-white shadow-md">
        <div className="flex items-start justify-between border-b border-gray-200 p-8">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  event.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : event.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {event.status.toUpperCase()}
              </span>
            </div>
            <p className="text-lg text-gray-500">
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
                onClick={() => handleAction('rejected')}
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
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Description</h3>
              <p className="leading-relaxed text-gray-600">{event.description}</p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Category & Tags</h3>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                  {event.category || 'General'}
                </span>
                {event.tags?.map((tag, index) => (
                  <span key={index} className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-600">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="h-fit space-y-6 rounded-lg bg-gray-50 p-6">
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Organizer</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nexus-primary text-lg font-bold text-white">
                  {event.organizer?.name?.charAt(0) || 'O'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {event.organizer?.organizationName || event.organizer?.name}
                  </p>
                  <p className="text-sm text-gray-500">{event.organizer?.email}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Event Details
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-500">Capacity:</span>
                  <span className="font-medium text-gray-900">{event.capacity || 'Unlimited'}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Fee:</span>
                  <span className="font-medium text-gray-900">
                    {event.registrationFee > 0 ? `$${event.registrationFee}` : 'Free'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEventDetails;
