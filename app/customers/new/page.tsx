'use client';

import { useState } from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import { ArrowLeft, User, Building2 } from 'lucide-react';
import Link from 'next/link';
import CustomerService from '@/utils/api/customerService';
import { useRouter } from 'next/navigation';

export default function NewCustomerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [customerType, setCustomerType] = useState<'individual' | 'business'>('individual');
  const [formData, setFormData] = useState({
    // Wspólne pola
    email: '',
    phone: '',
    city: '',
    
    // Pola dla klienta indywidualnego
    firstName: '',
    lastName: '',
    
    // Pola dla klienta biznesowego
    companyName: '',
    taxId: '',
    contactFirstName: '',
    contactLastName: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (customerType === 'individual') {
        const individualCustomerData = {
          type: 'individual' as const, // Use const assertion for literal type
          firstName: formData.firstName,
          lastName: formData.lastName,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          city: formData.city
        };
        
        await CustomerService.createIndividualCustomer(individualCustomerData);
      } else {
        const businessCustomerData = {
          type: 'business' as const, // Use const assertion for literal type
          companyName: formData.companyName,
          name: formData.companyName,
          taxId: formData.taxId,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          contactPersons: [
            {
              firstName: formData.contactFirstName,
              lastName: formData.contactLastName,
              isPrimary: true
            }
          ]
        };
        
        await CustomerService.createBusinessCustomer(businessCustomerData);
      }
      
      // Powrót do listy klientów po pomyślnym dodaniu
      router.push('/customers');
    } catch (error) {
      console.error('Błąd podczas dodawania klienta:', error);
      alert('Wystąpił błąd podczas dodawania klienta. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">Dodaj nowego klienta</h1>
          <p className="text-gray-600">
            Wypełnij formularz, aby dodać nowego klienta do systemu
          </p>
        </div>
        <Link
          href="/customers"
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={16} className="mr-1" />
          Powrót do listy
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Wybór typu klienta */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-3">Typ klienta</h2>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setCustomerType('individual')}
              className={`flex-1 p-4 border rounded-lg flex items-center justify-center ${
                customerType === 'individual' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <User size={20} className="mr-2" />
              <span>Klient indywidualny</span>
            </button>
            <button
              type="button"
              onClick={() => setCustomerType('business')}
              className={`flex-1 p-4 border rounded-lg flex items-center justify-center ${
                customerType === 'business' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Building2 size={20} className="mr-2" />
              <span>Klient biznesowy</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Dane podstawowe */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-3">
              {customerType === 'individual' ? 'Dane osobowe' : 'Dane firmy'}
            </h2>
            
            {customerType === 'individual' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    Imię*
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nazwisko*
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nazwa firmy*
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
                    NIP*
                  </label>
                  <input
                    type="text"
                    id="taxId"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Dane kontaktowe */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-3">Dane kontaktowe</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email*
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Miasto
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Osoba kontaktowa (tylko dla firm) */}
          {customerType === 'business' && (
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-3">Osoba kontaktowa</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contactFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                    Imię
                  </label>
                  <input
                    type="text"
                    id="contactFirstName"
                    name="contactFirstName"
                    value={formData.contactFirstName}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="contactLastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nazwisko
                  </label>
                  <input
                    type="text"
                    id="contactLastName"
                    name="contactLastName"
                    value={formData.contactLastName}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Przyciski formularza */}
          <div className="flex justify-end pt-6">
            <Link
              href="/customers"
              className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Anuluj
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75"
            >
              {isLoading ? 'Zapisywanie...' : 'Zapisz klienta'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}