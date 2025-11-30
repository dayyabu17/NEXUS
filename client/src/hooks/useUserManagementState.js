import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const useUserManagementState = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/sign-in');
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await api.get('/admin/users', config);
        setUsers(response.data);
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('token');
          navigate('/sign-in');
        }
        setError('Error loading users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term),
    );
  }, [users, searchTerm]);

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Change role to "${newRole}"?`)) {
      return;
    }

    setActionLoading((prev) => ({ ...prev, [userId]: true }));

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await api.put(`/admin/users/${userId}/role`, { role: newRole }, config);
      setUsers((prev) => prev.map((user) => (user._id === userId ? { ...user, role: newRole } : user)));
      alert('Role updated.');
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    filteredUsers,
    loading,
    error,
    actionLoading,
    handleRoleChange,
  };
};

export default useUserManagementState;
