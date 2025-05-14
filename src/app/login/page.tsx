'use client';

import LoginForm from '@/components/Forms/LoginForm';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);

  // Set page background color to match input fields
  useEffect(() => {
    // Set the background color to match the input fields
    document.body.style.backgroundColor = '#f0e6d2';
    
    // Clean up when component unmounts
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);
  
  useEffect(() => {
    setMounted(true);
    
    // Optional: Prüfen auf biometrische Unterstützung
    const checkBiometricSupport = async () => {
      if (typeof window !== 'undefined' && 'PublicKeyCredential' in window) {
        try {
          // Hier könnte eine API-Abfrage zur Biometrie-Unterstützung erfolgen
          console.log('Biometrische Authentifizierung wird unterstützt');
        } catch {
          console.error('Biometrische Authentifizierung wird nicht unterstützt');
        }
      }
    };
    
    checkBiometricSupport();
  }, []);

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02),transparent_70%)]"></div>
      </div>
      
      {/* Kontener formularza logowania */}
      <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <LoginForm redirectTo="/dashboard" />
      </div>
    </div>
  );
}
