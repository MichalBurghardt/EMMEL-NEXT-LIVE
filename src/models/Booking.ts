import mongoose from 'mongoose';

// Passenger interface
export interface IPassenger {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  seatNumber?: number;
  specialRequirements?: string;
  ticketIssued: boolean;
  ticketData?: {
    qrCode: string;
    ticketNumber: string;
    issueDate: Date;
    ticketPath: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Route stop interface
export interface IRouteStop {
  location: string;
  arrivalTime?: Date;
  departureTime?: Date;
  duration: number;
  note?: string;
}

// Route interface
export interface IRoute {
  startLocation: string;
  endLocation: string;
  distance: number;
  estimatedDuration: number;
  stops: IRouteStop[];
  routeType: 'FASTEST' | 'SHORTEST' | 'ECONOMIC' | 'SCENIC';
  polyline?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Payment interface
export interface IPayment {
  _id: string;
  amount: number;
  currency: string;
  method: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'PAYPAL' | 'INVOICE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  date: Date;
  transactionId?: string;
  invoiceNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// File interface
export interface IBookingFile {
  name: string;
  path: string;
  type: 'CONTRACT' | 'INVOICE' | 'OTHER';
  uploadDate: Date;
}

// Booking interface with virtuals
export interface IBooking extends mongoose.Document {
  bookingNumber: string;
  customerType: 'IndividualCustomer' | 'BusinessCustomer';
  customer: mongoose.Types.ObjectId;
  bookingType: 'FULL_BUS' | 'INDIVIDUAL_SEATS' | 'TOUR';
  startDate: Date;
  endDate: Date;
  bus: mongoose.Types.ObjectId;
  driver: mongoose.Types.ObjectId;
  secondDriver?: mongoose.Types.ObjectId;
  route: IRoute;
  passengers: IPassenger[];
  price: {
    base: number;
    additionalServices: {
      name: string;
      price: number;
    }[];
    discount: number;
    total: number;
  };
  deposit?: {
    amount: number;
    paid: boolean;
    dueDate: Date;
  };
  payments: IPayment[];
  status: 'INQUIRY' | 'PENDING' | 'CONFIRMED' | 'PAID' | 'COMPLETED' | 'CANCELLED';
  confirmationDate?: Date;
  cancellationReason?: string;
  notes?: string;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  files: IBookingFile[];
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  passengerCount: number;
  isCurrent: boolean;
  paidAmount: number;
  remainingAmount: number;
  
  // Methods
  generateTickets(): Promise<string>;
}

// Static methods interface
interface IBookingModel extends mongoose.Model<IBooking> {
  findInDateRange(startDate: Date, endDate: Date): Promise<IBooking[]>;
  checkBusAvailability(busId: mongoose.Types.ObjectId, startDate: Date, endDate: Date): Promise<boolean>;
}

// Passenger schema
const PassengerSchema = new mongoose.Schema(
  {
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
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    seatNumber: {
      type: Number
    },
    specialRequirements: {
      type: String
    },
    ticketIssued: {
      type: Boolean,
      default: false
    },
    ticketData: {
      qrCode: String,
      ticketNumber: String,
      issueDate: Date,
      ticketPath: String
    }
  },
  { timestamps: true }
);

// Route schema
const RouteSchema = new mongoose.Schema(
  {
    startLocation: {
      type: String,
      required: true,
      trim: true
    },
    endLocation: {
      type: String,
      required: true,
      trim: true
    },
    distance: {
      type: Number, // in kilometers
      required: true
    },
    estimatedDuration: {
      type: Number, // in minutes
      required: true
    },
    stops: [
      {
        location: {
          type: String,
          required: true
        },
        arrivalTime: {
          type: Date
        },
        departureTime: {
          type: Date
        },
        duration: {
          type: Number, // stopover time in minutes
          default: 15
        },
        note: String
      }
    ],
    routeType: {
      type: String,
      enum: ['FASTEST', 'SHORTEST', 'ECONOMIC', 'SCENIC'],
      default: 'FASTEST'
    },
    polyline: {
      type: String // encoded route line for maps
    }
  },
  { timestamps: true }
);

// Payment schema
const PaymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'EUR'
    },
    method: {
      type: String,
      enum: ['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'PAYPAL', 'INVOICE'],
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
      default: 'PENDING'
    },
    date: {
      type: Date,
      default: Date.now
    },
    transactionId: {
      type: String
    },
    invoiceNumber: {
      type: String
    },
    notes: {
      type: String
    }
  },
  { timestamps: true }
);

// Main booking schema
const BookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true
    },
    customerType: {
      type: String,
      enum: ['IndividualCustomer', 'BusinessCustomer'],
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'customerType', // Dynamic reference based on customerType
      required: true
    },
    bookingType: {
      type: String,
      enum: ['FULL_BUS', 'INDIVIDUAL_SEATS', 'TOUR'],
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: true
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true
    },
    secondDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver'
    },
    route: RouteSchema,
    passengers: [PassengerSchema],
    price: {
      base: {
        type: Number,
        required: true
      },
      additionalServices: [
        {
          name: String,
          price: Number
        }
      ],
      discount: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        required: true
      }
    },
    deposit: {
      amount: {
        type: Number
      },
      paid: {
        type: Boolean,
        default: false
      },
      dueDate: {
        type: Date
      }
    },
    payments: [PaymentSchema],
    status: {
      type: String,
      enum: ['INQUIRY', 'PENDING', 'CONFIRMED', 'PAID', 'COMPLETED', 'CANCELLED'],
      default: 'INQUIRY'
    },
    confirmationDate: {
      type: Date
    },
    cancellationReason: {
      type: String
    },
    notes: {
      type: String
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    files: [
      {
        name: String,
        path: String,
        type: {
          type: String,
          enum: ['CONTRACT', 'INVOICE', 'OTHER']
        },
        uploadDate: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for total passenger count
BookingSchema.virtual('passengerCount').get(function (this: IBooking) {
  return this.passengers ? this.passengers.length : 0;
});

// Virtual field to check if booking is current (not in the past)
BookingSchema.virtual('isCurrent').get(function (this: IBooking) {
  return this.endDate >= new Date();
});

// Virtual field for total payments
BookingSchema.virtual('paidAmount').get(function (this: IBooking) {
  if (!this.payments || this.payments.length === 0) return 0;

  return this.payments
    .filter((payment) => payment.status === 'COMPLETED')
    .reduce((sum, payment) => sum + payment.amount, 0);
});

// Virtual field for remaining amount to pay
BookingSchema.virtual('remainingAmount').get(function (this: IBooking) {
  return this.price.total - this.paidAmount;
});

// Middleware to generate booking number
BookingSchema.pre('save', async function (this: IBooking, next) {
  if (!this.isNew) return next();

  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  // Find the latest booking from this month
  const latestBooking = await (this.constructor as IBookingModel).findOne({
    bookingNumber: new RegExp(`^ER-${year}${month}-`)
  }).sort({ bookingNumber: -1 });

  let sequenceNumber = 1;

  if (latestBooking) {
    // Extract sequence number from the latest booking
    const lastSequence = latestBooking.bookingNumber.split('-')[2];
    sequenceNumber = parseInt(lastSequence) + 1;
  }

  // Create new booking number in format ER-YYMM-SEQUENCE
  this.bookingNumber = `ER-${year}${month}-${sequenceNumber.toString().padStart(4, '0')}`;

  next();
});

// Method to generate tickets for all passengers
BookingSchema.methods.generateTickets = async function (this: IBooking) {
  // This implementation will be completed in ticketService
  // Requires integration with PDF generator and QR code generator
  return 'Tickets generation scheduled';
};

// Static method to find bookings in date range
BookingSchema.statics.findInDateRange = function (startDate: Date, endDate: Date) {
  return this.find({
    $or: [
      // Booking starts within selected period
      {
        startDate: { $gte: startDate, $lte: endDate }
      },
      // Booking ends within selected period
      {
        endDate: { $gte: startDate, $lte: endDate }
      },
      // Booking starts before selected period and ends after it
      {
        startDate: { $lte: startDate },
        endDate: { $gte: endDate }
      }
    ]
  }).populate('customer bus driver');
};

// Static method to check bus availability
BookingSchema.statics.checkBusAvailability = async function (busId: mongoose.Types.ObjectId, startDate: Date, endDate: Date) {
  const conflictingBookings = await this.find({
    bus: busId,
    $or: [
      // Booking starts within selected period
      {
        startDate: { $gte: startDate, $lte: endDate }
      },
      // Booking ends within selected period
      {
        endDate: { $gte: startDate, $lte: endDate }
      },
      // Booking starts before selected period and ends after it
      {
        startDate: { $lte: startDate },
        endDate: { $gte: endDate }
      }
    ],
    status: { $nin: ['CANCELLED'] }
  });

  return conflictingBookings.length === 0;
};

export default (mongoose.models.Booking as IBookingModel) || mongoose.model<IBooking, IBookingModel>('Booking', BookingSchema);