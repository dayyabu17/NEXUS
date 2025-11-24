import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import api from '../api/axios';

/**
 * EventDetails Component.
 * Displays detailed information about a specific event.
 * Allows admins to approve or reject the event.
 *
 * @component
 * @returns {JSX.Element} The rendered EventDetails component.
 */
const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch event data when the component mounts
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
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

    // Handle Approve or Reject actions
    const handleAction = async (status) => {
        if(!window.confirm(`Are you sure you want to ${status} this event?`)) return;

        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            
            await api.put(`/admin/events/${id}/status`, { status }, config);
            
            // Redirect back to dashboard after success
            alert(`Event ${status} successfully!`);
            navigate('/admin/dashboard');
            
        } catch (err) {
            alert(`Failed to ${status} event.`);
            console.error(err);
            setActionLoading(false);
        }
    };

    if (loading) return <AdminLayout><div className="p-8 text-center">Loading Event...</div></AdminLayout>;
    if (error) return <AdminLayout><div className="p-8 text-center text-red-500">{error}</div></AdminLayout>;
    if (!event) return <AdminLayout><div className="p-8 text-center">Event not found.</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                {/* Header Section */}
                <div className="p-8 border-b border-gray-200 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium
                                ${event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                  event.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                  'bg-red-100 text-red-800'}`}>
                                {event.status.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-gray-500 text-lg">{new Date(event.date).toLocaleDateString()} • {event.location}</p>
                    </div>
                    
                    {/* Action Buttons (Only show if pending) */}
                    {event.status === 'pending' && (
                        <div className="flex gap-3">
                            <button 
                                onClick={() => handleAction('approved')}
                                disabled={actionLoading}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 disabled:opacity-50"
                            >
                                {actionLoading ? 'Processing...' : 'Approve'}
                            </button>
                            <button 
                                onClick={() => handleAction('rejected')}
                                disabled={actionLoading}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 disabled:opacity-50"
                            >
                                {actionLoading ? 'Processing...' : 'Reject'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                            <p className="text-gray-600 leading-relaxed">{event.description}</p>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Category & Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium">
                                    {event.category || 'General'}
                                </span>
                                {event.tags && event.tags.map((tag, index) => (
                                    <span key={index} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-sm">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="bg-gray-50 p-6 rounded-lg h-fit space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Organizer</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-nexus-primary text-white flex items-center justify-center font-bold text-lg">
                                    {event.organizer?.name?.charAt(0) || 'O'}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{event.organizer?.organizationName || event.organizer?.name}</p>
                                    <p className="text-sm text-gray-500">{event.organizer?.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Event Details</h3>
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

export default EventDetails;
