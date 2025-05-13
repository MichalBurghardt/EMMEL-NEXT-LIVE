'use client';

// src/components/Drivers/DriversPage.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Filter, RefreshCw, Search, Edit, Trash2, Eye, FileText } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { Button, Card, Badge, Spinner, Alert, Pagination, SearchBar, EmptyState, ConfirmDialog } from '@/components/UI';





// Define TypeScript interfaces
interface Driver {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  email: string;
  phone: string;
  status: 'AVAILABLE' | 'DRIVING' | 'VACATION' | 'SICK' | 'INACTIVE';
  licenseClasses?: string[];
  licenseClass?: string;
  licenseExpiryDate?: string;
}

interface DriverRowProps {
  driver: Driver;
  onView: (driver: Driver) => void;
  onEdit: (driver: Driver) => void;
  onDelete: (driver: Driver) => void;
  onDocuments: (driver: Driver) => void;
}

const DriverRow: React.FC<DriverRowProps> = ({ driver, onView, onEdit, onDelete, onDocuments }) => {
  const getStatusBadge = (status: Driver['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge className="bg-green-100 text-green-800">Verfügbar</Badge>;
      case 'DRIVING':
        return <Badge className="bg-blue-100 text-blue-800">Unterwegs</Badge>;
      case 'VACATION':
        return <Badge className="bg-yellow-100 text-yellow-800">Urlaub</Badge>;
      case 'SICK':
        return <Badge className="bg-red-100 text-red-800">Krank</Badge>;
      case 'INACTIVE':
        return <Badge className="bg-gray-100 text-gray-800">Inaktiv</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unbekannt</Badge>;
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 border-b">
        <div className="font-medium">{driver.firstName} {driver.lastName}</div>
        <div className="text-sm text-gray-500">{driver.employeeId}</div>
      </td>
      <td className="px-4 py-3 border-b">
        {driver.email}
      </td>
      <td className="px-4 py-3 border-b">
        {driver.phone}
      </td>
      <td className="px-4 py-3 border-b">
        {getStatusBadge(driver.status)}
      </td>
      <td className="px-4 py-3 border-b text-center">
        {Array.isArray(driver.licenseClasses) ? driver.licenseClasses.join(', ') : driver.licenseClass || '-'}
      </td>      <td className="px-4 py-3 border-b text-right space-x-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onView(driver)}
          title="Details anzeigen"
          className="p-1"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDocuments(driver)}
          title="Dokumente"
          className="p-1"
        >
          <FileText className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEdit(driver)}
          title="Bearbeiten"
          className="p-1"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => onDelete(driver)}
          title="Löschen"
          className="p-1"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
};

const DriversPage: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
  
  const PAGE_SIZE = 10;

  const fetchDrivers = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/drivers');
      setDrivers(response.data.data || []);
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching drivers:', err);
      
      // Type guard to safely handle the error
      if (err instanceof AxiosError) {
        setError(err.message || 'Ein Fehler ist beim Laden der Fahrer aufgetreten');
      } else if (err instanceof Error) {
        setError(err.message || 'Ein unbekannter Fehler ist aufgetreten');
      } else {
        setError('Ein unbekannter Fehler ist aufgetreten');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = (): void => {
    setSearchTerm('');
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };
  const handleView = (driver: Driver): void => {
    router.push(`/drivers/${driver._id || driver.id}`);
  };

  const handleEdit = (driver: Driver): void => {
    router.push(`/drivers/${driver._id || driver.id}/edit`);
  };

  const handleDelete = (driver: Driver): void => {
    setDriverToDelete(driver);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!driverToDelete) return;
    
    try {
      await axios.delete(`/api/drivers/${driverToDelete._id || driverToDelete.id}`);
      setDrivers(drivers.filter(d => (d._id || d.id) !== (driverToDelete._id || driverToDelete.id)));
      setShowDeleteConfirm(false);
      setDriverToDelete(null);
    } catch (err: unknown) {
      console.error('Error deleting driver:', err);
      // Optional: Show error message to user
      if (err instanceof Error) {
        // Handle error display if needed
      }
    }
  };

  const handleDocuments = (driver: Driver): void => {
    router.push(`/drivers/${driver._id || driver.id}/documents`);
  };

  const handleAddDriver = (): void => {
    router.push('/drivers/new');
  };

  const handleTimeManagement = (): void => {
    router.push('/drivers/time');
  };

  const handleRefresh = (): void => {
    fetchDrivers();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert 
        type="error" 
        title="Fehler beim Laden der Fahrer" 
        message={error} 
      />
    );
  }

  // Filter drivers based on search term and status
  const filteredDrivers = drivers.filter(driver => {
    const fullName = `${driver.firstName} ${driver.lastName}`.toLowerCase();
    const nameMatch = fullName.includes(searchTerm.toLowerCase());
    const emailMatch = (driver.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = (driver.phone || '').includes(searchTerm);
    const idMatch = (driver.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSearch = searchTerm === '' || nameMatch || emailMatch || phoneMatch || idMatch;
    const matchesStatus = filterStatus === '' || driver.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / PAGE_SIZE));
  const currentPageDrivers = filteredDrivers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Stats for summary cards
  const availableCount = drivers.filter(d => d.status === 'AVAILABLE').length;
  const drivingCount = drivers.filter(d => d.status === 'DRIVING').length;
  const licenseExpiringCount = drivers.filter(d => {
    if (!d.licenseExpiryDate) return false;
    const expiryDate = new Date(d.licenseExpiryDate);
    const now = new Date();
    const threeMonthsFromNow = new Date(now);
    threeMonthsFromNow.setMonth(now.getMonth() + 3);
    return expiryDate <= threeMonthsFromNow && expiryDate >= now;
  }).length;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          Fahrer
        </h1>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={handleRefresh}
          >
            Aktualisieren
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={handleTimeManagement}
          >
            Zeiterfassung
          </Button>
          
          <Button 
            variant="primary" 
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={handleAddDriver}
          >
            Neuer Fahrer
          </Button>
        </div>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="text-sm text-gray-500">Alle Fahrer</div>
          <div className="text-2xl font-bold">{drivers.length}</div>
        </Card>
        
        <Card>
          <div className="text-sm text-gray-500">Verfügbar</div>
          <div className="text-2xl font-bold text-green-600">{availableCount}</div>
        </Card>
        
        <Card>
          <div className="text-sm text-gray-500">Unterwegs</div>
          <div className="text-2xl font-bold text-blue-600">{drivingCount}</div>
        </Card>
        
        <Card>
          <div className="text-sm text-gray-500">Führerschein läuft bald ab</div>
          <div className="text-2xl font-bold text-yellow-600">{licenseExpiringCount}</div>
        </Card>
      </div>
      
      <Card>
        <div className="mb-4 flex flex-col md:flex-row justify-between gap-4">
          <div className="w-full md:w-1/3">
            <SearchBar 
              value={searchTerm} 
              onChange={handleSearch} 
              onClear={handleClearSearch}
              placeholder="Fahrer suchen..." 
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="p-2 border border-gray-300 rounded-md"
              value={filterStatus}
              onChange={handleFilterChange}
            >
              <option value="">Status: Alle</option>
              <option value="AVAILABLE">Verfügbar</option>
              <option value="DRIVING">Unterwegs</option>
              <option value="VACATION">Urlaub</option>
              <option value="SICK">Krank</option>
              <option value="INACTIVE">Inaktiv</option>
            </select>
            
            <Button 
              variant="outline" 
              leftIcon={<Filter className="h-4 w-4" />}
            >
              Mehr Filter
            </Button>
          </div>
        </div>
        
        {filteredDrivers.length === 0 ? (
          <EmptyState 
            title="Keine Fahrer gefunden" 
            description="Ändern Sie Ihre Suchkriterien oder erstellen Sie einen neuen Fahrer." 
            icon={Search}
            action={
              <Button 
                variant="primary" 
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={handleAddDriver}
              >
                Neuer Fahrer
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      E-mail
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Telefon
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Führerschein
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentPageDrivers.map(driver => (
                    <DriverRow 
                      key={driver._id || driver.id} 
                      driver={driver} 
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onDocuments={handleDocuments}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            </div>
          </>
        )}
      </Card>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && driverToDelete && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Fahrer löschen"
          message={`Sind Sie sicher, dass Sie den Fahrer "${driverToDelete.firstName} ${driverToDelete.lastName}" löschen möchten?`}
          confirmText="Löschen"
          cancelText="Abbrechen"
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDriverToDelete(null);
          }}
        />
      )}
    </div>
  );
};

export default DriversPage;