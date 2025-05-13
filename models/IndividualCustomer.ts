import mongoose from 'mongoose';
import { IBooking } from './Booking';

// Interface for top customer data returned by findTopCustomers
interface TopCustomerData {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  fullName?: string;
  totalSpent: number;
  bookingsCount: number;
  [key: string]: unknown; // For other properties from customerData.toObject()
}

// Address interface
export interface IAddress {
  street: string;
  houseNumber?: string;
  city: string;
  postalCode: string;
  country: string;
}

// IndividualCustomer interface with virtuals
export interface IndividualCustomer extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: IAddress;
  dateOfBirth?: Date;
  identificationNumber?: string;
  preferredTourTypes?: Array<'CITY' | 'BEACH' | 'ADVENTURE' | 'CULTURE' | 'NATURE' | 'SKI'>;
  hasSpecialNeeds: boolean;
  specialNeedsDetails?: string;
  passportNumber?: string;
  passportExpiryDate?: Date;
  notes?: string;
  paymentTerms: 'PREPAID' | 'NET_7' | 'NET_14' | 'NET_30' | 'NET_60';
  discount: number;
  creditLimit: number;
  customerSince: Date;
  isActive: boolean;
  userId?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  fullName: string;
  bookingsCount?: number;
  lastBooking?: IBooking;
  
  // Methods
  isAdult(): boolean;
  hasValidPassport(): boolean;
  calculateTotalSpent(): Promise<number>;
  hasUnpaidBookings(): Promise<boolean>;
}

// Static methods interface
interface IIndividualCustomerModel extends mongoose.Model<IndividualCustomer> {
  findTopCustomers(limit?: number): Promise<TopCustomerData[]>;
}

// Address schema
const AddressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: [true, 'Straße ist erforderlich'],
    trim: true
  },
  houseNumber: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: [true, 'Stadt ist erforderlich'],
    trim: true
  },
  postalCode: {
    type: String,
    required: [true, 'Postleitzahl ist erforderlich'],
    trim: true
  },
  country: {
    type: String,
    default: 'Deutschland',
    trim: true
  }
});

// IndividualCustomer schema
const IndividualCustomerSchema = new mongoose.Schema(
  {
    // Basic personal data
    firstName: {
      type: String,
      required: [true, 'Vorname ist erforderlich'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Nachname ist erforderlich'],
      trim: true
    },
    email: {
      type: String,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Bitte geben Sie eine gültige E-Mail-Adresse ein'],
      trim: true,
      lowercase: true,
      required: [true, 'E-Mail ist erforderlich']
    },
    phone: {
      type: String,
      trim: true
    },
    address: AddressSchema,

    // Additional individual customer data
    dateOfBirth: {
      type: Date
    },
    identificationNumber: {
      type: String,
      trim: true
    },
    preferredTourTypes: [
      {
        type: String,
        enum: ['CITY', 'BEACH', 'ADVENTURE', 'CULTURE', 'NATURE', 'SKI']
      }
    ],
    hasSpecialNeeds: {
      type: Boolean,
      default: false
    },
    specialNeedsDetails: {
      type: String
    },
    passportNumber: {
      type: String
    },
    passportExpiryDate: {
      type: Date
    },

    // Accounting data
    notes: {
      type: String
    },
    paymentTerms: {
      type: String,
      enum: ['PREPAID', 'NET_7', 'NET_14', 'NET_30', 'NET_60'],
      default: 'PREPAID'
    },
    discount: {
      type: Number,
      min: [0, 'Rabatt muss positiv sein'],
      max: [100, 'Rabatt kann nicht mehr als 100% sein'],
      default: 0
    },
    creditLimit: {
      type: Number,
      min: [0, 'Kreditlimit muss positiv sein'],
      default: 0
    },

    // System fields
    customerSince: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for full name
IndividualCustomerSchema.virtual('fullName').get(function (this: IndividualCustomer) {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual field for bookings count
IndividualCustomerSchema.virtual('bookingsCount', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'customer',
  count: true
});

// Virtual field for last booking
IndividualCustomerSchema.virtual('lastBooking', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'customer',
  justOne: true,
  options: { sort: { createdAt: -1 } }
});

// Method to check if customer is an adult
IndividualCustomerSchema.methods.isAdult = function (this: IndividualCustomer) {
  if (!this.dateOfBirth) return true; // Assume adult if no birth date is provided

  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 18;
};

// Method to check if customer's passport is valid
IndividualCustomerSchema.methods.hasValidPassport = function (this: IndividualCustomer) {
  if (!this.passportExpiryDate) return false;

  const today = new Date();
  return this.passportExpiryDate > today;
};

// Method to calculate total value of all customer's bookings
IndividualCustomerSchema.methods.calculateTotalSpent = async function (this: IndividualCustomer) {
  try {
    const Booking = mongoose.models.Booking;

    if (Booking) {
      const bookings = await Booking.find({
        customer: this._id,
        status: { $in: ['CONFIRMED', 'PAID', 'COMPLETED'] }
      });

      return bookings.reduce((total, booking: IBooking) => {
        if (booking.price && booking.price.total) {
          return total + booking.price.total;
        }
        return total;
      }, 0);
    }
    return 0;
  } catch (err) {
    console.error('Error calculating total spent:', err);
    return 0;
  }
};

// Method to check if customer has unpaid bookings
IndividualCustomerSchema.methods.hasUnpaidBookings = async function (this: IndividualCustomer) {
  try {
    const Booking = mongoose.models.Booking;

    if (Booking) {
      const unpaidBookings = await Booking.find({
        customer: this._id,
        status: { $in: ['CONFIRMED'] }
      });

      return unpaidBookings.length > 0;
    }
    return false;
  } catch (err) {
    console.error('Error checking unpaid bookings:', err);
    return false;
  }
};

// Static method to find customers by booking value
IndividualCustomerSchema.statics.findTopCustomers = async function(limit = 10): Promise<TopCustomerData[]> {
  try {
    const Booking = mongoose.models.Booking;

    if (Booking) {
      // Aggregate to calculate sum of bookings for each customer
      const topCustomers = await Booking.aggregate([
        { $match: { status: { $in: ['CONFIRMED', 'PAID', 'COMPLETED'] } } },
        {
          $group: {
            _id: '$customer',
            totalSpent: { $sum: '$price.total' },
            bookingsCount: { $sum: 1 }
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: limit }
      ]);

      // Get full customer data
      const customerIds = topCustomers.map((c) => c._id);
      const customers = await this.find({ _id: { $in: customerIds } });

      // Combine aggregation data with full customer data
      return topCustomers.map((topCustomer) => {
        const customerData = customers.find((c: IndividualCustomer) => {
          // Safely access _id with type checking
          return c && '_id' in c && c._id && c._id.toString() === topCustomer._id.toString();
        });
        if (!customerData) return topCustomer as unknown as TopCustomerData;
        
        return {
          ...customerData.toObject(),
          totalSpent: topCustomer.totalSpent,
          bookingsCount: topCustomer.bookingsCount
        } as TopCustomerData;
      });
    }
    return [];
  } catch (err) {
    console.error('Error finding top customers:', err);
    return [];
  }
};

export default (mongoose.models.IndividualCustomer as IIndividualCustomerModel) ||
  mongoose.model<IndividualCustomer, IIndividualCustomerModel>('IndividualCustomer', IndividualCustomerSchema);