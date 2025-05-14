'use client';

import LoginForm from '@/components/Forms/LoginForm';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  
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
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-800 to-violet-900 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      {/* Animierter Hintergrund mit Glasmorphismus-Elementen */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/3 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl animate-pulse"></div>
        
        {/* Futuristische Netzmuster */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      </div>
      
      {/* 3D-Schwebeeffekt für die Login-Box */}
      <div className={`w-full max-w-md relative z-10 transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="absolute -top-5 left-0 right-0 h-40 w-full bg-gradient-to-b from-blue-500/20 to-transparent blur-xl"></div>
        
        {/* Holographischer Rand-Effekt */}
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-violet-600 via-blue-500 to-emerald-500 opacity-70 blur-sm animate-border-glow"></div>
        
        <LoginForm redirectTo="/dashboard" />
      </div>
    </div>
  );
}
