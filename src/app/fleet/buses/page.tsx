'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/Layout/AppLayout';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  Bus, 
  RefreshCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Wrench
} from 'lucide-react';

interface BusType {
  _id: string;
  name: string;
  licensePlate: string;
  manufacturer: string;
  model: string;
  year: number;
  seats: number;
  busType: 'SMALL' | 'MEDIUM' | 'LARGE';
  status: string;
  displayStatus?: string;
  features: string[];
  nextHUDate?: string;
  nextSPDate?: string;
  isHUDueSoon?: boolean;
  isSPDueSoon?: boolean;
  mileage?: number;
  currentLocation?: string;
  nextBooking?: {
    id: string;
    bookingNumber: string;
    startDate: string;
    destination: string;
  };
}

interface FilterOptions {
  status: string[];
  busType: string[];
  minSeats: number | null;
  maxSeats: number | null;
  searchQuery: string;
}

type ExtendedBusType = BusType;

export default function FleetPage() {
  const { user } = useAuth();
  
  const [buses, setBuses] = useState<ExtendedBusType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterOptions>({
    status: [],
    busType: [],
    minSeats: null,
    maxSeats: null,
    searchQuery: '',
  });
  
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Mapowanie statusów z bazy danych na przyjazne dla użytkownika wartości
  const mapStatusToDisplay = (status: string): string => {
    switch (status) {
      case 'available': return 'Verfügbar';
      case 'driving': return 'Auf Reise';
      case 'maintenance': return 'In Wartung';
      case 'repair': return 'In Reparatur';
      case 'outOfService': return 'Außer Betrieb';
      default: return 'Unbekannt';
    }
  };

  // Fetch buses data from MongoDB
  const fetchBuses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data from API endpoint
      const response = await fetch('/api/fleet/buses');
      
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.status}`);
      }
      
      const busesData = await response.json();
      
      // Transform data to match the required format
      const transformedBuses: ExtendedBusType[] = busesData.map((bus: any) => ({
        _id: bus._id,
        name: bus.name,
        licensePlate: bus.licensePlate,
        manufacturer: bus.manufacturer,
        model: bus.model,
        year: bus.year,
        seats: bus.seats,
        busType: bus.busType,
        status: bus.status,
        displayStatus: mapStatusToDisplay(bus.status),
        features: bus.features,
        nextHUDate: bus.nextHUDate,
        nextSPDate: bus.nextSPDate,
        isHUDueSoon: bus.isHUDueSoon,
        isSPDueSoon: bus.isSPDueSoon,
        mileage: bus.mileage,
        // These fields might come from related collections or calculated fields
        currentLocation: bus.currentLocation || null
      }));
      
      setBuses(transformedBuses);
    } catch (err) {
      console.error('Error fetching buses:', err);
      setError('Error loading fleet data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    if (user) {
      fetchBuses();
    }
  }, [fetchBuses, user]);

  // Handle filter toggle
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Apply filters to the buses list
  const filteredBuses = buses.filter(bus => {
    // Filter by status
    if (filters.status.length > 0 && !filters.status.includes(bus.status)) {
      return false;
    }
    
    // Filter by bus type
    if (filters.busType.length > 0 && !filters.busType.includes(bus.busType)) {
      return false;
    }
    
    // Filter by seats
    if (filters.minSeats !== null && bus.seats < filters.minSeats) {
      return false;
    }
    
    if (filters.maxSeats !== null && bus.seats > filters.maxSeats) {
      return false;
    }
    
    // Filter by search query
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      return (
        bus.name.toLowerCase().includes(searchLower) ||
        bus.licensePlate.toLowerCase().includes(searchLower) ||
        bus.manufacturer.toLowerCase().includes(searchLower) ||
        bus.model.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Get status indicator color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'driving':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
      case 'repair':
        return 'bg-yellow-100 text-yellow-800';
      case 'outOfService':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">Fuhrpark</h1>
        <p className="text-gray-600">
          Übersicht und Verwaltung aller Fahrzeuge
        </p>
      </div>

      {/* Actions Panel */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <div className="relative max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder="Fahrzeug suchen..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
            />
          </div>
          
          <button
            onClick={toggleFilters}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter size={16} className="mr-2" />
            Filter
          </button>
          
          <button
            onClick={() => fetchBuses()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCcw size={16} className="mr-2" />
            Aktualisieren
          </button>
        </div>
        
        <div className="flex gap-2">
          <Link
            href="/fleet/maintenance"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Wrench size={16} className="mr-2" />
            Wartungsplan
          </Link>
          <Link
            href="/fleet/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus size={16} className="mr-2" />
            Neues Fahrzeug
          </Link>
        </div>
      </div>

      {/* Filter Panel (shown when filters are toggled) */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <h3 className="text-lg font-medium mb-4">Filter</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="status-available"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={filters.status.includes('available')}
                    onChange={(e) => {
                      const newStatus = e.target.checked
                        ? [...filters.status, 'available']
                        : filters.status.filter(s => s !== 'available');
                      setFilters({...filters, status: newStatus});
                    }}
                  />
                  <label htmlFor="status-available" className="ml-2 text-sm text-gray-700">
                    <span className="inline-flex items-center">
                      <CheckCircle2 size={14} className="mr-1 text-green-500" />
                      Verfügbar
                    </span>
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="status-driving"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={filters.status.includes('driving')}
                    onChange={(e) => {
                      const newStatus = e.target.checked
                        ? [...filters.status, 'driving']
                        : filters.status.filter(s => s !== 'driving');
                      setFilters({...filters, status: newStatus});
                    }}
                  />
                  <label htmlFor="status-driving" className="ml-2 text-sm text-gray-700">
                    <span className="inline-flex items-center">
                      <Bus size={14} className="mr-1 text-blue-500" />
                      Auf Reise
                    </span>
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="status-maintenance"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={filters.status.includes('maintenance')}
                    onChange={(e) => {
                      const newStatus = e.target.checked
                        ? [...filters.status, 'maintenance']
                        : filters.status.filter(s => s !== 'maintenance');
                      setFilters({...filters, status: newStatus});
                    }}
                  />
                  <label htmlFor="status-maintenance" className="ml-2 text-sm text-gray-700">
                    <span className="inline-flex items-center">
                      <AlertCircle size={14} className="mr-1 text-yellow-500" />
                      In Wartung
                    </span>
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="status-outOfService"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={filters.status.includes('outOfService')}
                    onChange={(e) => {
                      const newStatus = e.target.checked
                        ? [...filters.status, 'outOfService']
                        : filters.status.filter(s => s !== 'outOfService');
                      setFilters({...filters, status: newStatus});
                    }}
                  />
                  <label htmlFor="status-outOfService" className="ml-2 text-sm text-gray-700">
                    <span className="inline-flex items-center">
                      <XCircle size={14} className="mr-1 text-gray-500" />
                      Außer Betrieb
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Bus Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fahrzeugtyp</label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="type-small"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={filters.busType.includes('SMALL')}
                    onChange={(e) => {
                      const newTypes = e.target.checked
                        ? [...filters.busType, 'SMALL']
                        : filters.busType.filter(t => t !== 'SMALL');
                      setFilters({...filters, busType: newTypes});
                    }}
                  />
                  <label htmlFor="type-small" className="ml-2 text-sm text-gray-700">
                    Klein (bis 20 Sitzplätze)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="type-medium"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={filters.busType.includes('MEDIUM')}
                    onChange={(e) => {
                      const newTypes = e.target.checked
                        ? [...filters.busType, 'MEDIUM']
                        : filters.busType.filter(t => t !== 'MEDIUM');
                      setFilters({...filters, busType: newTypes});
                    }}
                  />
                  <label htmlFor="type-medium" className="ml-2 text-sm text-gray-700">
                    Mittel (21-50 Sitzplätze)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="type-large"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={filters.busType.includes('LARGE')}
                    onChange={(e) => {
                      const newTypes = e.target.checked
                        ? [...filters.busType, 'LARGE']
                        : filters.busType.filter(t => t !== 'LARGE');
                      setFilters({...filters, busType: newTypes});
                    }}
                  />
                  <label htmlFor="type-large" className="ml-2 text-sm text-gray-700">
                    Groß (51+ Sitzplätze)
                  </label>
                </div>
              </div>
            </div>

            {/* Seats Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sitzplätze</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="min-seats" className="sr-only">Min. Sitzplätze</label>
                  <input
                    id="min-seats"
                    type="number"
                    min="0"
                    placeholder="Min"
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    value={filters.minSeats || ''}
                    onChange={(e) => setFilters({...filters, minSeats: e.target.value ? Number(e.target.value) : null})}
                  />
                </div>
                <div>
                  <label htmlFor="max-seats" className="sr-only">Max. Sitzplätze</label>
                  <input
                    id="max-seats"
                    type="number"
                    min="0"
                    placeholder="Max"
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    value={filters.maxSeats || ''}
                    onChange={(e) => setFilters({...filters, maxSeats: e.target.value ? Number(e.target.value) : null})}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setFilters({
                status: [],
                busType: [],
                minSeats: null,
                maxSeats: null,
                searchQuery: '',
              })}
              className="mr-2 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Zurücksetzen
            </button>
            <button
              onClick={toggleFilters}
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Anwenden
            </button>
          </div>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
              viewMode === 'grid'
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
              viewMode === 'table'
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Tabelle
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Fehler beim Laden der Fahrzeugdaten
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fleet Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-500">Lade Fahrzeugdaten...</span>
        </div>
      ) : filteredBuses.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <Bus className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Fahrzeuge gefunden</h3>
          <p className="mt-1 text-sm text-gray-500">
            Es wurden keine Fahrzeuge gefunden, die den Filterkriterien entsprechen.
          </p>
          <div className="mt-6">
            <Link
              href="/fleet/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Fahrzeug hinzufügen
            </Link>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuses.map((bus) => (
            <div key={bus._id} className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{bus.name}</h3>
                    <p className="text-sm text-gray-500">{bus.licensePlate}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(bus.status)}`}>
                    {bus.displayStatus}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Hersteller</p>
                    <p className="text-sm font-medium">{bus.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Modell</p>
                    <p className="text-sm font-medium">{bus.model}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Baujahr</p>
                    <p className="text-sm font-medium">{bus.year}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Sitzplätze</p>
                    <p className="text-sm font-medium">{bus.seats}</p>
                  </div>
                </div>
                
                {bus.nextBooking && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="font-medium">Nächste Reise:</span>
                    </div>
                    <p className="text-sm mt-1">
                      {new Date(bus.nextBooking.startDate).toLocaleDateString('de-DE')} • {bus.nextBooking.destination}
                    </p>
                    <Link href={`/bookings/${bus.nextBooking.id}`} className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block">
                      Buchung {bus.nextBooking.bookingNumber} anzeigen
                    </Link>
                  </div>
                )}
                
                {bus.currentLocation && (
                  <div className="mt-4 flex items-center text-sm">
                    <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                    <span>Standort: {bus.currentLocation}</span>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 px-4 py-3 border-t">
                <div className="flex justify-between">
                  <Link
                    href={`/fleet/${bus._id}`}
                    className="text-blue-600 text-sm font-medium hover:text-blue-800"
                  >
                    Details
                  </Link>
                  <Link
                    href={`/fleet/${bus._id}/edit`}
                    className="text-blue-600 text-sm font-medium hover:text-blue-800"
                  >
                    Bearbeiten
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fahrzeug
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Info
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wartung
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Aktionen</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBuses.map((bus) => (
                  <tr key={bus._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Bus className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{bus.name}</div>
                          <div className="text-sm text-gray-500">{bus.licensePlate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{bus.manufacturer} {bus.model}</div>
                      <div className="text-sm text-gray-500">{bus.seats} Sitzplätze • Baujahr {bus.year}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(bus.status)}`}>
                        {bus.displayStatus}
                      </span>
                      {bus.currentLocation && (
                        <div className="text-xs text-gray-500 mt-1 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {bus.currentLocation}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span className={`mr-2 h-2 w-2 rounded-full ${bus.isHUDueSoon ? 'bg-yellow-400' : 'bg-green-400'}`}></span>
                          <span>HU: {new Date(bus.nextHUDate || '').toLocaleDateString('de-DE')}</span>
                        </div>
                        <div className="flex items-center">
                          <span className={`mr-2 h-2 w-2 rounded-full ${bus.isSPDueSoon ? 'bg-yellow-400' : 'bg-green-400'}`}></span>
                          <span>SP: {new Date(bus.nextSPDate || '').toLocaleDateString('de-DE')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/fleet/${bus._id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Details
                      </Link>
                      <Link
                        href={`/fleet/${bus._id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Bearbeiten
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

