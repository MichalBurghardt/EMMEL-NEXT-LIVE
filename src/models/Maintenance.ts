import mongoose from 'mongoose';

// Maintenance interface
export interface IMaintenance extends mongoose.Document {
  vehicle: string;
  description: string;
  date: Date;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

// Maintenance schema
const MaintenanceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: String,
      required: [true, 'Vehicle is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Maintenance || mongoose.model<IMaintenance>('Maintenance', MaintenanceSchema);