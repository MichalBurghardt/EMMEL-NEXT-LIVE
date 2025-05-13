'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import AppLayout from '@/components/Layout/AppLayout';

interface Driver {
  id: string | number;
  _id?: string;
  name: string;
  documentsCount: number;
  licenseExpiry: string;
}

interface Document {
  id: string | number;
  _id?: string;
  driverId: string | number;
  name: string;
  type: 'license' | 'personal' | 'health' | 'contract' | 'training' | 'other';
  expiryDate?: string;
  uploadDate: string;
  status: 'valid' | 'expiring' | 'warning' | 'expired';
}

interface ExpiryStatus {
  text: string;
  class: string;
}

// Separate Komponente für den Teil, der useSearchParams verwendet
function DriverDocumentsContent() {
  const searchParams = useSearchParams();
  
  // Pobranie parametru driverId z URL
  const initialDriverId = searchParams.get('driverId');
  const [selectedDriver, setSelectedDriver] = useState<string | number | null>(
    initialDriverId ? parseInt(initialDriverId as string) : null
  );
  const [documentType, setDocumentType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Przykładowe dane kierowców
  const drivers: Driver[] = [
    { id: 1, name: 'Hans Müller', documentsCount: 8, licenseExpiry: '2024-12-15' },
    { id: 2, name: 'Klaus Schmidt', documentsCount: 5, licenseExpiry: '2023-09-30' },
    { id: 3, name: 'Thomas Weber', documentsCount: 7, licenseExpiry: '2025-03-22' },
    { id: 4, name: 'Michael Fischer', documentsCount: 6, licenseExpiry: '2024-08-10' },
    { id: 5, name: 'Stefan Becker', documentsCount: 4, licenseExpiry: '2023-11-05' },
  ];
  
  // Przykładowe dane dokumentów
  const documents: Document[] = [
    { id: 1, driverId: 1, name: 'Führerschein', type: 'license', expiryDate: '2024-12-15', uploadDate: '2022-05-10', status: 'valid' },
    { id: 2, driverId: 1, name: 'Personalbogen', type: 'personal', uploadDate: '2021-08-22', status: 'valid' },
    { id: 3, driverId: 1, name: 'Gesundheitszeugnis', type: 'health', expiryDate: '2023-09-18', uploadDate: '2021-09-18', status: 'warning' },
    { id: 4, driverId: 1, name: 'Arbeitsvertrag', type: 'contract', uploadDate: '2020-06-01', status: 'valid' },
    { id: 5, driverId: 1, name: 'Weiterbildungsbescheinigung', type: 'training', expiryDate: '2025-02-28', uploadDate: '2022-02-28', status: 'valid' },
    { id: 6, driverId: 2, name: 'Führerschein', type: 'license', expiryDate: '2023-09-30', uploadDate: '2020-10-15', status: 'expiring' },
    { id: 7, driverId: 2, name: 'Personalbogen', type: 'personal', uploadDate: '2020-08-22', status: 'valid' },
    { id: 8, driverId: 3, name: 'Führerschein', type: 'license', expiryDate: '2025-03-22', uploadDate: '2022-03-22', status: 'valid' },
    { id: 9, driverId: 3, name: 'Gesundheitszeugnis', type: 'health', expiryDate: '2023-07-12', uploadDate: '2021-07-12', status: 'expired' },
  ];

  useEffect(() => {
    // W rzeczywistej aplikacji tutaj można byłoby pobrać dane z API
    // jeśli zmieni się wybrany kierowca
    console.log("Selected driver changed:", selectedDriver);
  }, [selectedDriver]);
  
  // Filtrowanie dokumentów na podstawie wybranego kierowcy i typu oraz wyszukiwanego tekstu
  const filteredDocuments = documents.filter(doc => {
    if (selectedDriver && doc.driverId !== selectedDriver) return false;
    if (documentType !== 'all' && doc.type !== documentType) return false;
    if (searchTerm && !doc.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });
  
  // Funkcja pomocnicza do określania statusu dokumentu
  const getStatusColor = (status: Document['status']): string => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'expiring': return 'bg-yellow-100 text-yellow-800';
      case 'warning': return 'bg-orange-100 text-orange-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Funkcja pomocnicza do formatowania daty
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
  };
  
  // Sprawdzanie statusu daty ważności
  const getExpiryStatus = (expiryDate?: string): ExpiryStatus | null => {
    if (!expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Abgelaufen', class: 'text-red-600' };
    if (diffDays < 30) return { text: `Läuft in ${diffDays} Tagen ab`, class: 'text-orange-600' };
    if (diffDays < 90) return { text: `Läuft in ${diffDays} Tagen ab`, class: 'text-yellow-600' };
    return { text: `Gültig bis ${formatDate(expiryDate)}`, class: 'text-green-600' };
  };

  // Handler dla wyszukiwania dokumentów
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handler dla zmiany typu dokumentu
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDocumentType(e.target.value);
  };

  // Handler dla dodawania nowego dokumentu
  const handleAddDocument = () => {
    // Tutaj można dodać logikę do dodawania dokumentu
    // Np. otwarcie modalu lub nawigacja do strony dodawania dokumentu
    console.log("Add new document");
  };

  // Handler dla przejścia do szczegółów dokumentu
  const handleViewDocument = (docId: string | number) => {
    console.log("View document", docId);
    // router.push(`/drivers/documents/${docId}`);
  };

  // Handler dla pobierania dokumentu
  const handleDownloadDocument = (docId: string | number) => {
    console.log("Download document", docId);
    // Tutaj można dodać logikę do pobierania dokumentu
  };

  // Handler dla odnawiania dokumentu
  const handleRenewDocument = (docId: string | number) => {
    console.log("Renew document", docId);
    // Tutaj można dodać logikę do odnawiania dokumentu
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Fahrer-Dokumente</h1>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Verwalten Sie hier alle wichtigen Dokumente Ihrer Fahrer. Überwachen Sie Ablaufdaten von Führerscheinen, 
              Gesundheitszeugnissen und anderen wichtigen Dokumenten.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row md:space-x-6 mb-8">
        {/* Sidebar with drivers */}
        <div className="w-full md:w-1/3 lg:w-1/4 mb-4 md:mb-0">
          <div className="border border-gray-200 rounded-lg">
            <h2 className="bg-gray-50 border-b border-gray-200 px-4 py-3 text-lg font-medium">Fahrer</h2>
            
            <div className="px-4 py-3 border-b border-gray-200">
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Fahrer suchen..."
                onChange={handleSearch}
              />
            </div>
            
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              <div 
                className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${selectedDriver === null ? 'bg-blue-50' : ''}`}
                onClick={() => setSelectedDriver(null)}
              >
                <div className="font-medium">Alle Fahrer</div>
                <div className="text-sm text-gray-500">{documents.length} Dokumente</div>
              </div>
              
              {drivers.map(driver => (
                <div 
                  key={driver.id}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${selectedDriver === driver.id ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedDriver(driver.id)}
                >
                  <div className="font-medium">{driver.name}</div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{driver.documentsCount} Dokumente</span>
                    {getExpiryStatus(driver.licenseExpiry)?.text === 'Abgelaufen' && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        Führerschein abgelaufen
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main content with documents */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          <div className="border border-gray-200 rounded-lg">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
              <h2 className="text-lg font-medium">Dokumente</h2>
              
              <div className="flex space-x-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Dokumente suchen..."
                    className="border border-gray-300 rounded-md text-sm px-2 py-1 pl-8"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                
                <select 
                  className="border border-gray-300 rounded-md text-sm px-2 py-1"
                  value={documentType}
                  onChange={handleTypeChange}
                >
                  <option value="all">Alle Typen</option>
                  <option value="license">Führerschein</option>
                  <option value="health">Gesundheit</option>
                  <option value="personal">Personal</option>
                  <option value="contract">Verträge</option>
                  <option value="training">Weiterbildung</option>
                </select>
                
                <button 
                  className="bg-blue-600 text-white text-sm px-3 py-1 rounded-md hover:bg-blue-700 flex items-center"
                  onClick={handleAddDocument}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {filteredDocuments.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredDocuments.map(doc => (
                  <div key={doc.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{doc.name}</h3>
                        <p className="text-sm text-gray-500">
                          {drivers.find(d => d.id === doc.driverId)?.name} • Hochgeladen am {formatDate(doc.uploadDate)}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(doc.status)}`}>
                        {doc.status === 'valid' ? 'Gültig' : 
                         doc.status === 'expiring' ? 'Läuft bald ab' : 
                         doc.status === 'warning' ? 'Warnung' : 
                         doc.status === 'expired' ? 'Abgelaufen' : doc.status}
                      </span>
                    </div>
                    
                    {doc.expiryDate && (
                      <div className={`text-xs ${getExpiryStatus(doc.expiryDate)?.class}`}>
                        {getExpiryStatus(doc.expiryDate)?.text}
                      </div>
                    )}
                    
                    <div className="flex space-x-2 mt-2">
                      <button 
                        className="text-blue-600 text-sm hover:underline"
                        onClick={() => handleViewDocument(doc.id)}
                      >
                        Anzeigen
                      </button>
                      <button 
                        className="text-blue-600 text-sm hover:underline"
                        onClick={() => handleDownloadDocument(doc.id)}
                      >
                        Herunterladen
                      </button>
                      <button 
                        className="text-blue-600 text-sm hover:underline"
                        onClick={() => handleRenewDocument(doc.id)}
                      >
                        Erneuern
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p>Keine Dokumente gefunden</p>
                <p className="text-sm mt-2">Passen Sie Ihre Filter an oder fügen Sie neue Dokumente hinzu</p>
                <button 
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={handleAddDocument}
                >
                  Dokument hinzufügen
                </button>
              </div>
            )}
          </div>
          
          {/* Upload new document section */}
          <div className="mt-6 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium mb-4">Neues Dokument hochladen</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Fahrer</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Bitte auswählen</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>{driver.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Dokumenttyp</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Bitte auswählen</option>
                  <option value="license">Führerschein</option>
                  <option value="health">Gesundheitszeugnis</option>
                  <option value="personal">Personaldokument</option>
                  <option value="contract">Vertrag</option>
                  <option value="training">Weiterbildung</option>
                  <option value="other">Sonstiges</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Gültig bis (falls zutreffend)</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Benachrichtigung</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Bitte auswählen</option>
                  <option>30 Tage vor Ablauf</option>
                  <option>60 Tage vor Ablauf</option>
                  <option>90 Tage vor Ablauf</option>
                  <option>Keine Benachrichtigung</option>
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Datei hochladen</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-gray-500 mb-2">Ziehen Sie Dateien hierher oder</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Datei auswählen
                </button>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Dokument speichern
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hauptkomponente mit Suspense-Boundary
const DriverDocumentsPage: React.FC = () => {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-4">Lädt Fahrerunterlagen...</div>}>
        <DriverDocumentsContent />
      </Suspense>
    </AppLayout>
  );
};

export default DriverDocumentsPage;