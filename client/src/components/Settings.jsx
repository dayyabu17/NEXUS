import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../api/axios';

const DEFAULT_AVATAR = '/images/default-avatar.jpeg'; 

const Settings = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [profilePicture, setProfilePicture] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [picLoading, setPicLoading] = useState(false);

  useEffect(() => {
    // Load current user data from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setFormData(prev => ({ ...prev, name: user.name, email: user.email }));
      
      // Determine correct profile picture URL
      const pfpUrl = user.profilePicture && !user.profilePicture.startsWith('http') 
                     ? `http://localhost:5000/public${user.profilePicture}` 
                     : user.profilePicture || DEFAULT_AVATAR;
      setProfilePicture(pfpUrl);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file selection and preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      setProfilePicture(URL.createObjectURL(file)); // Immediate preview
    }
  };

  // 1. Handle General Profile Update (Name, Email, Password)
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', content: '' });

    if (formData.password && formData.password !== formData.confirmPassword) {
        setMessage({ type: 'error', content: 'Passwords do not match' });
        return;
    }

    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const updateData = {
            name: formData.name,
            email: formData.email,
        };
        if (formData.password) updateData.password = formData.password;

        const response = await api.put('/auth/profile', updateData, config);

        // Update local storage
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const updatedUser = { ...currentUser, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Trigger storage event for AdminLayout to update header immediately
        window.dispatchEvent(new Event("storage"));

        setMessage({ type: 'success', content: 'Profile updated successfully!' });
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' })); 
    } catch (err) {
        setMessage({ type: 'error', content: err.response?.data?.message || 'Update failed' });
    } finally {
        setLoading(false);
    }
  };

  // 2. Handle Profile Picture Upload
  const handlePictureUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', content: 'Please select a file first!' });
      return;
    }

    setPicLoading(true);
    setMessage({ type: '', content: '' });
    
    const uploadFormData = new FormData();
    uploadFormData.append('profilePicture', selectedFile); 

    try {
      const token = localStorage.getItem('token');
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        } 
      };
      
      const response = await api.put('/auth/profile/picture', uploadFormData, config);
      
      // Update local storage
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...currentUser, profilePicture: response.data.profilePicture };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Update Preview with server URL
      setProfilePicture(`http://localhost:5000/public${response.data.profilePicture}`); 
      setSelectedFile(null); 

      // Trigger storage event for AdminLayout header
      window.dispatchEvent(new Event("storage"));

      setMessage({ type: 'success', content: response.data.message });
    } catch (err) {
        console.error("Upload error:", err);
        setMessage({ type: 'error', content: err.response?.data?.message || 'Picture upload failed' });
    } finally {
        setPicLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-semibold text-nexus-dark mb-6">Account Settings</h2>

        {message.content && (
            <div className={`p-4 rounded-md mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {message.content}
            </div>
        )}

        {/* Profile Picture Section */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-100 flex flex-col items-center">
            <img 
                src={profilePicture} 
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
            />
            <h3 className="text-lg font-medium text-gray-900 mt-4">{formData.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{formData.email}</p>

            <div className="flex items-center gap-4 mt-2">
                <input 
                    type="file" 
                    onChange={handleFileChange} 
                    className="block w-full text-sm text-gray-500
                               file:mr-4 file:py-2 file:px-4
                               file:rounded-full file:border-0
                               file:text-sm file:font-semibold
                               file:bg-blue-50 file:text-nexus-primary
                               hover:file:bg-blue-100"
                />
                <button
                    onClick={handlePictureUpload}
                    disabled={!selectedFile || picLoading}
                    className="bg-nexus-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50"
                >
                    {picLoading ? 'Uploading...' : 'Upload'}
                </button>
            </div>
        </div>

        {/* Profile Details Form */}
        <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nexus-primary focus:border-transparent"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nexus-primary focus:border-transparent"
                />
            </div>

            <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Leave blank to keep current"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nexus-primary focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm new password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nexus-primary focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-nexus-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default Settings;