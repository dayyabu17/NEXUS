import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import api from '../api/axios';

const UserManagement = () => { // No longer receiving searchTerm as a prop here
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState({});
    
    // --- State lives here ---
    const [searchTerm, setSearchTerm] = useState(''); 

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) { navigate('/sign-in'); return; }
                const config = { headers: { 'Authorization': `Bearer ${token}` } };
                const response = await api.get('/admin/users', config);
                setUsers(response.data);
            } catch (err) {
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    localStorage.removeItem('token'); navigate('/sign-in');
                }
                setError('Error loading users.');
            } finally { setLoading(false); }
        };
        fetchUsers();
    }, [navigate]);

    // Filter logic uses the local searchTerm
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRoleChange = async (userId, newRole) => {
        if (!window.confirm(`Change role to "${newRole}"?`)) return;
        setActionLoading(prev => ({ ...prev, [userId]: true }));
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            await api.put(`/admin/users/${userId}/role`, { role: newRole }, config);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
            alert('Role updated.');
        } catch (err) { alert(err.response?.data?.message || 'Update failed'); }
        finally { setActionLoading(prev => ({ ...prev, [userId]: false })); }
    };

    return (
        // Pass searchTerm and setSearchTerm (as onSearchChange) to AdminLayout
        <AdminLayout searchTerm={searchTerm} onSearchChange={setSearchTerm}>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-nexus-dark mb-4">User Management</h2>
                {loading ? <p className="text-center py-4">Loading...</p> : 
                 error ? <p className="text-red-500 text-center">{error}</p> :
                 filteredUsers.length === 0 && searchTerm ? (
                    <p className="text-gray-500 text-center py-4">No users found matching "{searchTerm}".</p>
                ) : filteredUsers.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No users found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.organizationName || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role==='admin'?'bg-purple-100 text-purple-800':user.role==='organizer'?'bg-blue-100 text-blue-800':'bg-gray-100'}`}>{user.role}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <select 
                                                value={user.role} 
                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                disabled={actionLoading[user._id]}
                                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-nexus-primary sm:text-sm rounded-md"
                                            >
                                                <option value="student">Student</option>
                                                <option value="organizer">Organizer</option>
                                                <option value="admin">Admin</option>
                                            </select>
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

export default UserManagement;