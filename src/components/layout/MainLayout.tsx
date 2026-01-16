import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAppSelector } from '../../store';

interface MainLayoutProps {
  children: React.ReactNode;
}

const LoadingSpinner: React.FC<{ message?: string | null }> = ({ message }) => (
  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-2xl flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin" />
      {message && (
        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
          {message}
        </p>
      )}
    </div>
  </div>
);

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading, loadingMessage } = useAppSelector((state) => state.ui);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content - Add top padding for fixed header */}
        <main className="flex-1 bg-gray-50 dark:bg-gray-900 pt-16 relative">
          {loading && <LoadingSpinner message={loadingMessage} />}
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
