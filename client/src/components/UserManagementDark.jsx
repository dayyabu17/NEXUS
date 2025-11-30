import React from 'react';
import AdminLayiutDark from './AdminLayiutDark';

const UserManagementDark = ({
  searchTerm,
  setSearchTerm,
  filteredUsers,
  loading,
  error,
  actionLoading,
  handleRoleChange,
}) => (
  <AdminLayiutDark searchTerm={searchTerm} onSearchChange={setSearchTerm}>
    <div className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-lg border border-gray-800 shadow shadow-black/30 transition-colors duration-500 ease-in-out">
      <h2 className="text-xl font-semibold text-white mb-4">User Management</h2>
      {loading ? (
        <p className="text-center py-4 text-gray-400">Loading...</p>
      ) : error ? (
        <p className="text-red-300 text-center">{error}</p>
      ) : filteredUsers.length === 0 && searchTerm ? (
        <p className="text-gray-400 text-center py-4">No users found matching "{searchTerm}".</p>
      ) : filteredUsers.length === 0 ? (
        <p className="text-gray-400 text-center py-4">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-950/40 divide-y divide-gray-800">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-900/60 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-900/40 text-purple-300'
                          : user.role === 'organizer'
                          ? 'bg-blue-900/40 text-blue-300'
                          : 'bg-gray-800 text-gray-200'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      value={user.role}
                      onChange={(event) => handleRoleChange(user._id, event.target.value)}
                      disabled={actionLoading[user._id]}
                      className="block w-full pl-3 pr-10 py-2 text-base bg-gray-900 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-nexus-primary sm:text-sm rounded-md transition-colors duration-500 ease-in-out"
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
  </AdminLayiutDark>
);

export default UserManagementDark;
