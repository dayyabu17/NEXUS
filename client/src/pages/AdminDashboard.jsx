import React from 'react';
import AdminLayout from '../layouts/AdminLayout/AdminLayout';
import useAdminDashboardData from '../hooks/useAdminDashboardData';
import StatsGrid from '../components/AdminDashboard/StatsGrid';
import PendingTable from '../components/AdminDashboard/PendingTable';

const AdminDashboardPage = () => {
  const { statsDisplay, events, loading, error } = useAdminDashboardData();

  return (
    <AdminLayout>
      <section className="space-y-8">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-600 shadow-sm animate-pulse dark:border-gray-800 dark:bg-slate-900 dark:text-gray-300">
            Loading admin dashboard…
          </div>
        ) : (
          <>
            <StatsGrid stats={statsDisplay} />
            <PendingTable events={events} />
          </>
        )}
      </section>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
