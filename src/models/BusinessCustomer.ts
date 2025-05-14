import mongoose from 'mongoose';
import { IAddress } from './IndividualCustomer';
import { IBooking } from './Booking';

// Interface for top customer data returned by findTopCustomers
interface TopBusinessCustomerData {
  _id: mongoose.Types.ObjectId;
  companyName: string;
  email: string;
  totalSpent: number;
  bookingsCount: number;
  [key: string]: unknown; // Use unknown instead of any for index signature
}

// Contact person interface
export interface IContactPerson {
  _id: string;
  firstName: string;
  lastName: string;
  position?: string;
  phone?: string;
  email?: string;
  isPrimary: boolean;
}

// Bank account details interface
export interface IBankAccountDetails {
  accountHolder?: string;
  bankName?: string;
  iban?: string;
  bic?: string;
}

// BusinessCustomer interface with virtuals
export interface IBusinessCustomer extends mongoose.Document {
  companyName: string;
  vatNumber?: string;
  organizationType: 'COMPANY' | 'SCHOOL' | 'GOVERNMENT' | 'NON_PROFIT' | 'ASSOCIATION' | 'OTHER';
  industry?: string;
  email: string;
  phone?: string;
  address: IAddress;
  contactPersons: IContactPerson[];
  billingAddress?: IAddress;
  usesBillingAddress: boolean;
  paymentMethod: 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DIRECT_DEBIT' | 'INVOICE';
  bankAccountDetails?: IBankAccountDetails;
  paymentTerms: 'PREPAID' | 'NET_7' | 'NET_14' | 'NET_30' | 'NET_60';
  discount: number;
  creditLimit: number;
  notes?: string;
  customerSince: Date;
  isActive: boolean;
  userId?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  displayName: string;
  bookingsCount?: number;
  lastBooking?: IBooking;
  
  // Methods
  getPrimaryContact(): IContactPerson | null;
  hasDifferentBillingAddress(): boolean;
  getEffectiveBillingAddress(): IAddress;
  calculateTotalSpent(): Promise<number>;
  hasUnpaidBookings(): Promise<boolean>;
}

// Static methods interface
interface IBusinessCustomerModel extends mongoose.Model<IBusinessCustomer> {
  findTopCustomers(limit?: number): Promise<TopBusinessCustomerData[]>;
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

// Contact person schema
const ContactPersonSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Bitte geben Sie eine gültige E-Mail-Adresse ein'],
    trim: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
});

// Business customer schema
const BusinessCustomerSchema = new mongoose.Schema(
  {
    // Company data
    companyName: {
      type: String,
      required: [true, 'Firmenname ist erforderlich'],
      trim: true
    },
    vatNumber: {
      type: String,
      trim: true
    },
    organizationType: {
      type: String,
      enum: ['COMPANY', 'SCHOOL', 'GOVERNMENT', 'NON_PROFIT', 'ASSOCIATION', 'OTHER'],
      default: 'COMPANY'
    },
    industry: {
      type: String,
      trim: true
    },

    // Contact data
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
    contactPersons: [ContactPersonSchema],

    // Billing address
    billingAddress: AddressSchema,
    usesBillingAddress: {
      type: Boolean,
      default: false
    },

    // Payment data
    paymentMethod: {
      type: String,
      enum: ['BANK_TRANSFER', 'CREDIT_CARD', 'DIRECT_DEBIT', 'INVOICE'],
      default: 'INVOICE'
    },
    bankAccountDetails: {
      accountHolder: {
        type: String,
        trim: true
      },
      bankName: {
        type: String,
        trim: true
      },
      iban: {
        type: String,
        trim: true
      },
      bic: {
        type: String,
        trim: true
      }
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

    // Additional info
    notes: {
      type: String
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

// Virtual field for customer display name
BusinessCustomerSchema.virtual('displayName').get(function (this: IBusinessCustomer) {
  return this.companyName;
});

// Virtual field for bookings count
BusinessCustomerSchema.virtual('bookingsCount', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'customer',
  count: true
});

// Virtual field for last booking
BusinessCustomerSchema.virtual('lastBooking', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'customer',
  justOne: true,
  options: { sort: { createdAt: -1 } }
});

// Method to find primary contact person
BusinessCustomerSchema.methods.getPrimaryContact = function (this: IBusinessCustomer) {
  if (!this.contactPersons || this.contactPersons.length === 0) {
    return null;
  }

  // Look for contact person marked as primary
  const primaryContact = this.contactPersons.find((contact) => contact.isPrimary);
  if (primaryContact) {
    return primaryContact;
  }

  // If no primary contact is marked, return the first one
  return this.contactPersons[0];
};

// Method to check if billing address differs from main address
BusinessCustomerSchema.methods.hasDifferentBillingAddress = function (this: IBusinessCustomer) {
  return this.usesBillingAddress && this.billingAddress;
};

// Method to get effective billing address (billingAddress or main address)
BusinessCustomerSchema.methods.getEffectiveBillingAddress = function (this: IBusinessCustomer) {
  if (this.usesBillingAddress && this.billingAddress) {
    return this.billingAddress;
  }
  return this.address;
};

// Method to calculate total value of all customer's bookings
BusinessCustomerSchema.methods.calculateTotalSpent = async function (this: IBusinessCustomer) {
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
BusinessCustomerSchema.methods.hasUnpaidBookings = async function (this: IBusinessCustomer) {
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

// Static method to find top customers by booking value
BusinessCustomerSchema.statics.findTopCustomers = async function (limit = 10): Promise<TopBusinessCustomerData[]> {
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
      const customerIds = topCustomers.map((c: { _id: mongoose.Types.ObjectId }) => c._id);
      const customers = await this.find({ _id: { $in: customerIds } });

      // Map aggregated data with full customer data
      const enrichedTopCustomers = topCustomers.map((topCustomer) => {
        const customerData = customers.find((c: IBusinessCustomer) => {
          // Ensure c._id exists and is properly typed before comparing
          return c && c._id && c._id.toString() === topCustomer._id.toString();
        });
        if (!customerData) return topCustomer as unknown as TopBusinessCustomerData;
        
        return {
          ...customerData.toObject(),
          totalSpent: topCustomer.totalSpent,
          bookingsCount: topCustomer.bookingsCount
        } as TopBusinessCustomerData;
      });

      return enrichedTopCustomers;
    }
    return [];
  } catch (err) {
    console.error('Error finding top customers:', err);
    return [];
  }
};

export default (mongoose.models.BusinessCustomer as IBusinessCustomerModel) ||
  mongoose.model<IBusinessCustomer, IBusinessCustomerModel>('BusinessCustomer', BusinessCustomerSchema);