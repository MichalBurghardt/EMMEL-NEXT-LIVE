import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Import Providers
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { NotificationProvider } from '@/context/NotificationContext';
// Füge den AuthProvider hinzu
import { AuthProvider } from '@/components/providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Emmel Bus Management',
  description: 'Professional bus management and logistics solution',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <ThemeProvider>
          <NotificationProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
