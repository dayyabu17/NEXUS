import React from 'react';

const roleBadgeVariants = {
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
  organizer: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

const getRoleBadgeClass = (role) => roleBadgeVariants[role] || roleBadgeVariants.default;

const UserRow = ({ user, onRoleChange, isUpdating }) => (
  <tr className="hover:bg-slate-50 transition-colors duration-150 dark:hover:bg-slate-800/60">
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
      {user.name}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
      {user.email}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm">
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
        {user.role}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
      <select
        value={user.role}
        onChange={(event) => onRoleChange(user._id, event.target.value)}
        disabled={isUpdating}
        className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-nexus-primary focus:outline-none focus:ring-2 focus:ring-nexus-primary disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-nexus-primary dark:focus:ring-blue-500/40"
      >
        <option value="student">Student</option>
        <option value="organizer">Organizer</option>
        <option value="admin">Admin</option>
      </select>
    </td>
  </tr>
);

const UserTable = ({ users, actionLoading, onRoleChange, emptyMessage = 'No users found.' }) => {
  if (!users || users.length === 0) {
    return (
      <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-900/70">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900/60">
          {users.map((user) => (
            <UserRow
              key={user._id}
              user={user}
              onRoleChange={onRoleChange}
              isUpdating={Boolean(actionLoading?.[user._id])}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
