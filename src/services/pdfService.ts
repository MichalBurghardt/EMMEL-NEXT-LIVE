import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import archiver from 'archiver';
import { Writable } from 'stream';
// Poprawiam importy modeli
import { ITrip } from '@/models/Trip';
import { IBooking } from '@/models/Booking';

// PDF Service Types
export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxId?: string;
  logoPath?: string;
}

export interface TicketData {
  bookingNumber: string;
  ticketNumber: string;
  passengerName: string;
  seatNumber?: string;
  tripTitle: string;
  date: string;
  departureTime: string;
  busInfo: string;
  driverPhone?: string;
  qrCodePath?: string;
  companyLogo?: string;
  companyInfo?: CompanyInfo;
}

export interface Passenger {
  firstName: string;
  lastName: string;
  seatNumber?: string;
  ticketData?: {
    ticketNumber: string;
  };
  ticketIssued: boolean;
}

export interface TripManifestData {
  bookingNumber: string;
  route: {
    startLocation: string;
    endLocation: string;
  };
  startDate: Date;
  bus?: {
    name: string;
    licensePlate: string;
  };
  driver?: {
    firstName: string;
    lastName: string;
  };
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface BankDetails {
  bank: string;
  iban: string;
  bic: string;
  accountHolder: string;
}

export interface CustomerAddress {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface Customer {
  name: string;
  address: CustomerAddress;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  bookingNumber: string;
  paymentTerms?: string;
  customer: Customer;
  tripDetails: {
    route: string;
    date: string;
    busInfo?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  vatRate: number;
  vat: number;
  total: number;
  deposit?: number;
  bankDetails?: BankDetails;
  companyInfo?: CompanyInfo;
  companyLogo?: string;
}

// Define interfaces for bus and driver to avoid using 'any'
interface IBusInfo {
  name: string;
  licensePlate: string;
}

interface IDriverInfo {
  firstName: string;
  lastName: string;
}

// Default company information
const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: 'Emmel Reisen GmbH',
  address: 'Musterstr. 123, 63755 Alzenau',
  phone: '+49 123 456789',
  email: 'info@emmel-reisen.de',
  website: 'www.emmel-reisen.de',
  taxId: 'USt-IdNr: DE123456789'
};

/**
 * Generate a PDF ticket
 * 
 * @param ticketData Ticket data
 * @param outputPath Output file path
 * @returns Path to the generated file
 */
export async function generateTicket(
  ticketData: TicketData, 
  outputPath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Create a new PDF document
      const doc = new PDFDocument({
        size: 'A5',
        margin: 30,
        info: {
          Title: `Emmel Reisen Ticket - ${ticketData.bookingNumber}`,
          Author: 'Emmel Reisen GmbH',
          Subject: 'Fahrschein / Ticket',
          Keywords: 'ticket, bus, reisen, emmel'
        }
      });
      
      // Create a write stream
      const stream = fs.createWriteStream(outputPath);
      
      // Handle stream events
      stream.on('error', (err) => {
        console.error(`Error creating PDF stream:`, err);
        reject(err);
      });
      
      stream.on('finish', () => {
        console.log(`Ticket generated: ${outputPath}`);
        resolve(outputPath);
      });
      
      // Pipe the document to the stream
      doc.pipe(stream as unknown as Writable);
      
      // Company logo
      if (ticketData.companyLogo && fs.existsSync(ticketData.companyLogo)) {
        doc.image(ticketData.companyLogo, {
          fit: [200, 100],
          align: 'center'
        });
      }
      
      // Ticket title
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .text('FAHRSCHEIN / TICKET', { align: 'center' })
         .moveDown(0.5);
      
      // Booking number
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#0056b3')
         .text(`Buchung Nr.: ${ticketData.bookingNumber}`, { align: 'center' })
         .moveDown(1);
         
      // Passenger data
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('Fahrgastdaten / Passenger details:')
         .moveDown(0.5);
      
      doc.fontSize(11)
         .font('Helvetica')
         .text(`Name: ${ticketData.passengerName}`)
         .text(`Sitzplatz / Seat: ${ticketData.seatNumber || 'Keine Sitzplatzzuweisung / No seat assignment'}`)
         .moveDown(1);
      
      // Trip data
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Reisedetails / Trip details:')
         .moveDown(0.5);
      
      doc.fontSize(11)
         .font('Helvetica')
         .text(`Strecke / Route: ${ticketData.tripTitle}`)
         .text(`Datum / Date: ${ticketData.date}`)
         .text(`Abfahrt / Departure: ${ticketData.departureTime}`)
         .text(`Bus: ${ticketData.busInfo}`)
         .text(`Fahrer-Telefon / Driver Phone: ${ticketData.driverPhone || 'N/A'}`)
         .moveDown(1);
      
      // QR Code
      if (ticketData.qrCodePath && fs.existsSync(ticketData.qrCodePath)) {
        doc.image(ticketData.qrCodePath, {
          fit: [150, 150],
          align: 'center'
        });
        
        doc.fontSize(10)
           .font('Helvetica')
           .text('Bitte scannen Sie den QR-Code beim Einsteigen', { align: 'center' })
           .text('Please scan the QR code when boarding', { align: 'center' })
           .moveDown(1);
      }
      
      // Footer
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#666666')
         .text('Dieser Fahrschein ist nur gültig mit einem amtlichen Lichtbildausweis.', { align: 'center' })
         .text('This ticket is only valid with an official photo ID.', { align: 'center' })
         .moveDown(0.5);
      
      // Company contact information
      const companyInfo = ticketData.companyInfo || DEFAULT_COMPANY_INFO;
      
      doc.fontSize(9)
         .text(`${companyInfo.name} • ${companyInfo.address}`, { align: 'center' })
         .text(`Tel: ${companyInfo.phone} • Email: ${companyInfo.email} • ${companyInfo.website}`, { align: 'center' });
      
      // Finalize the document
      doc.end();
      
    } catch (error) {
      console.error(`Error generating ticket:`, error);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

/**
 * Generate a trip manifest for the driver
 * 
 * @param tripData Trip data
 * @param passengers List of passengers
 * @param outputPath Output file path
 * @returns Path to the generated file
 */
export async function generateTripManifest(
  tripData: TripManifestData,
  passengers: Passenger[],
  outputPath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Create a new PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Emmel Reisen - Trip Manifest ${tripData.bookingNumber}`,
          Author: 'Emmel Reisen GmbH',
          Subject: 'Trip Manifest',
          Keywords: 'manifest, bus, passengers, emmel'
        }
      });
      
      // Create a write stream
      const stream = fs.createWriteStream(outputPath);
      
      // Handle stream events
      stream.on('error', (err) => {
        console.error(`Error creating manifest PDF stream:`, err);
        reject(err);
      });
      
      stream.on('finish', () => {
        console.log(`Trip manifest generated: ${outputPath}`);
        resolve(outputPath);
      });
      
      // Pipe the document to the stream
      doc.pipe(stream as unknown as Writable);
      
      // Document title
      doc.fontSize(22)
         .font('Helvetica-Bold')
         .text('FAHRTMANIFEST / TRIP MANIFEST', { align: 'center' })
         .moveDown(0.5);
      
      // Trip data
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#0056b3')
         .text(`Buchung Nr.: ${tripData.bookingNumber}`, { align: 'center' })
         .moveDown(1);
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('Reisedetails / Trip details:')
         .moveDown(0.5);
      
      doc.fontSize(11)
         .font('Helvetica')
         .text(`Strecke / Route: ${tripData.route.startLocation} - ${tripData.route.endLocation}`)
         .text(`Datum / Date: ${new Date(tripData.startDate).toLocaleDateString('de-DE')}`)
         .text(`Abfahrt / Departure: ${new Date(tripData.startDate).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`)
         .text(`Bus: ${tripData.bus ? `${tripData.bus.name} (${tripData.bus.licensePlate})` : 'Nicht zugewiesen / Not assigned'}`)
         .text(`Fahrer / Driver: ${tripData.driver ? `${tripData.driver.firstName} ${tripData.driver.lastName}` : 'Nicht zugewiesen / Not assigned'}`)
         .text(`Passagieranzahl / Passenger count: ${passengers.length}`)
         .moveDown(1);
      
      // Passenger list
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Passagierliste / Passenger list:')
         .moveDown(0.5);
      
      // Table headers
      const tableTop = doc.y;
      const tableWidth = doc.page.width - 100;
      const columns = [
        { header: 'Nr.', width: tableWidth * 0.1 },
        { header: 'Name', width: tableWidth * 0.4 },
        { header: 'Sitzplatz / Seat', width: tableWidth * 0.2 },
        { header: 'Ticket', width: tableWidth * 0.15 },
        { header: 'Status', width: tableWidth * 0.15 }
      ];
      
      // Draw headers
      let x = 50;
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#333333');
      
      columns.forEach(column => {
        doc.text(column.header, x, tableTop, { width: column.width });
        x += column.width;
      });
      
      // Draw horizontal line under headers
      doc.moveTo(50, tableTop + 15)
         .lineTo(doc.page.width - 50, tableTop + 15)
         .stroke();
      
      // Draw data
      let y = tableTop + 25;
      
      passengers.forEach((passenger, index) => {
        // Check if a new page is needed
        if (y + 20 > doc.page.height - 100) {
          doc.addPage();
          y = 50;
          
          // Add headers on the new page
          x = 50;
          doc.fontSize(10)
             .font('Helvetica-Bold')
             .fillColor('#333333');
          
          columns.forEach(column => {
            doc.text(column.header, x, y, { width: column.width });
            x += column.width;
          });
          
          // Draw horizontal line under headers
          doc.moveTo(50, y + 15)
             .lineTo(doc.page.width - 50, y + 15)
             .stroke();
          
          y += 25;
        }
        
        // Draw passenger data
        x = 50;
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#000000');
        
        // Number
        doc.text((index + 1).toString(), x, y, { width: columns[0].width });
        x += columns[0].width;
        
        // Name
        doc.text(`${passenger.firstName} ${passenger.lastName}`, x, y, { width: columns[1].width });
        x += columns[1].width;
        
        // Seat
        doc.text(passenger.seatNumber || '-', x, y, { width: columns[2].width });
        x += columns[2].width;
        
        // Ticket status
        const ticketNumber = passenger.ticketData?.ticketNumber || '-';
        doc.text(ticketNumber, x, y, { width: columns[3].width });
        x += columns[3].width;
        
        // Status
        const status = passenger.ticketIssued ? 'Ausgestellt' : 'Ausstehend';
        doc.text(status, x, y, { width: columns[4].width });
        
        // Prepare for next passenger
        y += 20;
      });
      
      // Driver signature field
      doc.moveDown(2);
      y = doc.y;
      
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text('Unterschrift Fahrer / Driver signature:', 50, y);
      
      doc.moveTo(50, y + 40)
         .lineTo(300, y + 40)
         .stroke();
      
      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        
        // Add page numbers
        doc.fontSize(8)
           .font('Helvetica')
           .fillColor('#666666')
           .text(
              `Seite ${i + 1} von ${pageCount}`, 
              50, 
              doc.page.height - 50, 
              { align: 'center', width: doc.page.width - 100 }
           );
      }
      
      // Finalize the document
      doc.end();
      
    } catch (error) {
      console.error(`Error generating trip manifest:`, error);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

/**
 * Create a ZIP archive of tickets
 * 
 * @param ticketsDir Directory with tickets
 * @param outputPath Output path for the archive
 * @returns Path to the generated archive
 */
export async function createTicketsZip(
  ticketsDir: string, 
  outputPath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Create a write stream
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression level
      });
      
      // Handle events
      output.on('close', () => {
        console.log(`ZIP archive created: ${outputPath} (${archive.pointer()} bytes)`);
        resolve(outputPath);
      });
      
      archive.on('error', (err: Error) => {
        console.error(`Error creating ZIP archive:`, err);
        reject(err);
      });
      
      // Pipe the archive to the stream
      archive.pipe(output);
      
      // Add ticket files to the archive
      const pdfFiles = fs.readdirSync(ticketsDir)
        .filter(file => file.endsWith('.pdf'));
      
      pdfFiles.forEach(file => {
        const filePath = path.join(ticketsDir, file);
        archive.file(filePath, { name: file });
      });
      
      // Finalize the archive
      archive.finalize();
      
    } catch (error) {
      console.error(`Error creating tickets ZIP:`, error);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

/**
 * Generate an invoice in PDF format
 * 
 * @param invoiceData Invoice data
 * @param outputPath Output file path
 * @returns Path to the generated file
 */
export async function generateInvoice(
  invoiceData: InvoiceData, 
  outputPath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Create a new PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Emmel Reisen Rechnung - ${invoiceData.invoiceNumber}`,
          Author: 'Emmel Reisen GmbH',
          Subject: 'Rechnung / Invoice',
          Keywords: 'invoice, bus, reisen, emmel'
        }
      });
      
      // Create a write stream
      const stream = fs.createWriteStream(outputPath);
      
      // Handle stream events
      stream.on('error', (err) => {
        console.error(`Error creating invoice PDF stream:`, err);
        reject(err);
      });
      
      stream.on('finish', () => {
        console.log(`Invoice generated: ${outputPath}`);
        resolve(outputPath);
      });
      
      // Pipe the document to the stream
      doc.pipe(stream as unknown as Writable);
      
      // Company logo
      if (invoiceData.companyLogo && fs.existsSync(invoiceData.companyLogo)) {
        doc.image(invoiceData.companyLogo, 50, 50, {
          fit: [150, 100]
        });
      }
      
      // Company information
      const companyInfo = invoiceData.companyInfo || DEFAULT_COMPANY_INFO;
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(companyInfo.name, 50, 160)
         .text(companyInfo.address)
         .text(`Tel: ${companyInfo.phone}`)
         .text(`Email: ${companyInfo.email}`)
         .text(`Web: ${companyInfo.website}`)
         .text(companyInfo.taxId || '');
      
      // Customer data
      doc.fontSize(10)
         .font('Helvetica')
         .text('Rechnungsempfänger:', 300, 160)
         .text(invoiceData.customer.name)
         .text(invoiceData.customer.address.street)
         .text(`${invoiceData.customer.address.postalCode} ${invoiceData.customer.address.city}`)
         .text(invoiceData.customer.address.country);
      
      // Invoice number, date and booking number
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('RECHNUNG / INVOICE', 50, 250)
         .moveDown(0.5);
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Rechnungsnummer: ${invoiceData.invoiceNumber}`)
         .text(`Rechnungsdatum: ${invoiceData.invoiceDate}`)
         .text(`Buchungsnummer: ${invoiceData.bookingNumber}`)
         .text(`Zahlungsbedingungen: ${invoiceData.paymentTerms || 'Zahlbar innerhalb von 14 Tagen'}`)
         .moveDown(1);
      
      // Trip details
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Reisedetails / Trip details:')
         .moveDown(0.5);
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Strecke / Route: ${invoiceData.tripDetails.route}`)
         .text(`Datum / Date: ${invoiceData.tripDetails.date}`)
         .text(`Bus: ${invoiceData.tripDetails.busInfo || 'N/A'}`)
         .moveDown(1);
      
      // Invoice items table
      const tableTop = doc.y;
      const tableWidth = doc.page.width - 100;
      const columns = [
        { header: 'Pos.', width: tableWidth * 0.1 },
        { header: 'Beschreibung / Description', width: tableWidth * 0.5 },
        { header: 'Menge / Qty', width: tableWidth * 0.1 },
        { header: 'Preis / Price', width: tableWidth * 0.15 },
        { header: 'Summe / Total', width: tableWidth * 0.15 }
      ];
      
      // Draw headers
      let x = 50;
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#333333');
      
      columns.forEach(column => {
        doc.text(column.header, x, tableTop, { width: column.width });
        x += column.width;
      });
      
      // Draw horizontal line under headers
      doc.moveTo(50, tableTop + 15)
         .lineTo(doc.page.width - 50, tableTop + 15)
         .stroke();
      
      // Draw item data
      let y = tableTop + 25;
      
      invoiceData.items.forEach((item, index) => {
        x = 50;
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#000000');
        
        // Position
        doc.text((index + 1).toString(), x, y, { width: columns[0].width });
        x += columns[0].width;
        
        // Description
        doc.text(item.description, x, y, { width: columns[1].width });
        x += columns[1].width;
        
        // Quantity
        doc.text(item.quantity.toString(), x, y, { width: columns[2].width, align: 'right' });
        x += columns[2].width;
        
        // Unit price
        doc.text(`${item.unitPrice.toFixed(2)} €`, x, y, { width: columns[3].width, align: 'right' });
        x += columns[3].width;
        
        // Total
        const totalPrice = item.quantity * item.unitPrice;
        doc.text(`${totalPrice.toFixed(2)} €`, x, y, { width: columns[4].width, align: 'right' });
        
        y += 20;
      });
      
      // Draw horizontal line under items
      doc.moveTo(50, y)
         .lineTo(doc.page.width - 50, y)
         .stroke();
      
      // Summary
      y += 10;
      
      // Net amount
      doc.fontSize(10)
         .font('Helvetica')
         .text('Nettobetrag / Net amount:', 300, y, { width: 150 })
         .text(`${invoiceData.subtotal.toFixed(2)} €`, { width: 100, align: 'right' });
      
      y += 20;
      
      // VAT
      doc.text(`MwSt. / VAT (${invoiceData.vatRate || 19}%)`, 300, y, { width: 150 })
         .text(`${invoiceData.vat.toFixed(2)} €`, { width: 100, align: 'right' });
      
      y += 20;
      
      // Total amount
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Gesamtbetrag / Total amount:', 300, y, { width: 150 })
         .text(`${invoiceData.total.toFixed(2)} €`, { width: 100, align: 'right' });
      
      // If there was a deposit
      if (invoiceData.deposit && invoiceData.deposit > 0) {
        y += 30;
        
        doc.fontSize(10)
           .font('Helvetica')
           .text('Bereits bezahlte Anzahlung / Deposit paid:', 300, y, { width: 150 })
           .text(`${invoiceData.deposit.toFixed(2)} €`, { width: 100, align: 'right' });
        
        y += 20;
        
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('Restbetrag / Remaining amount:', 300, y, { width: 150 })
           .text(`${(invoiceData.total - invoiceData.deposit).toFixed(2)} €`, { width: 100, align: 'right' });
      }
      
      // Payment information
      y += 50;
      
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text('Bankverbindung / Bank details:', 50, y)
         .moveDown(0.5);
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Bank: ${invoiceData.bankDetails?.bank || 'Sparkasse Aschaffenburg'}`)
         .text(`IBAN: ${invoiceData.bankDetails?.iban || 'DE12 3456 7890 1234 5678 90'}`)
         .text(`BIC: ${invoiceData.bankDetails?.bic || 'SPKADE12XXX'}`)
         .text(`Kontoinhaber: ${invoiceData.bankDetails?.accountHolder || companyInfo.name}`);
      
      // Footer
      const footerY = doc.page.height - 100;
      
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#666666')
         .text(
            'Vielen Dank für Ihr Vertrauen. Wir freuen uns auf die nächste Reise mit Ihnen!',
            50, footerY, { align: 'center', width: doc.page.width - 100 }
         );
      
      // Finalize the document
      doc.end();
      
    } catch (error) {
      console.error(`Error generating invoice:`, error);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

/**
 * Generate a contract in PDF format
 * 
 * @param contractData Contract data
 * @param outputPath Output file path
 * @returns Path to the generated file
 */
export async function generateContract(
  contractData: Record<string, unknown>, 
  outputPath: string
): Promise<string> {
  // This is a placeholder for contract generation functionality
  // Implementation would be similar to invoice generation but with contract specific details
  console.warn('Contract generation is not fully implemented yet');
  
  // For now, generate a basic PDF with contract information
  return generateInvoice({
    invoiceNumber: `C-${(contractData.contractNumber as string) || '00000'}`,
    invoiceDate: (contractData.contractDate as string) || new Date().toLocaleDateString('de-DE'),
    bookingNumber: (contractData.bookingNumber as string) || '00000',
    customer: {
      name: (contractData.customerName as string) || 'Sample Customer',
      address: {
        street: (contractData.customerStreet as string) || 'Sample Street 1',
        postalCode: (contractData.customerPostalCode as string) || '12345',
        city: (contractData.customerCity as string) || 'Sample City',
        country: (contractData.customerCountry as string) || 'Germany'
      }
    },
    tripDetails: {
      route: (contractData.route as string) || 'Sample Route',
      date: (contractData.date as string) || new Date().toLocaleDateString('de-DE'),
      busInfo: (contractData.busInfo as string) || undefined
    },
    items: [{
      description: 'Contract Implementation',
      quantity: 1,
      unitPrice: 0
    }],
    subtotal: 0,
    vatRate: 19,
    vat: 0,
    total: 0
  }, outputPath);
}

/**
 * Generate PDF as a buffer (for streaming or API response)
 * 
 * @param generateFunction The PDF generation function to use
 * @param data Data for the PDF
 * @returns PDF as a buffer
 */
export async function generatePDFBuffer<T>(
  generateFunction: (data: T, path: string) => Promise<string>,
  data: T
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      // Create a temporary file path
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const tempFilePath = path.join(tempDir, `temp-${Date.now()}.pdf`);
      
      // Generate the PDF
      await generateFunction(data, tempFilePath);
      
      // Read the file into a buffer
      const buffer = fs.readFileSync(tempFilePath);
      
      // Clean up the temporary file
      fs.unlinkSync(tempFilePath);
      
      resolve(buffer);
    } catch (error) {
      console.error('Error generating PDF buffer:', error);
      reject(error);
    }
  });
}

/**
 * Format trip data for PDF generation
 * 
 * @param trip Trip data
 * @param booking Booking data
 * @returns Formatted data for PDF generation
 */
export function formatTripDataForPDF(trip: ITrip, booking?: IBooking): TripManifestData {
  return {
    bookingNumber: booking?.bookingNumber || trip.title || '',
    route: {
      startLocation: trip.startLocation || '',
      endLocation: trip.endLocation || ''
    },
    startDate: new Date(trip.startDate),
    bus: trip.assignedBus ? {
      name: (trip.assignedBus as unknown as IBusInfo).name || '',
      licensePlate: (trip.assignedBus as unknown as IBusInfo).licensePlate || ''
    } : undefined,
    driver: trip.assignedDriver ? {
      firstName: (trip.assignedDriver as unknown as IDriverInfo).firstName || '',
      lastName: (trip.assignedDriver as unknown as IDriverInfo).lastName || ''
    } : undefined
  };
}

// Eksportowanie obiektu z nazwą
export const pdfService = {
  generateTicket,
  generateTripManifest,
  createTicketsZip,
  generateInvoice,
  generateContract,
  generatePDFBuffer,
  formatTripDataForPDF
};

export default pdfService;