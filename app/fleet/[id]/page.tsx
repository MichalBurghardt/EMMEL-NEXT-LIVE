'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

// Status translation map
const statusMap: Record<string, { text: string; color: string }> = {
  available: { text: 'Verfügbar', color: 'green' },
  'in-use': { text: 'Im Einsatz', color: 'blue' },
  maintenance: { text: 'Wartung', color: 'orange' },
  'out-of-service': { text: 'Außer Betrieb', color: 'gray' },
};

// Bus type translation map
const busTypeMap: Record<string, string> = {
  SMALL: 'Klein (bis 16 Sitze)',
  MEDIUM: 'Mittel (17-35 Sitze)',
  LARGE: 'Groß (ab 36 Sitze)',
};

// Feature translation map
const featureMap: Record<string, string> = {
  WIFI: 'WLAN',
  TOILET: 'Toilette',
  AIR_CONDITIONING: 'Klimaanlage',
  TV: 'Fernseher',
  COFFEE_MACHINE: 'Kaffeeautomat',
  WHEELCHAIR_ACCESS: 'Rollstuhlgerecht',
  USB_PORTS: 'USB-Anschlüsse',
  RECLINING_SEATS: 'Verstellbare Sitze',
  TABLE: 'Tische',
};

// Fuel type translation map
const fuelTypeMap: Record<string, string> = {
  DIESEL: 'Diesel',
  PETROL: 'Benzin',
  ELECTRIC: 'Elektrisch',
  HYBRID: 'Hybrid',
  GAS: 'Gas',
};

type Bus = {
  _id: string;
  name: string;
  licensePlate: string;
  manufacturer: string;
  model: string;
  year: number;
  seats: number;
  status: string;
  busType: string;
  features: string[];
  fuelType: string;
  fuelConsumption: number;
  mileage: number;
  nextHUDate: string;
  nextSPDate: string;
  lastHUDate?: string;
  lastSPDate?: string;
  notes?: string;
  isHUDueSoon: boolean;
  isSPDueSoon: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function BusDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const [bus, setBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  useEffect(() => {
    const fetchBus = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/fleet/buses/${id}`);
        
        // Upewnij się, że dane mają oczekiwaną strukturę
        if (res.data && res.data.success && res.data.data) {
          // Mapuj dane z API na nasz lokalny format
          const busData = res.data.data;
          
          // Użyj displayStatus jeżeli istnieje, w przeciwnym razie użyj status
          const displayedStatus = busData.displayStatus || busData.status;
          
          setBus({
            ...busData,
            status: displayedStatus // Use the displayStatus for UI if available
          });
          
          setError(null);
        } else {
          throw new Error('Nieprawidłowa odpowiedź z API');
        }
      } catch (err: unknown) {
        console.error('Error fetching bus:', err);
        const errorMessage = axios.isAxiosError(err) 
          ? err.response?.data?.message || 'Ein Fehler ist aufgetreten' 
          : 'Ein Fehler ist aufgetreten';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchBus();
    }
  }, [id]);
  
  const handleDelete = async (hardDelete = false) => {
    try {
      setLoading(true);
      await axios.delete(`/api/fleet/buses/${id}?hardDelete=${hardDelete}`);
      toast.success(hardDelete ? 'Bus wurde gelöscht' : 'Bus wurde deaktiviert');
      router.push('/fleet');
    } catch (err: unknown) {
      console.error('Error deleting bus:', err);
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Ein Fehler ist aufgetreten'
        : 'Ein Fehler ist aufgetreten';
      toast.error(errorMessage);
      setShowDeleteModal(false);
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Nicht gesetzt';
    try {
      const date = new Date(dateString);
      return format(date, 'dd.MM.yyyy', { locale: de });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Ungültiges Datum';
    }
  };
  
  const canEdit = user && (user.role === 'admin' || user.role === 'manager');
  const canDelete = user && user.role === 'admin';
  
  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }
  
  if (error || !bus) {
    return (
      <MainLayout>
        <div className="py-6">
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Fehler</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error || 'Bus konnte nicht geladen werden'}</p>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push('/fleet')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Zurück zur Übersicht
          </button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Link
              href="/fleet"
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{bus.name}</h1>
            <span
              className={`ml-4 inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium 
                ${statusMap[bus.status].color === 'green' 
                  ? 'bg-green-100 text-green-800' 
                  : statusMap[bus.status].color === 'blue' 
                    ? 'bg-blue-100 text-blue-800'
                    : statusMap[bus.status].color === 'orange'
                      ? 'bg-yellow-100 text-yellow-800'
                      : statusMap[bus.status].color === 'red'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                }`}
            >
              {statusMap[bus.status].text}
            </span>
          </div>
          
          <div className="flex space-x-2">
            {canEdit && (
              <Link
                href={`/fleet/edit/${id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PencilIcon className="h-5 w-5 mr-2" />
                Bearbeiten
              </Link>
            )}
            
            {canDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                Löschen
              </button>
            )}
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Fahrzeuginformationen
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Detaillierte Informationen zum Fahrzeug
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Kennzeichen</dt>
                <dd className="mt-1 text-sm text-gray-900">{bus.licensePlate}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Fahrzeugtyp</dt>
                <dd className="mt-1 text-sm text-gray-900">{busTypeMap[bus.busType]}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Hersteller</dt>
                <dd className="mt-1 text-sm text-gray-900">{bus.manufacturer}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Modell</dt>
                <dd className="mt-1 text-sm text-gray-900">{bus.model}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Baujahr</dt>
                <dd className="mt-1 text-sm text-gray-900">{bus.year}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Anzahl der Sitze</dt>
                <dd className="mt-1 text-sm text-gray-900">{bus.seats}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Kraftstoffart</dt>
                <dd className="mt-1 text-sm text-gray-900">{fuelTypeMap[bus.fuelType]}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Kraftstoffverbrauch</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {bus.fuelConsumption ? `${bus.fuelConsumption} l/100km` : 'Nicht angegeben'}
                </dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Kilometerstand</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {bus.mileage ? `${bus.mileage.toLocaleString()} km` : 'Nicht angegeben'}
                </dd>
              </div>
              
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Ausstattung</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {bus.features && bus.features.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {bus.features.map((feature) => (
                        <span
                          key={feature}
                          className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                        >
                          {featureMap[feature] || feature}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">Keine Ausstattung angegeben</span>
                  )}
                </dd>
              </div>
              
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Prüfungen</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className={`p-3 rounded-md ${bus.isHUDueSoon ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                      <div className="flex justify-between">
                        <span className="font-medium">HU (Hauptuntersuchung)</span>
                        {bus.isHUDueSoon && (
                          <ExclamationCircleIcon className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-xs text-gray-500">Letzte</span>
                          <p className="text-sm">{bus.lastHUDate ? formatDate(bus.lastHUDate) : 'Keine'}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Nächste</span>
                          <p className={`text-sm ${bus.isHUDueSoon ? 'font-semibold text-yellow-800' : ''}`}>
                            {formatDate(bus.nextHUDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`p-3 rounded-md ${bus.isSPDueSoon ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                      <div className="flex justify-between">
                        <span className="font-medium">SP (Sicherheitsprüfung)</span>
                        {bus.isSPDueSoon && (
                          <ExclamationCircleIcon className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-xs text-gray-500">Letzte</span>
                          <p className="text-sm">{bus.lastSPDate ? formatDate(bus.lastSPDate) : 'Keine'}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Nächste</span>
                          <p className={`text-sm ${bus.isSPDueSoon ? 'font-semibold text-yellow-800' : ''}`}>
                            {formatDate(bus.nextSPDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </dd>
              </div>
              
              {bus.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Notizen</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                    {bus.notes}
                  </dd>
                </div>
              )}
              
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Erstellung & Aktualisierung</dt>
                <dd className="mt-1 text-sm text-gray-500">
                  Erstellt am {formatDate(bus.createdAt)} • Zuletzt aktualisiert am {formatDate(bus.updatedAt)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      
      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Bus löschen</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Sind Sie sicher, dass Sie diesen Bus löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={() => handleDelete(true)}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Vollständig löschen
              </button>
              <button
                type="button"
                onClick={() => handleDelete(false)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Deaktivieren
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}