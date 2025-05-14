'use client';

import { useState, ReactNode, useEffect } from 'react';
import { Bell, Menu, User } from 'lucide-react';
import Sidebar from './Sidebar';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useWindowSize } from '@/hooks/useWindowSize';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();
  const { width } = useWindowSize();
  
  // Auto collapse sidebar on small screens
  useEffect(() => {
    if (width && width < 1024) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [width]);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10 dark:bg-gray-800 dark:border-gray-700 dark:border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center space-x-4">
              <button className="p-1 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-700">
                <Bell size={20} />
              </button>
              
              <div className="relative inline-block text-left">
                <Link href="/profile" className="flex items-center space-x-2 group">
                  <div className="bg-gray-200 h-8 w-8 rounded-full flex items-center justify-center group-hover:bg-primary-100 dark:bg-gray-700">
                    <User size={16} className="text-gray-600 dark:text-gray-300" />
                  </div>
                  {user && (
                    <div className="hidden md:block text-sm text-gray-700 font-medium dark:text-gray-300">
                      {`${user.firstName} ${user.lastName}` || user.email || 'Benutzer'}
                    </div>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;