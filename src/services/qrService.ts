import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

/**
 * Options for QR code generation
 */
export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Generate a QR code and save it to a file
 * 
 * @param data Data to encode in the QR code
 * @param outputPath Path where to save the QR code image
 * @param options QR code options
 * @returns Promise resolving to the output path
 */
export async function generateQRCodeToFile(
  data: string, 
  outputPath: string, 
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Default options
    const qrOptions = {
      width: options.width || 300,
      margin: options.margin !== undefined ? options.margin : 4,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF'
      },
      errorCorrectionLevel: options.errorCorrectionLevel || 'M'
    };
    
    // Generate and save QR code
    await QRCode.toFile(outputPath, data, qrOptions);
    
    return outputPath;
  } catch (error) {
    console.error('Error generating QR code to file:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Generate a QR code as a data URL (base64)
 * 
 * @param data Data to encode in the QR code
 * @param options QR code options
 * @returns Promise resolving to the data URL
 */
export async function generateQRCodeAsDataURL(
  data: string, 
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    // Default options
    const qrOptions = {
      width: options.width || 300,
      margin: options.margin !== undefined ? options.margin : 4,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF'
      },
      errorCorrectionLevel: options.errorCorrectionLevel || 'M'
    };
    
    // Generate QR code as a data URL
    const dataURL = await QRCode.toDataURL(data, qrOptions);
    
    return dataURL;
  } catch (error) {
    console.error('Error generating QR code as data URL:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Generate a QR code as an SVG string
 * 
 * @param data Data to encode in the QR code
 * @param options QR code options
 * @returns Promise resolving to the SVG string
 */
export async function generateQRCodeAsSVG(
  data: string, 
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    // Default options
    const qrOptions = {
      width: options.width || 300,
      margin: options.margin !== undefined ? options.margin : 4,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF'
      },
      errorCorrectionLevel: options.errorCorrectionLevel || 'M'
    };
    
    // Generate QR code as an SVG string
    const svg = await QRCode.toString(data, {
      ...qrOptions,
      type: 'svg'
    });
    
    return svg;
  } catch (error) {
    console.error('Error generating QR code as SVG:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Generate a QR code for a ticket
 * 
 * @param ticketNumber Ticket number
 * @param bookingNumber Booking number
 * @param passengerName Passenger name
 * @param outputPath Path where to save the QR code image
 * @param options QR code options
 * @returns Promise resolving to the output path
 */
export async function generateTicketQRCode(
  ticketNumber: string,
  bookingNumber: string,
  passengerName: string,
  outputPath: string,
  options: QRCodeOptions = {}
): Promise<string> {
  // Create a JSON payload with ticket information
  const payload = JSON.stringify({
    type: 'ticket',
    ticketNumber,
    bookingNumber,
    passengerName,
    timestamp: Date.now()
  });
  
  // Generate the QR code
  return generateQRCodeToFile(payload, outputPath, {
    ...options,
    errorCorrectionLevel: 'H' // Use high error correction for tickets
  });
}

/**
 * Generate a deep link QR code for mobile app
 * 
 * @param type Type of deep link (booking, trip, etc.)
 * @param id ID of the resource
 * @param outputPath Path where to save the QR code image
 * @param options QR code options
 * @returns Promise resolving to the output path
 */
export async function generateDeepLinkQRCode(
  type: 'booking' | 'trip' | 'bus' | 'driver',
  id: string,
  outputPath: string,
  options: QRCodeOptions = {}
): Promise<string> {
  // Create a deep link URL
  const deepLink = `emmelreisen://${type}/${id}`;
  
  // Generate the QR code
  return generateQRCodeToFile(deepLink, outputPath, options);
}

/**
 * Generate a vCard QR code
 * 
 * @param contactInfo Contact information
 * @param outputPath Path where to save the QR code image
 * @param options QR code options
 * @returns Promise resolving to the output path
 */
export async function generateVCardQRCode(
  contactInfo: {
    firstName: string;
    lastName: string;
    organization?: string;
    title?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  },
  outputPath: string,
  options: QRCodeOptions = {}
): Promise<string> {
  // Create a vCard string
  let vCard = 'BEGIN:VCARD\nVERSION:3.0\n';
  
  vCard += `N:${contactInfo.lastName};${contactInfo.firstName};;;\n`;
  vCard += `FN:${contactInfo.firstName} ${contactInfo.lastName}\n`;
  
  if (contactInfo.organization) {
    vCard += `ORG:${contactInfo.organization}\n`;
  }
  
  if (contactInfo.title) {
    vCard += `TITLE:${contactInfo.title}\n`;
  }
  
  if (contactInfo.phone) {
    vCard += `TEL;TYPE=WORK,VOICE:${contactInfo.phone}\n`;
  }
  
  if (contactInfo.email) {
    vCard += `EMAIL:${contactInfo.email}\n`;
  }
  
  if (contactInfo.website) {
    vCard += `URL:${contactInfo.website}\n`;
  }
  
  if (contactInfo.address) {
    vCard += `ADR;TYPE=WORK:;;${contactInfo.address};;;\n`;
  }
  
  vCard += 'END:VCARD';
  
  // Generate the QR code
  return generateQRCodeToFile(vCard, outputPath, options);
}

/**
 * Generate a WiFi network QR code
 * 
 * @param networkInfo WiFi network information
 * @param outputPath Path where to save the QR code image
 * @param options QR code options
 * @returns Promise resolving to the output path
 */
export async function generateWiFiQRCode(
  networkInfo: {
    ssid: string;
    password?: string;
    encryption?: 'WEP' | 'WPA' | 'WPA2-EAP' | '';
    hidden?: boolean;
  },
  outputPath: string,
  options: QRCodeOptions = {}
): Promise<string> {
  // Create a WiFi string
  let wifiString = 'WIFI:';
  
  wifiString += `S:${networkInfo.ssid};`;
  
  if (networkInfo.encryption) {
    wifiString += `T:${networkInfo.encryption};`;
  }
  
  if (networkInfo.password) {
    wifiString += `P:${networkInfo.password};`;
  }
  
  if (networkInfo.hidden) {
    wifiString += `H:true;`;
  }
  
  wifiString += ';';
  
  // Generate the QR code
  return generateQRCodeToFile(wifiString, outputPath, options);
}

/**
 * Generate a QR code with company logo in the center
 * 
 * @param data Data to encode in the QR code
 * @param logoPath Path to the logo image
 * @param outputPath Path where to save the QR code image
 * @param options QR code options
 * @returns Promise resolving to the output path
 */
export async function generateQRCodeWithLogo(
  data: string,
  logoPath: string,
  outputPath: string,
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    // For now, this is a placeholder as it requires canvas manipulation
    // which is better handled by a front-end implementation or a more complex
    // server-side implementation with canvas libraries
    console.warn('QR code with logo generation is not implemented yet');
    
    // For now, generate a standard QR code
    return generateQRCodeToFile(data, outputPath, {
      ...options,
      errorCorrectionLevel: 'H' // High error correction is needed for logo embedding
    });
  } catch (error) {
    console.error('Error generating QR code with logo:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

// Eksportowanie obiektu z nazwą
export const qrService = {
  generateQRCodeToFile,
  generateQRCodeAsDataURL,
  generateQRCodeAsSVG,
  generateTicketQRCode,
  generateDeepLinkQRCode,
  generateVCardQRCode,
  generateWiFiQRCode,
  generateQRCodeWithLogo
};

export default qrService;