import mongoose from 'mongoose';
import { IBooking } from './Booking';

// Stop interface
export interface IStop {
  _id: string;
  name: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  arrivalTime?: Date;
  departureTime?: Date;
  description?: string;
  isPickup: boolean;
  isDropoff: boolean;
  duration: number;
}

// Activity interface
export interface IActivity {
  time: string;
  title: string;
  description?: string;
  location?: string;
  duration: number;
}

// Accommodation interface
export interface IAccommodation {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  checkInTime?: string;
  checkOutTime?: string;
  confirmationNumber?: string;
}

// Meal interface
export interface IMeal {
  included: boolean;
  location?: string;
  time?: string;
}

// Itinerary day interface
export interface IItineraryDay {
  _id: string;
  day: number;
  date?: Date;
  title?: string;
  description?: string;
  activities: IActivity[];
  accommodation?: IAccommodation;
  meals: {
    breakfast: IMeal;
    lunch: IMeal;
    dinner: IMeal;
  };
  notes?: string;
}

// Trip image interface
export interface ITripImage {
  name: string;
  path: string;
  isMain: boolean;
  uploadDate: Date;
}

// Pickup option interface
export interface IPickupOption {
  location: string;
  time: string;
  price: number;
}

// Trip interface with virtuals
export interface ITrip extends mongoose.Document {
  title: string;
  tripType: 'ONE_WAY' | 'ROUND_TRIP' | 'MULTI_DAY_TOUR' | 'SHUTTLE' | 'REGULAR';
  isPublic: boolean;
  description?: string;
  startLocation: string;
  endLocation: string;
  startDate: Date;
  endDate: Date;
  distance?: number;
  estimatedDuration?: number;
  stops: IStop[];
  routeType: 'FASTEST' | 'SHORTEST' | 'ECONOMIC' | 'SCENIC';
  routePolyline?: string;
  routeMapUrl?: string;
  maxPassengers?: number;
  currentPassengers: number;
  pricePerSeat?: number;
  fullTripPrice?: number;
  requiredBusType: 'SMALL' | 'MEDIUM' | 'LARGE' | 'ANY';
  amenities: Array<'WIFI' | 'TOILET' | 'AIR_CONDITIONING' | 'TV' | 'COFFEE_MACHINE' | 'WHEELCHAIR_ACCESS' | 'USB_PORTS' | 'RECLINING_SEATS' | 'TABLE'>;
  itinerary: IItineraryDay[];
  status: 'PLANNED' | 'BOOKABLE' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  bookingDeadline?: Date;
  minRequiredPassengers: number;
  images: ITripImage[];
  includedServices: Array<'TOUR_GUIDE' | 'ENTRANCE_FEES' | 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'ACCOMMODATION' | 'TRAVEL_INSURANCE' | 'WIFI' | 'DRINKS'>;
  pickupOptions: IPickupOption[];
  notes?: string;
  tags: string[];
  assignedBookings: mongoose.Types.ObjectId[];
  assignedBus?: mongoose.Types.ObjectId;
  assignedDriver?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  availableSeats: number;
  occupancyRate: number;
  daysUntilStart: number;
  tripDuration: number;
  
  // Methods
  calculateRevenue(): Promise<number>;
}

// Static methods interface
interface ITripModel extends mongoose.Model<ITrip> {
  findUpcomingPublicTrips(): Promise<ITrip[]>;
  findTripsByLocation(location: string): Promise<ITrip[]>;
}

// Stop schema
const StopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Haltestellen-Name ist erforderlich'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Ort ist erforderlich'],
    trim: true
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  arrivalTime: {
    type: Date
  },
  departureTime: {
    type: Date
  },
  description: String,
  isPickup: {
    type: Boolean,
    default: false
  },
  isDropoff: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number, // in minutes
    default: 15
  }
});

// Itinerary day schema
const ItineraryDaySchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true,
    min: 1
  },
  date: {
    type: Date
  },
  title: {
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  activities: [
    {
      time: String,
      title: String,
      description: String,
      location: String,
      duration: Number // in minutes
    }
  ],
  accommodation: {
    name: String,
    address: String,
    phone: String,
    email: String,
    checkInTime: String,
    checkOutTime: String,
    confirmationNumber: String
  },
  meals: {
    breakfast: {
      included: {
        type: Boolean,
        default: false
      },
      location: String,
      time: String
    },
    lunch: {
      included: {
        type: Boolean,
        default: false
      },
      location: String,
      time: String
    },
    dinner: {
      included: {
        type: Boolean,
        default: false
      },
      location: String,
      time: String
    }
  },
  notes: String
});

// Main trip schema
const TripSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Titel ist erforderlich'],
      trim: true
    },
    tripType: {
      type: String,
      enum: ['ONE_WAY', 'ROUND_TRIP', 'MULTI_DAY_TOUR', 'SHUTTLE', 'REGULAR'],
      default: 'ONE_WAY'
    },
    isPublic: {
      type: Boolean,
      default: false // false: private trip, true: public trip with bookable seats
    },
    description: {
      type: String,
      trim: true
    },
    startLocation: {
      type: String,
      required: [true, 'Startort ist erforderlich'],
      trim: true
    },
    endLocation: {
      type: String,
      required: [true, 'Zielort ist erforderlich'],
      trim: true
    },
    startDate: {
      type: Date,
      required: [true, 'Startdatum ist erforderlich']
    },
    endDate: {
      type: Date,
      required: [true, 'Enddatum ist erforderlich']
    },
    distance: {
      type: Number // in kilometers
    },
    estimatedDuration: {
      type: Number // in minutes
    },
    stops: [StopSchema],
    routeType: {
      type: String,
      enum: ['FASTEST', 'SHORTEST', 'ECONOMIC', 'SCENIC'],
      default: 'FASTEST'
    },
    routePolyline: {
      type: String
    },
    routeMapUrl: {
      type: String
    },
    maxPassengers: {
      type: Number,
      min: [1, 'Mindestens ein Passagier ist erforderlich']
    },
    currentPassengers: {
      type: Number,
      default: 0
    },
    pricePerSeat: {
      type: Number // if isPublic=true, price per seat
    },
    fullTripPrice: {
      type: Number // if isPublic=false, price for entire trip
    },
    requiredBusType: {
      type: String,
      enum: ['SMALL', 'MEDIUM', 'LARGE', 'ANY'],
      default: 'ANY'
    },
    amenities: [
      {
        type: String,
        enum: [
          'WIFI',
          'TOILET',
          'AIR_CONDITIONING',
          'TV',
          'COFFEE_MACHINE',
          'WHEELCHAIR_ACCESS',
          'USB_PORTS',
          'RECLINING_SEATS',
          'TABLE'
        ]
      }
    ],
    itinerary: [ItineraryDaySchema],
    status: {
      type: String,
      enum: ['PLANNED', 'BOOKABLE', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'PLANNED'
    },
    bookingDeadline: {
      type: Date
    },
    minRequiredPassengers: {
      type: Number,
      default: 1
    },
    images: [
      {
        name: String,
        path: String,
        isMain: {
          type: Boolean,
          default: false
        },
        uploadDate: {
          type: Date,
          default: Date.now
        }
      }
    ],
    includedServices: [
      {
        type: String,
        enum: [
          'TOUR_GUIDE',
          'ENTRANCE_FEES',
          'BREAKFAST',
          'LUNCH',
          'DINNER',
          'ACCOMMODATION',
          'TRAVEL_INSURANCE',
          'WIFI',
          'DRINKS'
        ]
      }
    ],
    pickupOptions: [
      {
        location: String,
        time: String,
        price: Number
      }
    ],
    notes: {
      type: String
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    assignedBookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
      }
    ],
    assignedBus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus'
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for available seats
TripSchema.virtual('availableSeats').get(function (this: ITrip) {
  if (!this.maxPassengers) return 0;
  return this.maxPassengers - this.currentPassengers;
});

// Virtual field for occupancy rate
TripSchema.virtual('occupancyRate').get(function (this: ITrip) {
  if (!this.maxPassengers) return 0;
  return (this.currentPassengers / this.maxPassengers) * 100;
});

// Virtual field for days until start
TripSchema.virtual('daysUntilStart').get(function (this: ITrip) {
  const now = new Date();
  const start = new Date(this.startDate);

  // Difference in milliseconds
  const diffTime = Math.abs(start.getTime() - now.getTime());
  // Difference in days
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual field for trip duration in days
TripSchema.virtual('tripDuration').get(function (this: ITrip) {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);

  // Difference in milliseconds
  const diffTime = Math.abs(end.getTime() - start.getTime());
  // Difference in days
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Middleware to update passenger count based on assigned bookings
TripSchema.pre('save', async function (this: ITrip, next) {
  if (this.isPublic && this.assignedBookings && this.assignedBookings.length > 0) {
    try {
      // This needs to be adapted for Next.js to avoid circular dependencies
      const Booking = mongoose.models.Booking;
      
      if (Booking) {
        const bookings = await Booking.find({
          _id: { $in: this.assignedBookings },
          status: { $in: ['CONFIRMED', 'PAID'] }
        });
        
        this.currentPassengers = bookings.reduce((total, booking: IBooking) => {
          return total + (booking.passengers ? booking.passengers.length : 0);
        }, 0);
      }
    } catch (err) {
      console.error('Error updating passenger count:', err);
    }
  }
  
  next();
});

// Method to calculate revenue from trip
TripSchema.methods.calculateRevenue = async function (this: ITrip) {
  if (this.isPublic) {
    // For public trips (selling seats)
    return this.currentPassengers * (this.pricePerSeat || 0);
  } else {
    // For private trips (hiring entire bus)
    try {
      // This needs to be adapted for Next.js to avoid circular dependencies
      const Booking = mongoose.models.Booking;
      
      if (Booking) {
        const confirmedBookings = await Booking.find({
          _id: { $in: this.assignedBookings },
          status: { $in: ['CONFIRMED', 'PAID', 'COMPLETED'] }
        });
        
        return confirmedBookings.reduce((total, booking: IBooking) => {
          return total + (booking.price ? booking.price.total : 0);
        }, 0);
      }
      return this.fullTripPrice || 0;
    } catch (err) {
      console.error('Error calculating revenue:', err);
      return this.fullTripPrice || 0;
    }
  }
};

// Static method to find upcoming public trips
TripSchema.statics.findUpcomingPublicTrips = function () {
  return this.find({
    isPublic: true,
    isActive: true,
    status: { $in: ['BOOKABLE', 'CONFIRMED'] },
    startDate: { $gt: new Date() }
  }).sort('startDate');
};

// Static method to find trips by location
TripSchema.statics.findTripsByLocation = function (location: string) {
  return this.find({
    $or: [
      { startLocation: { $regex: location, $options: 'i' } },
      { endLocation: { $regex: location, $options: 'i' } },
      { 'stops.location': { $regex: location, $options: 'i' } }
    ],
    isPublic: true,
    isActive: true,
    status: { $in: ['BOOKABLE', 'CONFIRMED'] },
    startDate: { $gt: new Date() }
  }).sort('startDate');
};

export default (mongoose.models.Trip as ITripModel) || mongoose.model<ITrip, ITripModel>('Trip', TripSchema);