import React from 'react';
import AdminLayout from '../layouts/AdminLayout/AdminLayout';
import useUserManagementState from '../hooks/useUserManagementState';
import UserTable from '../components/UserManagement/UserTable';

const UserManagementPage = () => {
  const {
    searchTerm,
    setSearchTerm,
    filteredUsers,
    loading,
    error,
    actionLoading,
    handleRoleChange,
  } = useUserManagementState();

  const emptyMessage = searchTerm
    ? `No users found matching "${searchTerm}".`
    : 'No users found.';

  return (
    <AdminLayout>
      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_30px_80px_rgba(5,10,25,0.35)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">User Management</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Review users, adjust roles, and keep access aligned.</p>
            </div>
            <label className="w-full sm:w-72">
              <span className="sr-only">Search users</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name or email"
                className="w-full rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-nexus-primary focus:outline-none focus:ring-2 focus:ring-nexus-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-nexus-primary dark:focus:ring-blue-500/40"
              />
            </label>
          </div>

          <div className="mt-6">
            {loading ? (
              <p className="py-4 text-center text-sm text-slate-600 dark:text-slate-300">Loading...</p>
            ) : error ? (
              <p className="py-4 text-center text-sm text-red-500 dark:text-red-300">{error}</p>
            ) : (
              <UserTable
                users={filteredUsers}
                actionLoading={actionLoading}
                onRoleChange={handleRoleChange}
                emptyMessage={emptyMessage}
              />
            )}
          </div>
        </div>
      </section>
    </AdminLayout>
  );
};

export default UserManagementPage;
