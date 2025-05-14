'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalTrips: 0,
    totalDrivers: 0,
    activeBuses: 0,
    pendingBookings: 0
  });

  useEffect(() => {
    // Simulate fetching dashboard data
    const fetchDashboardData = async () => {
      try {
        // In a real application, you would fetch data from your API
        // const response = await fetch('/api/dashboard/stats');
        // const data = await response.json();

        // For demo purposes, we'll use mock data
        const mockData = {
          totalTrips: 347,
          totalDrivers: 42,
          activeBuses: 35,
          pendingBookings: 12
        };

        setDashboardData(mockData);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Generate Report
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Trips</dt>
                    <dd>
                      {isLoading ? (
                        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      ) : (
                        <div className="text-lg font-medium text-gray-900 dark:text-white">{dashboardData.totalTrips}</div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Drivers</dt>
                    <dd>
                      {isLoading ? (
                        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      ) : (
                        <div className="text-lg font-medium text-gray-900 dark:text-white">{dashboardData.totalDrivers}</div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-8 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active Buses</dt>
                    <dd>
                      {isLoading ? (
                        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      ) : (
                        <div className="text-lg font-medium text-gray-900 dark:text-white">{dashboardData.activeBuses}</div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Pending Bookings</dt>
                    <dd>
                      {isLoading ? (
                        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      ) : (
                        <div className="text-lg font-medium text-gray-900 dark:text-white">{dashboardData.pendingBookings}</div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activities</h2>
          <div className="mt-4 bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, idx) => (
                  <div key={idx} className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* Sample activity items */}
                <li className="px-6 py-4 flex">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">New booking created</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Booking #12345 was created for customer John Doe</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">10 minutes ago</p>
                  </div>
                </li>
                <li className="px-6 py-4 flex">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Trip completed</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Trip #T-789 was completed successfully</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                  </div>
                </li>
                <li className="px-6 py-4 flex">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Bus maintenance alert</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bus #B-42 is scheduled for maintenance today</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">5 hours ago</p>
                  </div>
                </li>
                <li className="px-6 py-4 flex">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">New driver registered</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Driver Jane Smith has been registered in the system</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Yesterday</p>
                  </div>
                </li>
                <li className="px-6 py-4 flex">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Payment received</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Payment of $1,250 received for booking #B-789</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Yesterday</p>
                  </div>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}