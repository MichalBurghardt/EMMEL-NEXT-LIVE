import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

// Email options interface
export interface EmailOptions {
  email: string;
  subject: string;
  message?: string;
  template?: string;
  templateData?: Record<string, unknown>;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: string | Buffer;
    contentType?: string;
  }>;
}

// Define interface for mail options to fix TypeScript errors
interface MailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: string | Buffer;
    contentType?: string;
  }>;
}

// Password reset options interface
export interface PasswordResetOptions {
  email: string;
  resetToken: string;
  firstName?: string;
}

// Interfejsy dla typów biznesowych
export interface BookingData {
  _id: string;
  bookingNumber: string;
  createdAt: string | Date;
  startDate: string | Date;
  endDate: string | Date;
  route?: {
    startLocation: string;
    endLocation: string;
  };
  price?: {
    total: number;
  };
  deposit?: {
    amount: number;
    dueDate?: string | Date;
  };
  driver?: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
  bus?: {
    name: string;
    licensePlate: string;
  };
}

export interface CustomerData {
  email: string;
  fullName?: string;
  companyName?: string;
}

/**
 * Creates a nodemailer transporter based on environment
 * @returns Nodemailer transporter instance
 */
const createTransporter = (): Transporter => {
  // Check runtime environment
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    // In development environment, we can use Ethereal for email testing
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_EMAIL || 'testuser@ethereal.email',
        pass: process.env.ETHEREAL_PASSWORD || 'testpassword'
      }
    });
  }

  // Production configuration
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

/**
 * Loads email template from file or returns fallback template
 * @param templateName Name of the template file (without extension)
 * @returns Handlebars compiled template function
 */
const loadTemplate = (templateName: string): Handlebars.TemplateDelegate => {
  // Adjust path for Next.js structure
  let templatePath: string;
  
  if (typeof window === 'undefined') {
    // Server-side: use absolute path
    templatePath = path.join(process.cwd(), 'src/templates/emails', `${templateName}.html`);
    
    try {
      // Check if template file exists
      if (fs.existsSync(templatePath)) {
        const template = fs.readFileSync(templatePath, 'utf8');
        return Handlebars.compile(template);
      }
    } catch (error) {
      console.error(`Error loading email template ${templateName}:`, error);
    }
  }
  
  // Return fallback template if file not found or in browser context
  return Handlebars.compile(`
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #0056b3; color: white; padding: 20px; text-align: center;">
        <h1>{{subject}}</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd;">
        <p>{{{message}}}</p>
      </div>
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px;">
        <p>Emmel Reisen GmbH</p>
        <p>© {{year}} Alle Rechte vorbehalten</p>
      </div>
    </div>
  `);
};

/**
 * Sends an email
 * @param options Email options
 * @returns Promise with information about the sent email
 */
export async function sendEmail(options: EmailOptions): Promise<SentMessageInfo> {
  try {
    // Create transporter
    const transporter = createTransporter();
    
    // Default data for all emails
    const year = new Date().getFullYear();
    
    // Prepare email content
    let emailHtml: string;
    if (options.template) {
      // Use specified template
      const template = loadTemplate(options.template);
      emailHtml = template({
        subject: options.subject,
        message: options.message,
        year,
        ...options.templateData
      });
    } else {
      // Use simple template with raw message
      const simpleTemplate = loadTemplate('simple');
      emailHtml = simpleTemplate({
        subject: options.subject,
        message: options.message,
        year
      });
    }
    
    // Prepare mail options with proper typing
    const mailOptions: MailOptions = {
      from: `${process.env.FROM_NAME || 'Emmel Reisen'} <${process.env.FROM_EMAIL || 'info@emmel-reisen.de'}>`,
      to: options.email,
      subject: options.subject,
      html: emailHtml
    };
    
    // Add CC if provided
    if (options.cc) {
      mailOptions.cc = options.cc;
    }
    
    // Add BCC if provided
    if (options.bcc) {
      mailOptions.bcc = options.bcc;
    }
    
    // Add attachments if provided
    if (options.attachments && Array.isArray(options.attachments)) {
      mailOptions.attachments = options.attachments;
    }
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    // Log info about sent email
    console.log(`Email sent: ${info.messageId}`);
    
    // In development mode, display preview URL
    if (process.env.NODE_ENV === 'development' && info.previewUrl) {
      console.info(`Preview URL: ${info.previewUrl}`);
    }
    
    return info;
  } catch (error) {
    console.error(`Error sending email:`, error);
    throw new Error(`Email could not be sent: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Sends a welcome email after registration
 * @param user User data
 * @returns Promise with information about the sent email
 */
export async function sendWelcomeEmail(user: { email: string; firstName: string; lastName: string }): Promise<SentMessageInfo> {
  return sendEmail({
    email: user.email,
    subject: 'Willkommen bei Emmel Reisen',
    template: 'welcome',
    templateData: {
      firstName: user.firstName,
      lastName: user.lastName,
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`
    }
  });
}

/**
 * Sends an email with password reset link
 * @param options Password reset options
 * @returns Promise with information about the sent email
 */
export async function sendPasswordResetEmail(options: PasswordResetOptions): Promise<SentMessageInfo> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password/${options.resetToken}`;
  
  return sendEmail({
    email: options.email,
    subject: 'Passwort zurücksetzen',
    template: 'password-reset',
    templateData: {
      firstName: options.firstName || 'Sehr geehrter Kunde',
      resetUrl,
      validHours: 1 // Token valid for 1 hour
    }
  });
}

/**
 * Sends a booking confirmation email
 * @param booking Booking data
 * @param customer Customer data
 * @returns Promise with information about the sent email
 */
export async function sendBookingConfirmationEmail(booking: BookingData, customer: CustomerData): Promise<SentMessageInfo> {
  return sendEmail({
    email: customer.email,
    subject: `Buchungsbestätigung: ${booking.bookingNumber}`,
    template: 'booking-confirmation',
    templateData: {
      customerName: customer.fullName || customer.companyName || customer.email,
      bookingNumber: booking.bookingNumber,
      bookingDate: new Date(booking.createdAt).toLocaleDateString('de-DE'),
      startDate: new Date(booking.startDate).toLocaleDateString('de-DE'),
      endDate: new Date(booking.endDate).toLocaleDateString('de-DE'),
      startLocation: booking.route?.startLocation || '',
      endLocation: booking.route?.endLocation || '',
      totalPrice: booking.price?.total || 0,
      depositAmount: booking.deposit?.amount || 0,
      depositDueDate: booking.deposit?.dueDate ? new Date(booking.deposit.dueDate).toLocaleDateString('de-DE') : '',
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/bookings/${booking._id}`
    }
  });
}

/**
 * Sends a reminder about upcoming trip
 * @param booking Booking data
 * @param customer Customer data
 * @returns Promise with information about the sent email
 */
export async function sendTripReminderEmail(booking: BookingData, customer: CustomerData): Promise<SentMessageInfo> {
  return sendEmail({
    email: customer.email,
    subject: `Erinnerung: Ihre Reise beginnt bald (${booking.bookingNumber})`,
    template: 'trip-reminder',
    templateData: {
      customerName: customer.fullName || customer.companyName || customer.email,
      bookingNumber: booking.bookingNumber,
      startDate: new Date(booking.startDate).toLocaleDateString('de-DE'),
      startTime: new Date(booking.startDate).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      startLocation: booking.route?.startLocation || '',
      endLocation: booking.route?.endLocation || '',
      driverName: booking.driver ? `${booking.driver.firstName} ${booking.driver.lastName}` : '',
      driverPhone: booking.driver?.phone || '',
      busInfo: booking.bus ? `${booking.bus.name} (${booking.bus.licensePlate})` : '',
      bookingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/bookings/${booking._id}`
    }
  });
}

// Eksport nazwany zamiast domyślnego anonimowego obiektu
export const emailService = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
  sendTripReminderEmail
};

export default emailService;