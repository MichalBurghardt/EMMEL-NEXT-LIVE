// Ładowanie zmiennych środowiskowych z pliku .env.local
import { config } from 'dotenv';
import path from 'path';

// Ładowanie zmiennych z pliku .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

// Import necessary dependencies with correct paths
import { connectToDatabase, disconnectFromDatabase } from './db';
import User from '@/models/User';
import Bus from '@/models/Bus';
import Driver from '@/models/Driver';
import BusinessCustomer from '@/models/BusinessCustomer';
import IndividualCustomer from '@/models/IndividualCustomer';
import Booking from '@/models/Booking';
import Trip from '@/models/Trip';
import Maintenance from '@/models/Maintenance';

/**
 * Database seeder function
 * Populates the MongoDB database with sample data
 */
async function seedDatabase() {
  console.log('🔄 Starting database seeding...');
  try {
    // Connect to database
    await connectToDatabase();
    
    // Clear all existing data
    console.log('🗑️ Clearing existing data...');
    await User.deleteMany({});
    await Bus.deleteMany({});
    await Driver.deleteMany({});
    await BusinessCustomer.deleteMany({});
    await IndividualCustomer.deleteMany({});
    await Booking.deleteMany({});
    await Trip.deleteMany({});
    await Maintenance.deleteMany({});
    
    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'test@example.com',
      password: 'Test1234',
      role: 'admin',
      phone: '+49 123 4567890'
    });
    console.log(`✅ Admin user created with email: ${adminUser.email}`);
    
    // Create sample buses
    console.log('🚌 Creating sample buses...');
    const buses = await Bus.create([
      {
        name: 'Mercedes Tourismo',
        licensePlate: 'WL-ER-001',
        model: 'Tourismo',
        manufacturer: 'Mercedes-Benz',
        year: 2019,
        seats: 49,
        busType: 'LARGE',
        status: 'available',
        nextHUDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days in future
        nextSPDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days in future
        mileage: 125000,
        fuelType: 'DIESEL',
        fuelConsumption: 28,
        features: ['WIFI', 'TOILET', 'AIR_CONDITIONING', 'TV', 'USB_PORTS'],
        isActive: true
      },
      {
        name: 'Setra ComfortClass',
        licensePlate: 'WL-ER-002',
        model: 'ComfortClass 500',
        manufacturer: 'Setra',
        year: 2020,
        seats: 54,
        busType: 'LARGE',
        status: 'available',
        nextHUDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days in future
        nextSPDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days in future
        mileage: 95000,
        fuelType: 'DIESEL',
        fuelConsumption: 26.5,
        features: ['WIFI', 'TOILET', 'AIR_CONDITIONING', 'COFFEE_MACHINE', 'USB_PORTS', 'RECLINING_SEATS'],
        isActive: true
      },
      {
        name: 'MAN Lion\'s Coach',
        licensePlate: 'WL-ER-003',
        model: 'Lion\'s Coach',
        manufacturer: 'MAN',
        year: 2021,
        seats: 44,
        busType: 'MEDIUM',
        status: 'available',
        nextHUDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days in future
        nextSPDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000), // 200 days in future
        mileage: 75000,
        fuelType: 'DIESEL',
        fuelConsumption: 25.8,
        features: ['WIFI', 'TOILET', 'AIR_CONDITIONING', 'USB_PORTS'],
        isActive: true
      },
      {
        name: 'Mercedes Sprinter',
        licensePlate: 'WL-ER-004',
        model: 'Sprinter',
        manufacturer: 'Mercedes-Benz',
        year: 2022,
        seats: 19,
        busType: 'SMALL',
        status: 'available',
        nextHUDate: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000), // 240 days in future
        nextSPDate: new Date(Date.now() + 260 * 24 * 60 * 60 * 1000), // 260 days in future
        mileage: 45000,
        fuelType: 'DIESEL',
        fuelConsumption: 12.5,
        features: ['AIR_CONDITIONING', 'USB_PORTS'],
        isActive: true
      }
    ]);
    console.log(`✅ Created ${buses.length} sample buses`);

    // Create sample drivers
    console.log('🧑‍✈️ Creating sample drivers...');
    const drivers = await Driver.create([
      {
        firstName: 'Hans',
        lastName: 'Müller',
        email: 'hans.mueller@emmel-reisen.de',
        phone: '+49 176 12345678',
        licenseNumber: 'D-12345678',
        licenseExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year in future
        dateOfBirth: new Date('1975-06-15'),
        address: {
          street: 'Hauptstraße',
          houseNumber: '1',
          city: 'Alzenau',
          postalCode: '63755',
          country: 'Deutschland'
        },
        licenseTypes: ['D', 'DE'],
        status: 'available',
        experience: 12,
        languages: ['DE', 'EN'],
        isActive: true
      },
      {
        firstName: 'Klaus',
        lastName: 'Schmidt',
        email: 'klaus.schmidt@emmel-reisen.de',
        phone: '+49 176 87654321',
        licenseNumber: 'D-87654321',
        licenseExpiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000), // 300 days in future
        dateOfBirth: new Date('1982-03-22'),
        address: {
          street: 'Bergstraße',
          houseNumber: '5',
          city: 'Alzenau',
          postalCode: '63755',
          country: 'Deutschland'
        },
        licenseTypes: ['D'],
        status: 'available',
        experience: 8,
        languages: ['DE', 'EN', 'FR'],
        isActive: true
      },
      {
        firstName: 'Jan',
        lastName: 'Kowalski',
        email: 'jan.kowalski@emmel-reisen.de',
        phone: '+49 176 55667788',
        licenseNumber: 'D-55667788',
        licenseExpiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days in future
        dateOfBirth: new Date('1990-11-05'),
        address: {
          street: 'Weinbergstraße',
          houseNumber: '10',
          city: 'Kahl am Main',
          postalCode: '63796',
          country: 'Deutschland'
        },
        licenseTypes: ['D', 'DE'],
        status: 'available',
        experience: 5,
        languages: ['DE', 'EN', 'PL'],
        isActive: true
      }
    ]);
    
    // Create driver users
    await Promise.all(drivers.map(driver => {
      return User.create({
        firstName: driver.firstName,
        lastName: driver.lastName,
        email: driver.email,
        password: 'Driver1234',
        role: 'driver',
        phone: driver.phone
      });
    }));
    console.log(`✅ Created ${drivers.length} sample drivers with user accounts`);
    
    // Create sample business customers
    console.log('🏢 Creating sample business customers...');
    const businessCustomers = await BusinessCustomer.create([
      {
        companyName: 'Schule am Weinberg',
        organizationType: 'SCHOOL',
        email: 'info@schule-weinberg.de',
        phone: '+49 6023 12345',
        vatNumber: 'DE123456789',
        address: {
          street: 'Schulstraße',
          houseNumber: '1',
          city: 'Alzenau',
          postalCode: '63755',
          country: 'Deutschland'
        },
        contactPersons: [
          {
            firstName: 'Maria',
            lastName: 'Schmidt',
            position: 'Schulleitung',
            phone: '+49 6023 12345',
            email: 'maria.schmidt@schule-weinberg.de',
            isPrimary: true
          }
        ],
        notes: 'Regelmäßige Schulausflüge'
      },
      {
        companyName: 'Reisebüro Sonnenschein',
        organizationType: 'COMPANY',
        email: 'kontakt@reisebuero-sonnenschein.de',
        phone: '+49 6023 54321',
        vatNumber: 'DE987654321',
        address: {
          street: 'Marktplatz',
          houseNumber: '3',
          city: 'Kahl am Main',
          postalCode: '63796',
          country: 'Deutschland'
        },
        contactPersons: [
          {
            firstName: 'Thomas',
            lastName: 'Weber',
            position: 'Geschäftsführer',
            phone: '+49 6023 54321',
            email: 'thomas.weber@reisebuero-sonnenschein.de',
            isPrimary: true
          }
        ],
        notes: 'Partner für Pauschalreisen'
      },
      {
        companyName: 'Seniorenverein Goldener Herbst',
        organizationType: 'ASSOCIATION',
        email: 'info@goldener-herbst.de',
        phone: '+49 6023 98765',
        vatNumber: 'DE456789123',
        address: {
          street: 'Parkstraße',
          houseNumber: '22',
          city: 'Alzenau',
          postalCode: '63755',
          country: 'Deutschland'
        },
        contactPersons: [
          {
            firstName: 'Helga',
            lastName: 'Bauer',
            position: 'Vorsitzende',
            phone: '+49 6023 98765',
            email: 'helga.bauer@goldener-herbst.de',
            isPrimary: true
          }
        ],
        notes: 'Regelmäßige Tagesausflüge'
      }
    ]);
    
    // Create business customer users
    await Promise.all(businessCustomers.map(customer => {
      // Find primary contact
      const primaryContact = customer.contactPersons?.find(person => person.isPrimary) || customer.contactPersons[0];
      if (!primaryContact) return null;
      
      return User.create({
        firstName: primaryContact.firstName,
        lastName: primaryContact.lastName,
        email: customer.email,
        password: 'Customer1234',
        role: 'business_customer',
        phone: customer.phone
      });
    }));
    console.log(`✅ Created ${businessCustomers.length} sample business customers with user accounts`);
    
    // Create sample individual customers
    console.log('👥 Creating sample individual customers...');
    const individualCustomers = await IndividualCustomer.create([
      {
        firstName: 'Friedrich',
        lastName: 'Wagner',
        email: 'friedrich.wagner@example.com',
        phone: '+49 176 12341234',
        address: {
          street: 'Hauptstraße',
          houseNumber: '42',
          city: 'Frankfurt',
          postalCode: '60306',
          country: 'Deutschland'
        }
      },
      {
        firstName: 'Anna',
        lastName: 'Meyer',
        email: 'anna.meyer@example.com',
        phone: '+49 176 43214321',
        address: {
          street: 'Schillerstraße',
          houseNumber: '15',
          city: 'Hanau',
          postalCode: '63450',
          country: 'Deutschland'
        }
      }
    ]);
    
    // Create individual customer users
    await Promise.all(individualCustomers.map(customer => {
      return User.create({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        password: 'Customer1234',
        role: 'individual_customer',
        phone: customer.phone
      });
    }));
    console.log(`✅ Created ${individualCustomers.length} sample individual customers with user accounts`);
    
    // Create sample trips
    console.log('🚍 Creating sample trips...');
    const trips = await Trip.create([
      {
        title: 'Tagesausflug nach Rothenburg ob der Tauber',
        tripType: 'ONE_WAY',
        isPublic: true,
        description: 'Erleben Sie einen wundervollen Tag in der mittelalterlichen Stadt Rothenburg ob der Tauber',
        startLocation: 'Alzenau',
        endLocation: 'Rothenburg ob der Tauber',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days in future
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000), // 14 days + 12 hours
        distance: 180,
        duration: 120, // minutes
        maxPassengers: 45,
        currentPassengers: 0,
        pricePerSeat: 39.90,
        requiredBusType: 'MEDIUM',
        status: 'BOOKABLE',
        assignedBus: buses[1]._id, // Setra
        assignedDriver: drivers[0]._id, // Hans Müller
        createdBy: adminUser._id
      },
      {
        title: 'Wochenendfahrt nach Berlin',
        tripType: 'ROUND_TRIP',
        isPublic: true,
        description: 'Ein Wochenende in der deutschen Hauptstadt mit Stadtrundfahrt und freier Zeit',
        startLocation: 'Alzenau',
        endLocation: 'Berlin',
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in future
        endDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000), // 32 days in future
        distance: 480,
        duration: 300, // minutes
        maxPassengers: 48,
        currentPassengers: 0,
        pricePerSeat: 129.90,
        requiredBusType: 'LARGE',
        status: 'BOOKABLE',
        assignedBus: buses[0]._id, // Mercedes Tourismo
        assignedDriver: drivers[1]._id, // Klaus Schmidt
        createdBy: adminUser._id
      }
    ]);
    console.log(`✅ Created ${trips.length} sample trips`);
    
    // Create sample bookings
    console.log('📝 Creating sample bookings...');
    
    // Define booking data
    const bookingsData = [
      {
        customerType: 'BusinessCustomer',
        customer: businessCustomers[0]._id, // Schule am Weinberg
        bookingType: 'FULL_BUS',
        startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days in future
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // 20 days + 10 hours
        bus: buses[2]._id, // MAN Lion's Coach
        driver: drivers[2]._id, // Jan Kowalski
        route: {
          startLocation: 'Alzenau',
          endLocation: 'München',
          distance: 380,
          duration: 240, // minutes
          estimatedDuration: 240,
          stops: [
            { location: 'Würzburg', arrivalTime: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000) }
          ]
        },
        passengers: [
          { firstName: 'Schüler', lastName: 'Gruppe', email: 'info@schule-weinberg.de' }
        ],
        price: {
          base: 850.00,
          additionalServices: [{ name: 'Stadtführung', price: 150.00 }],
          discount: 0,
          total: 1000.00
        },
        status: 'CONFIRMED',
        createdBy: adminUser._id,
        // Manually set a booking number to ensure it's present
        bookingNumber: `ER-2504-${Math.floor(1000 + Math.random() * 9000)}`
      },
      {
        customerType: 'IndividualCustomer',
        customer: individualCustomers[0]._id, // Friedrich Wagner
        bookingType: 'INDIVIDUAL_SEATS',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days in future
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000), // 14 days + 12 hours
        bus: buses[1]._id, // Setra
        driver: drivers[0]._id, // Hans Müller
        route: {
          startLocation: 'Alzenau',
          endLocation: 'Rothenburg ob der Tauber',
          distance: 180,
          duration: 120, // minutes
          estimatedDuration: 120
        },
        passengers: [
          { firstName: 'Friedrich', lastName: 'Wagner', email: 'friedrich.wagner@example.com' },
          { firstName: 'Elke', lastName: 'Wagner', email: 'elke.wagner@example.com' }
        ],
        price: {
          base: 79.80,
          additionalServices: [],
          discount: 0,
          total: 79.80
        },
        trip: trips[0]._id, // Rothenburg trip
        status: 'CONFIRMED',
        createdBy: adminUser._id,
        // Manually set a booking number to ensure it's present
        bookingNumber: `ER-2504-${Math.floor(1000 + Math.random() * 9000)}`
      }
    ];
    
    // Create bookings one by one to ensure middleware runs properly
    const bookings = [];
    for (const bookingData of bookingsData) {
      try {
        const booking = await Booking.create(bookingData);
        bookings.push(booking);
      } catch (error) {
        console.error(`Error creating booking:`, error);
      }
    }
    
    console.log(`✅ Created ${bookings.length} sample bookings`);
    
    // Create sample maintenance records
    console.log('🔧 Creating sample maintenance records...');
    const maintenanceRecords = await Maintenance.create([
      {
        vehicle: buses[0].licensePlate, // Używamy licensePlate jako identyfikatora pojazdu
        type: 'OIL_CHANGE',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        description: 'Regular oil change and filters',
        cost: 350.00,
        performedBy: 'Mercedes Service Center',
        status: 'COMPLETED',
        notes: 'Next oil change due in 20,000 km',
        createdBy: adminUser._id,
        priority: 'medium'
      },
      {
        vehicle: buses[1].licensePlate, // Używamy licensePlate jako identyfikatora pojazdu
        type: 'INSPECTION',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in future
        description: 'Annual inspection',
        cost: 650.00,
        performedBy: 'Setra Authorized Workshop',
        status: 'SCHEDULED',
        createdBy: adminUser._id,
        priority: 'high'
      }
    ]);

    console.log(`✅ Created ${maintenanceRecords.length} sample maintenance records`);
    console.log('✅ Database successfully seeded with sample data');

  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    if (error instanceof Error) {
      console.error(`Error message: ${error.message}`);
      if ('code' in error && error.code === 11000) {
        console.error('Duplicate key error - Some records already exist in the database');
      }
    }
    process.exit(1);
  } finally {
    // Disconnect from the database in either case
    try {
      await disconnectFromDatabase();
      console.log('Database connection closed');
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError);
    }
    
    // Complete the seeding process
    if (process.env.NODE_ENV !== 'test') {
      console.log('Seeding process completed');
      process.exit(0);
    }
  }
}

// Execute the seeding function
seedDatabase();