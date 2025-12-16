import React from 'react';
import AdminSidebar from './AdminLayout/AdminSidebar';
import AdminHeader from './AdminLayout/AdminHeader';

const AdminLayout = ({ children, searchTerm, onSearchChange }) => (
  <div className="flex min-h-screen bg-gray-100 font-sans transition-colors duration-300 dark:bg-slate-950">
    <AdminSidebar />
    <main className="flex-1 p-8 transition-colors duration-300">
      <AdminHeader searchTerm={searchTerm} onSearchChange={onSearchChange} />
      <div className="mt-8">{children}</div>
    </main>
  </div>
);

export default AdminLayout;