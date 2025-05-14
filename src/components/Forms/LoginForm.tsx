"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { Button, Card, Input, Checkbox, Label } from '@/components/UI';
import Image from 'next/image';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

/**
 * Vintage Travel Agency Newspaper Login Form (1925 Style)
 * Klassisches Reisebüro-Zeitungsdesign im Stil der 1920er Jahre
 */
const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  redirectTo = '/dashboard' 
}) => {
  const router = useRouter();
  const { login } = useAuth();
  const { show } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const [animatedForm, setAnimatedForm] = useState(false);
  
  // Animation beim Laden
  useEffect(() => {
    // Verzögerung für die Animation
    setTimeout(() => setAnimatedForm(true), 300);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Clear error for changed field
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Password Toggle Funktion
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  // Password Toggle Icon Komponente im Zeitungsstil
  const PasswordToggleIcon = () => (
    <button
      type="button"
      onClick={togglePasswordVisibility}
      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-700 hover:text-black"
    >
      {showPassword ? (
        <span className="h-5 w-5 flex items-center justify-center font-serif text-xs">VERDECKEN</span>
      ) : (
        <span className="h-5 w-5 flex items-center justify-center font-serif text-xs">ZEIGEN</span>
      )}
    </button>
  );

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { email: '', password: '' };
    
    if (!formData.email) {
      newErrors.email = 'Ihre eBriefkaste wird benötigt';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ungültige eBriefkaste';
      isValid = false;
    }
    
    if (!formData.password) {
      newErrors.password = 'Ihr eBriefkastenschlüssel wird benötigt';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      // For development/demo purposes
      if (formData.email === 'demo@example.com' && formData.password === 'demopass') {
        localStorage.setItem('auth_token', 'demo-token-for-development');
        show('success', 'Willkommen zurück, geschätzter Reisender!');
        router.push(redirectTo);
        setLoading(false);
        return;
      }

      const success = await login(formData.email, formData.password);
      
      if (success) {
        show('success', 'Ihre Reiseunterlagen wurden bestätigt!');
        
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(redirectTo);
        }
      } else {
        show('error', 'Zugang verweigert. Bitte überprüfen Sie Ihre Reisedokumente.');
      }
    } catch {
      console.error('Login error');
      show('error', 'Zugang verweigert. Bitte überprüfen Sie Ihre Reisedokumente.');
    } finally {
      setLoading(false);
    }
  };

  // Art Deco Dekorative Elemente
  const ArtDecoCorner = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
    const positionClasses = {
      tl: "top-0 left-0 origin-top-left",
      tr: "top-0 right-0 origin-top-right",
      bl: "bottom-0 left-0 origin-bottom-left",
      br: "bottom-0 right-0 origin-bottom-right"
    };
    
    return (
      <div className={`absolute w-16 h-16 ${positionClasses[position]}`}>
        <div className="absolute w-12 h-12 border-t-4 border-l-4 border-black"></div>
        <div className="absolute w-6 h-6 top-2 left-2 bg-black rotate-45"></div>
      </div>
    );
  };

  return (
    <Card
      variant="default"
      elevation="sm"
      padding="lg"
      className={`max-w-md mx-auto border-0 overflow-hidden transition-all duration-700 bg-white text-black relative ${
        animatedForm ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
      style={{ aspectRatio: '1/2' }}
    >
      {/* Art Deco Rahmen */}
      <div className="absolute inset-0 pointer-events-none border-8 border-black p-1">
        <div className="w-full h-full border border-black"></div>
        <ArtDecoCorner position="tl" />
        <ArtDecoCorner position="tr" />
        <ArtDecoCorner position="bl" />
        <ArtDecoCorner position="br" />

        {/* Diagonale Linien im Art Deco Stil */}
        <div className="absolute top-6 left-6 w-8 h-0.5 bg-black rotate-45"></div>
        <div className="absolute top-6 right-6 w-8 h-0.5 bg-black -rotate-45"></div>
        <div className="absolute bottom-6 left-6 w-8 h-0.5 bg-black -rotate-45"></div>
        <div className="absolute bottom-6 right-6 w-8 h-0.5 bg-black rotate-45"></div>
      </div>
      
      {/* Vertikales Layout im 1:2 Format */}
      <div className="flex flex-col h-full py-4">
        {/* Kopfzeile mit Reisethematik */}
        <div className="text-center px-6 relative">
          <div className="text-center border-b-2 border-t-2 border-black py-2 w-full">
            <p className="text-xs font-serif uppercase tracking-wider">Seit MMXXV - Persönlich und zuverlässig</p>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-black mt-4 text-center uppercase font-bold" 
              style={{letterSpacing: '-1px'}}>
            EMMEL REISEN
          </h1>
          
          <div className="flex justify-center my-2">
            <div className="h-1 w-24 bg-black"></div>
          </div>
          
          <p className="text-xs font-serif italic text-center mt-1 mb-4">
            &ldquo;MIT UNS ENTDECKEN SIE DIE WELT SEIT EINEM JAHRHUNDERT&rdquo;
          </p>
          
          <div className="text-center border-b border-black py-2 w-full mt-2">
            <p className="text-xs font-serif"> Unser Reiseangebot FRÜHLING/SOMMER 2025</p>
          </div>
        </div>
        
        <div className="text-center mt-6 px-4">
          <Image 
            src="/file.svg" 
            alt="Vintage Travel" 
            width={64} 
            height={64}
            className="mx-auto mb-2" 
          />
        </div>
        
        {/* Login-Formular */}
        <div className="flex-1 flex flex-col justify-center px-4 py-2">
          <div className="space-y-2 text-center mb-4">
            <h2 className="text-xl font-serif uppercase tracking-wide">REISENDEN-IDENTIFIKATION</h2>
            <p className="text-xs font-serif italic">Bitte geben Sie Ihre Reisedokumente ein</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" required className="font-serif text-black tracking-wide text-xs uppercase">
                Ihre Korrespondenz-Adresse
              </Label>
              <div className="relative group border-b border-black">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="weltenbummler@post.de"
                  error={errors.email}
                  required
                  className="bg-transparent border-0 text-black placeholder-gray-600/70 focus:ring-0 font-serif"
                />
              </div>
              {errors.email && <p className="text-black italic text-xs mt-1 font-serif">* {errors.email}</p>}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" required className="font-serif text-black tracking-wide text-xs uppercase">
                  Reisepass-Code
                </Label>
                <a href="#" className="text-xs font-serif text-black italic hover:underline text-[10px]">
                  Code vergessen?
                </a>
              </div>
              <div className="relative group border-b border-black">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  rightIcon={<PasswordToggleIcon />}
                  error={errors.password}
                  required
                  className="bg-transparent border-0 text-black placeholder-gray-600/70 focus:ring-0 font-serif"
                />
              </div>
              {errors.password && <p className="text-black italic text-xs mt-1 font-serif">* {errors.password}</p>}
            </div>

            <div className="flex items-center">
              <Checkbox
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                label="Reisedaten speichern"
                className="text-black focus:ring-gray-700 border-gray-700 font-serif text-xs"
              />
            </div>
            
            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                className="bg-black hover:bg-gray-900 text-white border-0 uppercase font-serif tracking-widest text-sm py-3"
              >
                {loading ? 'Wird geprüft...' : 'REISE BEGINNEN'}
              </Button>
              
              <div className="text-center mt-2">
                <p className="text-black text-xs font-serif italic">
                  Noch keine Mitgliedschaft?{' '}
                  <a href="/register" className="font-medium text-black hover:underline transition-colors">
                    Registrieren
                  </a>
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Art Deco Trenner */}
        <div className="flex items-center justify-center my-4 px-8">
          <div className="h-px flex-1 bg-black"></div>
          <div className="mx-2 w-4 h-4 bg-black rotate-45"></div>
          <div className="h-px flex-1 bg-black"></div>
        </div>

        {/* Zeitungstypische Fußzeile mit Reisethematik */}
        <div className="mt-auto border-t border-black pt-2">
          <div className="text-center text-[10px] font-serif">
            <p>EMMEL WELTREISEN & EXPEDITIONEN © MCMXXV</p>
            <p className="mt-1">PARIS • LONDON • BERLIN • NEW YORK • KAIRO</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LoginForm;