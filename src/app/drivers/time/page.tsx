'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock, Download, Calendar } from 'lucide-react';
import AppLayout from '@/components/Layout/AppLayout';

// Definicje typów
interface Driver {
  id: number;
  name: string;
  hoursThisMonth: number;
  overtimeHours: number;
  restViolations: number;
}

interface TimeEntry {
  id: number;
  driverId: number;
  date: string;
  startTime: string;
  endTime: string;
  breakTime: number;
  type: 'drive' | 'office' | 'maintenance' | 'training' | 'other';
  tripId: string;
  destination: string;
  notes: string;
}

const DriverTimeTrackingPage: React.FC = () => {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  
  // Przykładowe dane kierowców
  const drivers: Driver[] = [
    { id: 1, name: 'Hans Müller', hoursThisMonth: 168, overtimeHours: 12, restViolations: 0 },
    { id: 2, name: 'Klaus Schmidt', hoursThisMonth: 152, overtimeHours: 0, restViolations: 1 },
    { id: 3, name: 'Thomas Weber', hoursThisMonth: 176, overtimeHours: 16, restViolations: 2 },
    { id: 4, name: 'Michael Fischer', hoursThisMonth: 160, overtimeHours: 8, restViolations: 0 },
    { id: 5, name: 'Stefan Becker', hoursThisMonth: 144, overtimeHours: 0, restViolations: 0 },
  ];
  
  // Przykładowe dane czasu pracy
  const timeEntries: TimeEntry[] = [
    { id: 1, driverId: 1, date: '2023-07-01', startTime: '08:00', endTime: '17:00', breakTime: 45, type: 'drive', tripId: 'T-1001', destination: 'München', notes: '' },
    { id: 2, driverId: 1, date: '2023-07-02', startTime: '07:30', endTime: '16:30', breakTime: 60, type: 'drive', tripId: 'T-1002', destination: 'Frankfurt', notes: '' },
    { id: 3, driverId: 1, date: '2023-07-03', startTime: '09:00', endTime: '18:00', breakTime: 45, type: 'drive', tripId: 'T-1003', destination: 'Hamburg', notes: '' },
    { id: 4, driverId: 1, date: '2023-07-04', startTime: '08:00', endTime: '16:00', breakTime: 30, type: 'office', tripId: '', destination: '', notes: 'Fahrzeugwartung' },
    { id: 5, driverId: 1, date: '2023-07-05', startTime: '07:00', endTime: '19:00', breakTime: 90, type: 'drive', tripId: 'T-1004', destination: 'Wien', notes: 'Längere Fahrt mit Übernachtung' },
    { id: 6, driverId: 2, date: '2023-07-01', startTime: '08:30', endTime: '17:30', breakTime: 60, type: 'drive', tripId: 'T-1005', destination: 'Berlin', notes: '' },
    { id: 7, driverId: 2, date: '2023-07-02', startTime: '08:00', endTime: '16:00', breakTime: 45, type: 'office', tripId: '', destination: '', notes: 'Schulung' },
    { id: 8, driverId: 3, date: '2023-07-01', startTime: '07:00', endTime: '18:00', breakTime: 60, type: 'drive', tripId: 'T-1006', destination: 'Dresden', notes: '' },
  ];
  
  // Filtrowanie wpisów czasu pracy na podstawie wybranego kierowcy
  const filteredTimeEntries = timeEntries.filter(entry => {
    // Jeśli nie wybrano kierowcy, pokazuj wszystkie wpisy
    if (selectedDriver === null) return true;
    
    return entry.driverId === selectedDriver;
  });
  
  // Funkcja pomocnicza do formatowania daty
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  // Funkcja do obliczania całkowitego czasu pracy
  const calculateWorkTime = (startTime: string, endTime: string, breakTime: number): string => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    // Oblicz różnicę w minutach
    let diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    
    // Odejmij czas przerwy
    diffMinutes -= breakTime;
    
    // Konwertuj na format godziny:minuty
    const hours = Math.floor(diffMinutes / 60);
    const minutes = Math.round(diffMinutes % 60);
    
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
  };
  
  // Funkcja do formatowania nazwy miesiąca
  const formatMonth = (date: Date): string => {
    return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  };
  
  // Przejście do poprzedniego miesiąca
  const prevMonth = (): void => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1));
  };
  
  // Przejście do następnego miesiąca
  const nextMonth = (): void => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));
  };
  
  // Dodaj nowy wpis czasu pracy
  const addTimeEntry = (e: React.FormEvent): void => {
    e.preventDefault();
    // Tutaj byłaby logika do dodawania nowego wpisu
    alert('Neuer Zeiteintrag würde hinzugefügt werden.');
  };

  // Dodanie funkcji przejścia do zarządzania czasem pracy kierowcy
  const handleManageDriverTime = (driverId: number): void => {
    router.push(`/drivers/time/${driverId}`);
  };
  
  return (
    <AppLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Fahrer-Zeiterfassung</h1>
          
          <div className="flex space-x-2">
            <button 
              className="bg-gray-200 px-3 py-1 rounded-md text-gray-700 flex items-center"
              onClick={() => {/* Export logic */}}
            >
              <Download className="h-4 w-4 mr-1" />
              Exportieren
            </button>
            <Link 
              href={`/drivers/time/${selectedDriver || '1'}/manage`}
              className="bg-blue-600 text-white px-3 py-1 rounded-md flex items-center"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Tagesmanagement
            </Link>
          </div>
        </div>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Hier können Sie die Arbeitszeiten Ihrer Fahrer verfolgen und verwalten. Überwachen Sie Fahrzeiten, 
                Ruhezeiten und achten Sie auf die Einhaltung gesetzlicher Vorschriften.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:space-x-6 mb-8">
          {/* Sidebar with drivers */}
          <div className="w-full md:w-1/3 lg:w-1/4 mb-6 md:mb-0">
            <div className="border border-gray-200 rounded-lg">
              <h2 className="bg-gray-50 border-b border-gray-200 px-4 py-3 text-lg font-medium">Fahrer</h2>
              
              <div className="px-4 py-3 border-b border-gray-200">
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Fahrer suchen..."
                />
              </div>
              
              <div className="divide-y divide-gray-200">
                <div 
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${selectedDriver === null ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedDriver(null)}
                >
                  <div className="font-medium">Alle Fahrer</div>
                  <div className="text-sm text-gray-500">{timeEntries.length} Einträge insgesamt</div>
                </div>
                
                {drivers.map(driver => (
                  <div 
                    key={driver.id}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${selectedDriver === driver.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedDriver(driver.id)}
                  >
                    <div className="font-medium">{driver.name}</div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{driver.hoursThisMonth} Std. diesen Monat</span>
                      {driver.overtimeHours > 0 && (
                        <span className="text-orange-600">+{driver.overtimeHours} Überstunden</span>
                      )}
                    </div>
                    {driver.restViolations > 0 && (
                      <div className="mt-1">
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                          {driver.restViolations} Ruhezeitverstöße
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Summary Section */}
            <div className="mt-4 border border-gray-200 rounded-lg">
              <h2 className="bg-gray-50 border-b border-gray-200 px-4 py-3 text-lg font-medium">
                Zusammenfassung {selectedDriver ? `- ${drivers.find(d => d.id === selectedDriver)?.name}` : ''}
              </h2>
              
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-blue-800 text-sm font-medium">Stunden (Monat)</div>
                    <div className="text-blue-900 text-2xl font-bold">
                      {selectedDriver ? drivers.find(d => d.id === selectedDriver)?.hoursThisMonth : 
                      drivers.reduce((sum, driver) => sum + driver.hoursThisMonth, 0)}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-green-800 text-sm font-medium">Überstunden</div>
                    <div className="text-green-900 text-2xl font-bold">
                      {selectedDriver ? drivers.find(d => d.id === selectedDriver)?.overtimeHours : 
                      drivers.reduce((sum, driver) => sum + driver.overtimeHours, 0)}
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="text-yellow-800 text-sm font-medium">Durchschnitt/Tag</div>
                    <div className="text-yellow-900 text-2xl font-bold">
                      {selectedDriver 
                        ? (drivers.find(d => d.id === selectedDriver)?.hoursThisMonth || 0 / 20).toFixed(1)
                        : (drivers.reduce((sum, driver) => sum + driver.hoursThisMonth, 0) / (drivers.length * 20)).toFixed(1)}
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-red-800 text-sm font-medium">Ruhezeitverstöße</div>
                    <div className="text-red-900 text-2xl font-bold">
                      {selectedDriver ? drivers.find(d => d.id === selectedDriver)?.restViolations : 
                      drivers.reduce((sum, driver) => sum + driver.restViolations, 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content with time tracking */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <div className="border border-gray-200 rounded-lg">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center">
                  <button 
                    onClick={prevMonth} 
                    className="p-1 rounded hover:bg-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <h2 className="text-lg font-medium mx-2">{formatMonth(selectedMonth)}</h2>
                  <button 
                    onClick={nextMonth} 
                    className="p-1 rounded hover:bg-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                <button 
                  className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Neuer Eintrag
                </button>
              </div>
              
              {filteredTimeEntries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Datum
                        </th>
                        {selectedDriver === null && (
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fahrer
                          </th>
                        )}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Zeiten
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Arbeitszeit
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Typ
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aktionen
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTimeEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatDate(entry.date)}
                          </td>
                          {selectedDriver === null && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {drivers.find(d => d.id === entry.driverId)?.name}
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {entry.startTime} - {entry.endTime}
                            <div className="text-xs text-gray-400">
                              {entry.breakTime} Min. Pause
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {calculateWorkTime(entry.startTime, entry.endTime, entry.breakTime)} Std.
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              entry.type === 'drive' ? 'bg-green-100 text-green-800' : 
                              entry.type === 'office' ? 'bg-blue-100 text-blue-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {entry.type === 'drive' ? 'Fahrt' : 
                               entry.type === 'office' ? 'Büro' : entry.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {entry.type === 'drive' ? (
                              <>
                                <div>{entry.tripId}</div>
                                <div className="text-xs">{entry.destination}</div>
                              </>
                            ) : (
                              <div>{entry.notes}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button 
                                className="text-indigo-600 hover:text-indigo-800"
                                onClick={() => handleManageDriverTime(entry.driverId)}
                                title="Tägliche Zeiterfassung"
                              >
                                <Clock className="h-5 w-5" />
                              </button>
                              <button className="text-indigo-600 hover:text-indigo-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button className="text-red-600 hover:text-red-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>Keine Zeiteinträge für den ausgewählten Zeitraum gefunden</p>
                  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Eintrag hinzufügen
                  </button>
                </div>
              )}
            </div>
            
            {/* New Entry Form */}
            <div className="mt-6 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-4">Neuen Zeiteintrag erfassen</h3>
              
              <form onSubmit={addTimeEntry}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                    <label className="block text-gray-700 text-sm font-medium mb-2">Datum</label>
                    <input 
                      type="date" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Aktivitätstyp</label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="drive">Fahrt</option>
                      <option value="office">Büroarbeit</option>
                      <option value="maintenance">Wartung</option>
                      <option value="training">Schulung</option>
                      <option value="other">Sonstiges</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Startzeit</label>
                    <input 
                      type="time" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Endzeit</label>
                    <input 
                      type="time" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Pausenzeit (Min.)</label>
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="z.B. 45"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Reise/Buchung (falls zutreffend)</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Buchungs-ID oder Reiseziel eingeben"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Kilometerstand</label>
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optionaler Kilometerstand"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Bemerkungen</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                    placeholder="Zusätzliche Informationen..."
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Zeiteintrag speichern
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DriverTimeTrackingPage;