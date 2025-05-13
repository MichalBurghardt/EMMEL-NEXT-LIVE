import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRole } from '@/types/auth.types';

// User document interface
export interface IUser extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  lastLogin?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  tokenVersion?: number; // Dodana właściwość tokenVersion dla mechanizmu odświeżania tokenów
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  fullName: string;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generatePasswordResetToken(): Promise<string>;
  incrementLoginAttempts(): Promise<void>;
}

// Static methods interface
interface IUserModel extends mongoose.Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findByResetToken(token: string): Promise<IUser | null>;
}

// User schema
const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide your first name'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Please provide your last name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters long']
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'dispatcher', 'driver', 'individual_customer', 'business_customer'],
      default: 'individual_customer'
    },
    phone: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date
    },
    tokenVersion: {
      type: Number,
      default: 0  // Dodane pole tokenVersion z wartością domyślną 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for full name
UserSchema.virtual('fullName').get(function(this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

// Password hashing middleware
UserSchema.pre('save', async function(this: IUser, next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password along with the new salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(
  this: IUser,
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Generate JWT token
UserSchema.methods.generateAuthToken = function(this: IUser): string {
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(
    {
      userId: this._id,
      email: this.email,
      role: this.role
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// Generate password reset token
UserSchema.methods.generatePasswordResetToken = async function(this: IUser): Promise<string> {
  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token and set to passwordResetToken field
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  // Set expire time to 1 hour
  this.passwordResetExpires = new Date(Date.now() + 3600000);
  
  await this.save();
  
  return resetToken;
};

// Increment login attempts
UserSchema.methods.incrementLoginAttempts = async function(this: IUser): Promise<void> {
  // If lock has expired, reset login attempts and remove lock
  if (this.lockUntil && this.lockUntil < new Date()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    // Otherwise increment login attempts
    this.loginAttempts = this.loginAttempts + 1;
    
    // Lock the account if reached max attempts
    if (this.loginAttempts >= 5) {
      // Lock for 15 minutes
      this.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
  }
  
  await this.save();
};

// Find by email static method
UserSchema.statics.findByEmail = async function(email: string): Promise<IUser | null> {
  return this.findOne({ email });
};

// Find by reset token static method
UserSchema.statics.findByResetToken = async function(token: string): Promise<IUser | null> {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  return this.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
};

// Create the model
const UserModel = (mongoose.models.User || mongoose.model<IUser, IUserModel>('User', UserSchema)) as IUserModel & mongoose.Model<IUser>;

export default UserModel;