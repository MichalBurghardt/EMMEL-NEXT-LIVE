// AddUser.ts - Script to add an admin user to the database
import { connectToDatabase, disconnectFromDatabase } from '@/src/utils/db';
import User from '@/src/models/User';
import readline from 'readline';
import { exit } from 'process';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Define error types
interface MongoDBError extends Error {
  code?: number;
  name: string;
}

interface ValidationError extends Error {
  name: string;
  errors: Record<string, { message: string }>;
}

// Prompt function that returns a promise
const prompt = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Main function to add a user
const addUser = async (): Promise<void> => {
  try {
    // Connect to the database
    await connectToDatabase();
    
    console.log('\n--- Create Admin User ---\n');
    
    // Get user information
    const firstName = await prompt('First Name: ');
    const lastName = await prompt('Last Name: ');
    const email = await prompt('Email: ');
    
    // Generate a password or allow user to input one
    let password = '';
    const useGeneratedPassword = (await prompt('Generate password? (y/n): ')).toLowerCase() === 'y';
    
    if (useGeneratedPassword) {
      password = generatePassword();
      console.log(`Generated password: ${password}`);
    } else {
      password = await prompt('Password (min 8 chars, include uppercase, lowercase, number): ');
      
      // Very basic password validation
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
    }
    
    // Confirm creation
    console.log('\nCreating new admin user with the following details:');
    console.log(`Name: ${firstName} ${lastName}`);
    console.log(`Email: ${email}`);
    
    const confirmCreate = (await prompt('\nConfirm creation? (y/n): ')).toLowerCase();
    if (confirmCreate !== 'y') {
      console.log('User creation cancelled.');
      rl.close();
      await disconnectFromDatabase();
      return;
    }
    
    // Prepare user data
    const newUser = {
      firstName,
      lastName,
      email,
      password,
      role: 'admin',
      isActive: true
    };
    
    console.log('Creating new admin user...');
    
    // Create the user
    const user = await User.create(newUser);
    
    console.log(`
    ✅ Admin user created successfully!
    
    User details:
    - Email: ${user.email}
    - Role: ${user.role}
    - Name: ${user.firstName} ${user.lastName}
    
    You can now log in with these credentials.
    `);
    
    // Disconnect from the database
    await disconnectFromDatabase();
    process.exit(0);
    
  } catch (error: unknown) {
    console.error('Error creating user:', error instanceof Error ? error.message : String(error));
    
    // Handle specific types of errors
    if (typeof error === 'object' && error !== null) {
      // MongoDB duplicate key error
      if ('code' in error && (error as MongoDBError).code === 11000) {
        console.error('A user with this email already exists. Please use a different email.');
      } 
      // Mongoose validation error
      else if ('name' in error && (error as Error).name === 'ValidationError' && 'errors' in error) {
        console.error('Validation errors:');
        const validationError = error as ValidationError;
        for (const field in validationError.errors) {
          console.error(`- ${field}: ${validationError.errors[field].message}`);
        }
      }
    }
    
    // Close readline interface and database connection
    rl.close();
    try {
      await disconnectFromDatabase();
    } catch (err) {
      console.error('Error disconnecting from database:', err);
    }
    exit(1);
  }
};

// Helper function to generate a secure password
function generatePassword(length = 12): string {
  const upperChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const specialChars = '!@#$%^&*()_+';
  
  const allChars = upperChars + lowerChars + numbers + specialChars;
  
  let password = '';
  
  // Ensure we have at least one of each type
  password += upperChars.charAt(Math.floor(Math.random() * upperChars.length));
  password += lowerChars.charAt(Math.floor(Math.random() * lowerChars.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle the password characters
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

// Execute the function
addUser().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});