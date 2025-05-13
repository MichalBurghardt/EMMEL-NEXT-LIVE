import mongoose from 'mongoose';

// Work time interfaces
export interface IWorkTimeEntry {
  start: string;
  end: string;
}

export interface IShiftTimeEntry {
  start: string;
  end: string;
  startLocation: string;
  endLocation: string;
  startCountry: 'D' | 'PL' | 'A' | 'CH' | 'I' | 'F' | 'B' | 'NL' | 'CZ';
  endCountry: 'D' | 'PL' | 'A' | 'CH' | 'I' | 'F' | 'B' | 'NL' | 'CZ';
}

export interface IWorkTime {
  _id: string;
  date: Date;
  schichtzeit: IShiftTimeEntry[];
  fahrzeit: IWorkTimeEntry[];
  arbeitszeit: IWorkTimeEntry[];
  bereitschaft: IWorkTimeEntry[];
  pause: IWorkTimeEntry[];
  totalDrivingTime: number;
  totalWorkTime: number;
  totalStandbyTime: number;
  totalBreakTime: number;
  spesen: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Driver document interface
export interface IDriverDocument {
  _id: string;
  type: 'LICENSE' | 'CERTIFICATION' | 'MEDICAL' | 'OTHER';
  name: string;
  number?: string;
  issueDate: Date;
  expiryDate: Date;
  issuingAuthority?: string;
  documentFile?: {
    name: string;
    path: string;
    uploadDate: Date;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Driver interface with virtuals
export interface IDriver extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  licenseTypes: Array<'B' | 'C' | 'CE' | 'D' | 'DE'>;
  documents: IDriverDocument[];
  workHistory: IWorkTime[];
  status: 'available' | 'driving' | 'vacation' | 'sick' | 'training' | 'inactive';
  experience: number;
  languages: Array<'DE' | 'EN' | 'FR' | 'PL' | 'IT' | 'ES' | 'TR' | 'RU' | 'OTHER'>;
  profileImage?: {
    name: string;
    path: string;
    uploadDate: Date;
  };
  notes?: string;
  isActive: boolean;
  drivingTimeThisWeek: number;
  drivingTimeThisMonth: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  fullName: string;
  hasExpiringDocuments: boolean;
  
  // Methods
  isAvailableOn(date: Date): boolean;
  calculateRemainingDrivingTime(): { daily: number; weekly: number };
  getDailyDrivingTime(date: Date): number;
}

// Static methods interface
interface IDriverModel extends mongoose.Model<IDriver> {
  findWithExpiringDocuments(days?: number): Promise<IDriver[]>;
}

// Worktime schema
const WorkTimeSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true
    },
    schichtzeit: [
      {
        start: {
          type: String,
          required: true
        },
        end: {
          type: String,
          required: true
        },
        startLocation: {
          type: String,
          default: 'Alzenau'
        },
        endLocation: {
          type: String,
          default: 'Alzenau'
        },
        startCountry: {
          type: String,
          default: 'D',
          enum: ['D', 'PL', 'A', 'CH', 'I', 'F', 'B', 'NL', 'CZ']
        },
        endCountry: {
          type: String,
          default: 'D',
          enum: ['D', 'PL', 'A', 'CH', 'I', 'F', 'B', 'NL', 'CZ']
        }
      }
    ],
    fahrzeit: [
      {
        start: {
          type: String,
          required: true
        },
        end: {
          type: String,
          required: true
        }
      }
    ],
    arbeitszeit: [
      {
        start: {
          type: String,
          required: true
        },
        end: {
          type: String,
          required: true
        }
      }
    ],
    bereitschaft: [
      {
        start: {
          type: String,
          required: true
        },
        end: {
          type: String,
          required: true
        }
      }
    ],
    pause: [
      {
        start: {
          type: String,
          required: true
        },
        end: {
          type: String,
          required: true
        }
      }
    ],
    totalDrivingTime: {
      type: Number, // in minutes
      default: 0
    },
    totalWorkTime: {
      type: Number, // in minutes
      default: 0
    },
    totalStandbyTime: {
      type: Number, // in minutes
      default: 0
    },
    totalBreakTime: {
      type: Number, // in minutes
      default: 0
    },
    spesen: {
      type: Number, // daily allowance amount
      default: 0
    },
    notes: {
      type: String
    }
  },
  { timestamps: true }
);

// Driver document schema
const DriverDocumentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['LICENSE', 'CERTIFICATION', 'MEDICAL', 'OTHER'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    number: {
      type: String
    },
    issueDate: {
      type: Date,
      required: true
    },
    expiryDate: {
      type: Date,
      required: true
    },
    issuingAuthority: {
      type: String
    },
    documentFile: {
      name: String,
      path: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    },
    notes: {
      type: String
    }
  },
  { timestamps: true }
);

// Main driver schema
const DriverSchema = new mongoose.Schema(
  {
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
      required: [true, 'E-Mail ist erforderlich'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Bitte geben Sie eine gültige E-Mail-Adresse ein']
    },
    phone: {
      type: String,
      required: [true, 'Telefonnummer ist erforderlich'],
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Geburtsdatum ist erforderlich']
    },
    address: {
      street: {
        type: String,
        required: [true, 'Straße ist erforderlich']
      },
      city: {
        type: String,
        required: [true, 'Stadt ist erforderlich']
      },
      postalCode: {
        type: String,
        required: [true, 'Postleitzahl ist erforderlich']
      },
      country: {
        type: String,
        required: [true, 'Land ist erforderlich'],
        default: 'Deutschland'
      }
    },
    licenseTypes: [
      {
        type: String,
        enum: ['B', 'C', 'CE', 'D', 'DE'],
        required: [true, 'Mindestens ein Führerscheintyp ist erforderlich']
      }
    ],
    documents: [DriverDocumentSchema],
    workHistory: [WorkTimeSchema],
    status: {
      type: String,
      enum: ['available', 'driving', 'vacation', 'sick', 'training', 'inactive'],
      default: 'available'
    },
    experience: {
      type: Number, // in years
      default: 0
    },
    languages: [
      {
        type: String,
        enum: ['DE', 'EN', 'FR', 'PL', 'IT', 'ES', 'TR', 'RU', 'OTHER']
      }
    ],
    profileImage: {
      name: String,
      path: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    },
    notes: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    drivingTimeThisWeek: {
      type: Number, // in minutes
      default: 0
    },
    drivingTimeThisMonth: {
      type: Number, // in minutes
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for full name
DriverSchema.virtual('fullName').get(function (this: IDriver) {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual field to check if any document is expiring soon
DriverSchema.virtual('hasExpiringDocuments').get(function (this: IDriver) {
  if (!this.documents || this.documents.length === 0) return false;

  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + 30); // 30 days in the future

  return this.documents.some((doc) => {
    const expiryDate = new Date(doc.expiryDate);
    return expiryDate >= now && expiryDate <= futureDate;
  });
});

// Static method to find drivers with documents expiring soon
DriverSchema.statics.findWithExpiringDocuments = function (days = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  return this.find({
    documents: {
      $elemMatch: {
        expiryDate: { $gte: today, $lte: futureDate }
      }
    },
    isActive: true
  });
};

// Method to check if driver is available on a specific date
DriverSchema.methods.isAvailableOn = function (this: IDriver, date: Date) {
  if (this.status !== 'available') return false;

  // Check if driver has work scheduled on this date
  const dateStr = date.toISOString().split('T')[0];
  const hasWorkOnDate = this.workHistory.some((wh) => {
    const whDateStr = new Date(wh.date).toISOString().split('T')[0];
    return whDateStr === dateStr;
  });

  return !hasWorkOnDate;
};

// Method to calculate allowed remaining driving time
DriverSchema.methods.calculateRemainingDrivingTime = function (this: IDriver) {
  // According to EU regulations, a driver can drive maximum:
  // - 9 hours daily (with possibility to extend to 10h twice a week)
  // - 56 hours weekly
  // - 90 hours in a two-week period

  const drivingTimeToday = this.getDailyDrivingTime(new Date());
  const drivingTimeThisWeek = this.drivingTimeThisWeek || 0;

  return {
    daily: Math.max(0, 9 * 60 - drivingTimeToday), // in minutes
    weekly: Math.max(0, 56 * 60 - drivingTimeThisWeek) // in minutes
  };
};

// Method to calculate driving time on a specific date
DriverSchema.methods.getDailyDrivingTime = function (this: IDriver, date: Date) {
  const dateStr = date.toISOString().split('T')[0];

  const workRecord = this.workHistory.find((wh) => {
    const whDateStr = new Date(wh.date).toISOString().split('T')[0];
    return whDateStr === dateStr;
  });

  if (!workRecord) return 0;

  return workRecord.totalDrivingTime || 0; // in minutes
};

export default (mongoose.models.Driver as IDriverModel) || mongoose.model<IDriver, IDriverModel>('Driver', DriverSchema);