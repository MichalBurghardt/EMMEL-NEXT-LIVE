import mongoose from 'mongoose';

// Maintenance schema interface
export interface IMaintenance {
  _id: string;
  type: 'HU' | 'SP';
  date: Date;
  dueDate: Date;
  completed: boolean;
  notes?: string;
  documents?: {
    name: string;
    path: string;
    uploadDate: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Bus image interface
export interface IBusImage {
  name: string;
  path: string;
  isMain: boolean;
  uploadDate: Date;
}

// Bus type interface with virtuals
export interface IBus extends Omit<mongoose.Document, 'model'> {
  _id: string;
  name: string;
  licensePlate: string;
  model: string;
  manufacturer: string;
  year: number;
  seats: number;
  busType: 'SMALL' | 'MEDIUM' | 'LARGE';
  features: Array<'WIFI' | 'TOILET' | 'AIR_CONDITIONING' | 'TV' | 'COFFEE_MACHINE' | 'WHEELCHAIR_ACCESS' | 'USB_PORTS' | 'RECLINING_SEATS' | 'TABLE'>;
  status: 'available' | 'driving' | 'maintenance' | 'repair' | 'outOfService';
  maintenanceSchedule: IMaintenance[];
  lastHUDate?: Date;
  nextHUDate: Date;
  lastSPDate?: Date;
  nextSPDate: Date;
  mileage: number;
  fuelType: 'DIESEL' | 'PETROL' | 'ELECTRIC' | 'HYBRID' | 'GAS';
  fuelConsumption: number;
  images: IBusImage[];
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  isHUDueSoon: boolean;
  isSPDueSoon: boolean;
}

// Static methods interface
interface IBusModel extends mongoose.Model<IBus> {
  findDueForMaintenance(days?: number): Promise<IBus[]>;
}

const MaintenanceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['HU', 'SP'], // HU (Hauptuntersuchung), SP (Sicherheitsprüfung)
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String
    },
    documents: [
      {
        name: String,
        path: String,
        uploadDate: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

// Main bus schema
const BusSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Bitte geben Sie einen Namen für den Bus ein'],
      trim: true
    },
    licensePlate: {
      type: String,
      required: [true, 'Kennzeichen ist erforderlich'],
      unique: true,
      trim: true
    },
    model: {
      type: String,
      required: [true, 'Modell ist erforderlich'],
      trim: true
    },
    manufacturer: {
      type: String,
      required: [true, 'Hersteller ist erforderlich'],
      trim: true
    },
    year: {
      type: Number,
      required: [true, 'Baujahr ist erforderlich']
    },
    seats: {
      type: Number,
      required: [true, 'Anzahl der Sitzplätze ist erforderlich'],
      min: [1, 'Ein Bus muss mindestens einen Sitzplatz haben']
    },
    busType: {
      type: String,
      enum: ['SMALL', 'MEDIUM', 'LARGE'],
      required: [true, 'Bustyp ist erforderlich']
    },
    features: [
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
    status: {
      type: String,
      enum: ['available', 'driving', 'maintenance', 'repair', 'outOfService'],
      default: 'available'
    },
    maintenanceSchedule: [MaintenanceSchema],
    lastHUDate: {
      type: Date
    },
    nextHUDate: {
      type: Date,
      required: [true, 'Nächster HU-Termin ist erforderlich']
    },
    lastSPDate: {
      type: Date
    },
    nextSPDate: {
      type: Date,
      required: [true, 'Nächster SP-Termin ist erforderlich']
    },
    mileage: {
      type: Number,
      default: 0
    },
    fuelType: {
      type: String,
      enum: ['DIESEL', 'PETROL', 'ELECTRIC', 'HYBRID', 'GAS'],
      default: 'DIESEL'
    },
    fuelConsumption: {
      type: Number, // l/100km
      default: 0
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
    notes: {
      type: String
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

// Virtual field to check if HU is due soon
BusSchema.virtual('isHUDueSoon').get(function (this: IBus) {
  if (!this.nextHUDate) return false;

  const now = new Date();
  const dueDate = new Date(this.nextHUDate);
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays <= 30; // Alert 30 days before due date
});

// Virtual field to check if SP is due soon
BusSchema.virtual('isSPDueSoon').get(function (this: IBus) {
  if (!this.nextSPDate) return false;

  const now = new Date();
  const dueDate = new Date(this.nextSPDate);
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays <= 14; // Alert 14 days before due date
});

// Static method to find buses due for maintenance
BusSchema.statics.findDueForMaintenance = function (days = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  return this.find({
    $or: [
      { nextHUDate: { $gte: today, $lte: futureDate } },
      { nextSPDate: { $gte: today, $lte: futureDate } }
    ],
    isActive: true
  });
};

// Pre-save hook to update next maintenance dates when adding a new maintenance record
BusSchema.pre('save', function (this: IBus, next) {
  if (this.isModified('maintenanceSchedule')) {
    // Find the latest completed HU
    const lastHU = [...this.maintenanceSchedule]
      .filter((m) => m.type === 'HU' && m.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    // Find the latest completed SP
    const lastSP = [...this.maintenanceSchedule]
      .filter((m) => m.type === 'SP' && m.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    // Update dates
    if (lastHU) {
      this.lastHUDate = lastHU.date;
      // Next HU in one year
      const nextHU = new Date(lastHU.date);
      nextHU.setFullYear(nextHU.getFullYear() + 1);
      this.nextHUDate = nextHU;
    }

    if (lastSP) {
      this.lastSPDate = lastSP.date;
      // Next SP in three months
      const nextSP = new Date(lastSP.date);
      nextSP.setMonth(nextSP.getMonth() + 3);
      this.nextSPDate = nextSP;
    }
  }
  next();
});

// Use existing model or create new one to support hot reloading in Next.js development
let BusModel: IBusModel;

if (mongoose.models.Bus) {
  BusModel = mongoose.models.Bus as unknown as IBusModel;
} else {
  BusModel = mongoose.model<IBus, IBusModel>('Bus', BusSchema);
}

export default BusModel;