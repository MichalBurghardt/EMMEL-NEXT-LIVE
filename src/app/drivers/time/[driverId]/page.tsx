'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/components/Layout/AppLayout';

// W przyszłości ten komponent będzie importowany z odpowiedniego pliku
// import DriverTimeManagement from '@/components/Drivers/DriverTimeManagement';

// Definicje typów
interface Driver {
  id: number;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  address: string;
  dateOfBirth: string;
  employmentDate: string;
  status: 'active' | 'on-leave' | 'sick' | 'inactive';
}

interface TimeRecord {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  activityType: 'driving' | 'rest' | 'loading' | 'waiting' | 'other';
  notes: string;
  location?: string;
  distance?: number;
}

interface DailyReport {
  date: string;
  totalWorkTime: number;
  totalDrivingTime: number;
  totalRestTime: number;
  totalBreakTime: number;
  records: TimeRecord[];
}

const DriverTimeManagementPage: React.FC = () => {
  const params = useParams();
  const driverId = params?.driverId as string;
  
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  
  // Przykładowe dane kierowcy (w rzeczywistości pobierane z API)
  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        setIsLoading(true);
        // Tu byłoby zapytanie do API
        // const response = await fetch(`/api/drivers/${driverId}`);
        // const data = await response.json();
        
        // Przykładowe dane dla demonstracji
        const mockDriver: Driver = {
          id: parseInt(driverId),
          name: 'Hans Müller',
          email: 'hans.mueller@example.com',
          phone: '+49 123 456789',
          licenseNumber: 'DE12345678',
          licenseExpiry: '2025-12-31',
          address: 'Hauptstraße 1, 10115 Berlin',
          dateOfBirth: '1980-05-15',
          employmentDate: '2018-03-01',
          status: 'active'
        };
        
        setDriver(mockDriver);
        
        // Pobieranie raportu dziennego
        const formattedDate = selectedDate.toISOString().split('T')[0];
        // const reportResponse = await fetch(`/api/drivers/${driverId}/time-reports?date=${formattedDate}`);
        // const reportData = await reportResponse.json();
        
        // Przykładowy raport dzienny
        const mockReport: DailyReport = {
          date: formattedDate,
          totalWorkTime: 8.5,
          totalDrivingTime: 6.0,
          totalRestTime: 1.5,
          totalBreakTime: 1.0,
          records: [
            {
              id: 1,
              date: formattedDate,
              startTime: '08:00',
              endTime: '10:30',
              breakDuration: 0,
              activityType: 'driving',
              notes: 'Fahrt nach München',
              location: 'Berlin - München',
              distance: 120
            },
            {
              id: 2,
              date: formattedDate,
              startTime: '10:30',
              endTime: '11:00',
              breakDuration: 30,
              activityType: 'rest',
              notes: 'Pause',
              location: 'Raststätte'
            },
            {
              id: 3,
              date: formattedDate,
              startTime: '11:00',
              endTime: '13:30',
              breakDuration: 0,
              activityType: 'driving',
              notes: 'Fahrt nach Stuttgart',
              location: 'München - Stuttgart',
              distance: 90
            },
            {
              id: 4,
              date: formattedDate,
              startTime: '13:30',
              endTime: '14:30',
              breakDuration: 60,
              activityType: 'waiting',
              notes: 'Warten auf Beladung',
              location: 'Stuttgart Logistikzentrum'
            },
            {
              id: 5,
              date: formattedDate,
              startTime: '14:30',
              endTime: '16:30',
              breakDuration: 0,
              activityType: 'driving',
              notes: 'Rückfahrt nach Berlin',
              location: 'Stuttgart - Berlin',
              distance: 110
            }
          ]
        };
        
        setDailyReport(mockReport);
      } catch (error) {
        console.error('Fehler beim Laden der Fahrerdaten:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDriverData();
  }, [driverId, selectedDate]);
  
  // Funkcja do zmiany wybranej daty
  const changeDate = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + offset);
    setSelectedDate(newDate);
  };
  
  // Formatowanie daty do wyświetlenia
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  // Formatowanie czasu
  const formatTime = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
  };
  
  // Formatowanie typu aktywności
  const getActivityLabel = (type: TimeRecord['activityType']): string => {
    switch(type) {
      case 'driving': return 'Fahrt';
      case 'rest': return 'Pause';
      case 'loading': return 'Be-/Entladung';
      case 'waiting': return 'Wartezeit';
      case 'other': return 'Sonstiges';
      default: return type;
    }
  };
  
  // Kolorowanie typu aktywności
  const getActivityColor = (type: TimeRecord['activityType']): string => {
    switch(type) {
      case 'driving': return 'bg-blue-100 text-blue-800';
      case 'rest': return 'bg-green-100 text-green-800';
      case 'loading': return 'bg-yellow-100 text-yellow-800';
      case 'waiting': return 'bg-orange-100 text-orange-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <AppLayout>
      <div className="mb-6">
        <Link 
          href="/drivers/time" 
          className="flex items-center text-blue-600 font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zurück zur Übersicht
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <span className="ml-2 text-gray-600">Daten werden geladen...</span>
          </div>
        ) : driver ? (
          <>
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                Fahrer-Zeitmanagement - {driver.name}
              </h1>
              
              <div className="flex items-center space-x-2 mt-2 md:mt-0">
                <Link 
                  href={`/drivers/${driverId}`}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Fahrerprofil
                </Link>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Bericht exportieren
                </button>
              </div>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <div className="font-semibold text-blue-800">Fahrer #{driverId}</div>
                  <div className="text-sm text-blue-700">{driver.email} | {driver.phone}</div>
                </div>
                <div className="mt-2 md:mt-0">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    driver.status === 'active' ? 'bg-green-100 text-green-800' :
                    driver.status === 'on-leave' ? 'bg-yellow-100 text-yellow-800' :
                    driver.status === 'sick' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {driver.status === 'active' ? 'Aktiv' :
                     driver.status === 'on-leave' ? 'Urlaub' :
                     driver.status === 'sick' ? 'Krank' : 'Inaktiv'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Date Navigation */}
            <div className="mb-6 flex justify-between items-center">
              <button 
                onClick={() => changeDate(-1)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Vorheriger Tag
              </button>
              
              <h2 className="text-lg font-medium">{formatDate(selectedDate)}</h2>
              
              <button 
                onClick={() => changeDate(1)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
              >
                Nächster Tag
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {/* Daily Summary */}
            {dailyReport && (
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-blue-700">Gesamtarbeitszeit</div>
                    <div className="text-2xl font-bold text-blue-900">{formatTime(dailyReport.totalWorkTime)} Std.</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-green-700">Fahrzeit</div>
                    <div className="text-2xl font-bold text-green-900">{formatTime(dailyReport.totalDrivingTime)} Std.</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-yellow-700">Pausenzeit</div>
                    <div className="text-2xl font-bold text-yellow-900">{formatTime(dailyReport.totalBreakTime)} Std.</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-purple-700">Ruhezeit</div>
                    <div className="text-2xl font-bold text-purple-900">{formatTime(dailyReport.totalRestTime)} Std.</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Time Records */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Zeiterfassung</h3>
              
              {dailyReport && dailyReport.records.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Zeit
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aktivität
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dauer
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aktionen
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dailyReport.records.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {record.startTime} - {record.endTime}
                            {record.breakDuration > 0 && (
                              <div className="text-xs text-gray-500">
                                {record.breakDuration} Min. Pause
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${getActivityColor(record.activityType)}`}>
                              {getActivityLabel(record.activityType)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{record.notes}</div>
                            {record.location && (
                              <div className="text-xs text-gray-400">{record.location}</div>
                            )}
                            {record.distance && (
                              <div className="text-xs text-gray-400">{record.distance} km</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(() => {
                              const startTime = new Date(`2000-01-01T${record.startTime}`);
                              const endTime = new Date(`2000-01-01T${record.endTime}`);
                              const diffMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
                              const hours = Math.floor(diffMinutes / 60);
                              const minutes = Math.round(diffMinutes % 60);
                              return `${hours}:${minutes.toString().padStart(2, '0')} Std.`;
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
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
                <div className="bg-gray-50 p-8 text-center rounded-md">
                  <p className="text-gray-600">Keine Zeiteinträge für diesen Tag gefunden.</p>
                  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Zeiteintrag hinzufügen
                  </button>
                </div>
              )}
            </div>
            
            {/* Add New Time Record Form */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Neuen Zeiteintrag erfassen</h3>
              
              <form>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Aktivitätstyp</label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="driving">Fahrt</option>
                      <option value="rest">Pause</option>
                      <option value="loading">Be-/Entladung</option>
                      <option value="waiting">Wartezeit</option>
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
                    <label className="block text-gray-700 text-sm font-medium mb-2">Pausendauer (Min.)</label>
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Standort/Strecke</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="z.B. Berlin - München"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Strecke (km)</label>
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Notizen</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
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
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-red-600 font-medium">Fehler beim Laden der Fahrerdaten.</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Erneut versuchen
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DriverTimeManagementPage;