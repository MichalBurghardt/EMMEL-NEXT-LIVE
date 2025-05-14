'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import { Badge, Button, Spinner, SearchBar, EmptyState, Pagination } from '@/components/UI';

// Define Trip interface
interface Trip {
  id: string;
  source: string;
  destination: string;
  date: string;
  time: string;
  driver: string;
  bus: string;
  status: string;
}

// Mock trip data
const mockTrips: Trip[] = [
  { 
    id: 'T001', 
    source: 'New York', 
    destination: 'Boston', 
    date: '2025-05-15', 
    time: '08:00 AM',
    driver: 'John Smith',
    bus: 'Bus-101',
    status: 'Scheduled'
  },
  { 
    id: 'T002', 
    source: 'Boston', 
    destination: 'Washington DC', 
    date: '2025-05-16', 
    time: '09:30 AM',
    driver: 'Alice Johnson',
    bus: 'Bus-203',
    status: 'In Progress'
  },
  { 
    id: 'T003', 
    source: 'Washington DC', 
    destination: 'Philadelphia', 
    date: '2025-05-17', 
    time: '10:15 AM',
    driver: 'Robert Davis',
    bus: 'Bus-305',
    status: 'Completed'
  },
  { 
    id: 'T004', 
    source: 'Philadelphia', 
    destination: 'New York', 
    date: '2025-05-18', 
    time: '11:45 AM',
    driver: 'Emily Wilson',
    bus: 'Bus-117',
    status: 'Scheduled'
  },
  { 
    id: 'T005', 
    source: 'Chicago', 
    destination: 'Detroit', 
    date: '2025-05-19', 
    time: '07:20 AM',
    driver: 'Michael Brown',
    bus: 'Bus-422',
    status: 'Cancelled'
  }
];

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    // Simulate fetching trips data
    const fetchTrips = async () => {
      try {
        // In a real application, you would fetch data from your API
        // const response = await fetch('/api/trips');
        // const data = await response.json();
        
        // For demo purposes, we'll use mock data with a delay to simulate loading
        setTimeout(() => {
          setTrips(mockTrips);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Failed to fetch trips', error);
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, []);
  // Filter trips based on search term and status filter
  const filteredTrips = trips.filter((trip) => {
    const matchesSearch = 
      trip.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.driver.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    return matchesSearch && trip.status.toLowerCase() === selectedFilter.toLowerCase();
  });

  // Add pagination logic
  const indexOfLastTrip = currentPage * itemsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - itemsPerPage;
  const currentTrips = filteredTrips.slice(indexOfFirstTrip, indexOfLastTrip);
  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);

  const getStatusBadgeVariant = (status: string): 'default' | 'info' | 'success' | 'warning' | 'error' => {
    switch(status.toLowerCase()) {
      case 'scheduled':
        return 'info';
      case 'in progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <MainLayout>
      <div>
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trips</h1>          <div className="mt-4 sm:mt-0">
            <Button>
              Add New Trip
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">          <div className="flex-grow">
            <SearchBar 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
              placeholder="Search trips..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
            <select
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="all">All Trips</option>
              <option value="scheduled">Scheduled</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Trips Table */}
        <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">          {isLoading ? (
            <div className="p-6 flex justify-center items-center h-32">
              <Spinner size="lg" />
            </div>
          ) : currentTrips.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Source</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Destination</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Driver</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bus</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{trip.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{trip.source}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{trip.destination}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{trip.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{trip.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{trip.driver}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{trip.bus}</td>                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(trip.status)}>
                          {trip.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">View</a>
                        <span className="mx-1">|</span>
                        <a href="#" className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">Edit</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>          ) : (
            <EmptyState
              title="No trips found"
              description="No trips found matching your search criteria."
              icon={Search}
              action={
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setSelectedFilter('all');
                }}>
                  Clear filters
                </Button>
              }
            />
          )}
        </div>        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{indexOfFirstTrip + 1}</span> to <span className="font-medium">{Math.min(indexOfLastTrip, filteredTrips.length)}</span> of{' '}
            <span className="font-medium">{filteredTrips.length}</span> results
          </div>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </MainLayout>
  );
}
