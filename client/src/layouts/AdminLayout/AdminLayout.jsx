import React, { useCallback, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import useAdminTheme from '../../hooks/useAdminTheme';

const AdminLayout = ({ children, searchTerm, onSearchChange }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, setTheme } = useAdminTheme();

  const handleMenuToggle = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const handleThemeToggle = useCallback(() => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [theme, setTheme]);

  return (
    <div className="relative flex min-h-screen bg-gray-100 font-sans transition-colors duration-300 dark:bg-gray-900">
      <AdminSidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={handleSidebarClose}
        />
      )}

      <div className="flex flex-1 flex-col">
        <AdminHeader
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          onMenuToggle={handleMenuToggle}
          theme={theme}
          onThemeToggle={handleThemeToggle}
        />
        <main className="flex-1 p-6 sm:p-8 transition-colors duration-300">
          <div className="mt-6 sm:mt-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
