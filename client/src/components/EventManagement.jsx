import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import api from '../api/axios';

const EventManagement = ({ searchTerm }) => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Filter States ---
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [organizerFilter, setOrganizerFilter] = useState('');

    // Fetch events
    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) { navigate('/sign-in'); return; }
                const config = { headers: { 'Authorization': `Bearer ${token}` } };
                const response = await api.get('/admin/events', config);
                setEvents(response.data);
            } catch (err) {
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    localStorage.removeItem('token'); navigate('/sign-in');
                }
                setError('Failed to load events.');
            } finally { setLoading(false); }
        };
        fetchEvents();
    }, [navigate]);

    // --- Derived Lists for Dropdowns ---
    // We use useMemo so we don't recalculate these lists on every keystroke
    const uniqueCategories = useMemo(() => {
        return [...new Set(events.map(event => event.category).filter(Boolean))];
    }, [events]);

    const uniqueOrganizers = useMemo(() => {
        // Create a map to ensure unique organizers by ID
        const orgMap = new Map();
        events.forEach(event => {
            if (event.organizer) {
                orgMap.set(event.organizer._id, event.organizer.organizationName || event.organizer.name);
            }
        });
        return Array.from(orgMap.entries()); // Returns [[id, name], [id, name]]
    }, [events]);


    // --- Main Filtering Logic ---
    const filteredEvents = events.filter(event => {
        // 1. Global Search (Title or Organizer Name)
        const matchesSearch = 
            event.title.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
            (event.organizer?.name && event.organizer.name.toLowerCase().includes((searchTerm || '').toLowerCase())) ||
            (event.organizer?.organizationName && event.organizer.organizationName.toLowerCase().includes((searchTerm || '').toLowerCase()));

        // 2. Status Filter
        const matchesStatus = statusFilter ? event.status === statusFilter : true;

        // 3. Category Filter
        const matchesCategory = categoryFilter ? event.category === categoryFilter : true;

        // 4. Organizer Filter
        const matchesOrganizer = organizerFilter ? event.organizer?._id === organizerFilter : true;

        return matchesSearch && matchesStatus && matchesCategory && matchesOrganizer;
    });

    const handleDelete = async (id) => {
        if(!window.confirm("Delete this event permanently?")) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            await api.delete(`/admin/events/${id}`, config);
            setEvents(events.filter(e => e._id !== id));
            alert("Event deleted.");
        } catch (err) {
            console.error("Delete error:", err); 
            alert(`Delete failed: ${err.response?.data?.message || err.message}`);
        }
    };

    // Reset all filters
    const clearFilters = () => {
        setStatusFilter('');
        setCategoryFilter('');
        setOrganizerFilter('');
    };

    return (
        <AdminLayout searchTerm={searchTerm}>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h2 className="text-xl font-semibold text-nexus-dark">All Events Management</h2>
                    
                    {/* --- Filter Controls --- */}
                    <div className="flex flex-wrap gap-3">
                        {/* Status Dropdown */}
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nexus-primary"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        {/* Category Dropdown */}
                        <select 
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nexus-primary"
                        >
                            <option value="">All Categories</option>
                            {uniqueCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        {/* Organizer Dropdown */}
                        <select 
                            value={organizerFilter}
                            onChange={(e) => setOrganizerFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nexus-primary"
                        >
                            <option value="">All Organizers</option>
                            {uniqueOrganizers.map(([id, name]) => (
                                <option key={id} value={id}>{name}</option>
                            ))}
                        </select>

                        {/* Clear Filters Button (only show if a filter is active) */}
                        {(statusFilter || categoryFilter || organizerFilter) && (
                            <button 
                                onClick={clearFilters}
                                className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>
                
                {loading ? <p className="text-center py-10 text-gray-500">Loading events...</p> : 
                 error ? <p className="text-red-500 text-center py-10">{error}</p> :
                 filteredEvents.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <p className="mb-2 text-lg">No events found.</p>
                        <p className="text-sm">Try adjusting your filters or search terms.</p>
                    </div>
                 ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organizer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEvents.map((event) => (
                                <tr key={event._id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{event.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                            {event.category || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{event.organizer?.organizationName || event.organizer?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(event.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${event.status==='approved'?'bg-green-100 text-green-800':event.status==='rejected'?'bg-red-100 text-red-800':'bg-yellow-100 text-yellow-800'}`}>{event.status}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/admin/events/${event._id}`} className="text-nexus-primary hover:text-blue-900 mr-4">View Details</Link>
                                        <button onClick={() => handleDelete(event._id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default EventManagement;