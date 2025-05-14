"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { Button, Card, Input } from '@/components/UI';

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
    email: 'wird benötigt!',
    password: 'wird benötigt!'
  });
  const [visibleErrors, setVisibleErrors] = useState({
    email: true,
    password: true
  });
  const [animatedForm, setAnimatedForm] = useState(false);
  
  // Stan dla przełącznika trybu ciemnego
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Stan dla widoku mobilnego
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  
  // Animations are now defined in input.css file
  // This ensures we don't have duplicate animation definitions
  useEffect(() => {
    // We keep this useEffect for potential future custom animations
    // that might be specific to this component
  }, []);
  
  // Animation beim Laden
  useEffect(() => {
    // Verzögerung für die Animation
    setTimeout(() => setAnimatedForm(true), 300);
  }, []);

  // Reset errors when fields are filled
  useEffect(() => {
    if (formData.email.trim() !== '') {
      setVisibleErrors(prev => ({ ...prev, email: false }));
    } else {
      setVisibleErrors(prev => ({ ...prev, email: true }));
    }
  }, [formData.email]);

  useEffect(() => {
    if (formData.password.trim() !== '') {
      setVisibleErrors(prev => ({ ...prev, password: false }));
    } else {
      setVisibleErrors(prev => ({ ...prev, password: true }));
    }
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Reset error message to "wird benötigt!" when field is cleared
    if ((name === 'email' || name === 'password') && value.trim() === '') {
      setErrors(prev => ({
        ...prev,
        [name]: 'wird benötigt!'
      }));
      setVisibleErrors(prev => ({
        ...prev,
        [name]: true
      }));
    } else if (value.trim() !== '') {
      // Hide error message when field has value
      setVisibleErrors(prev => ({
        ...prev,
        [name]: false
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
  
  // Toggle mobile preview
  const toggleMobilePreview = () => {
    setIsMobilePreview(prev => !prev);
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Możemy usunąć ten komponent, ponieważ teraz używamy ikon bezpośrednio w formularzu

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { email: '', password: '' };
    
    // Sprawdź pole email
    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'wird benötigt!';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'falsche E-Mail-Adresse';
      isValid = false;
      setVisibleErrors(prev => ({ ...prev, email: true })); // Show error for invalid email
    }
    
    // Sprawdź pole hasła
    if (!formData.password || formData.password.trim() === '') {
      newErrors.password = 'wird benötigt!';
      isValid = false;
    } else if (formData.password.length < 6) {
      // Opcjonalna dodatkowa walidacja hasła
      newErrors.password = 'falsches Passwort';
      isValid = false;
      setVisibleErrors(prev => ({ ...prev, password: true })); // Show error for invalid password
    }
    
    // Ustaw komunikaty błędów
    setErrors(newErrors);
    
    // Add vintage effect to the form when there are validation errors
    if (!isValid) {
      const form = document.querySelector('form');
      if (form) {
        // First a gentle shake like an old newspaper printer
        form.style.animation = 'shake 0.5s ease-in-out';
        
        // Create a more authentic vintage printing press sound effect
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          
          // Create multiple oscillators for a richer sound
          const createPrintingSound = () => {
            // Main mechanical oscillator
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(40, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.07, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.4);
            
            // Paper movement sound
            setTimeout(() => {
              const paperSound = audioContext.createOscillator();
              const paperGain = audioContext.createGain();
              
              paperSound.type = 'triangle';
              paperSound.frequency.setValueAtTime(120, audioContext.currentTime);
              paperSound.frequency.exponentialRampToValueAtTime(60, audioContext.currentTime + 0.3);
              paperGain.gain.setValueAtTime(0.03, audioContext.currentTime);
              paperGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
              
              paperSound.connect(paperGain);
              paperGain.connect(audioContext.destination);
              
              paperSound.start();
              paperSound.stop(audioContext.currentTime + 0.3);
            }, 100);
          };
          
          createPrintingSound();
        } catch (e) {
          console.error('Audio context not available', e);
        }
        
        // Reset animation after it completes
        setTimeout(() => {
          form.style.animation = '';
        }, 500);
      }
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Wykonaj walidację formularza przed wysłaniem
    if (!validateForm()) {
      e.stopPropagation(); // Zatrzymaj domyślne zachowanie
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
        <div className="absolute w-12 h-12 border-t-4 border-l-4"></div>
        <div className="absolute w-6 h-6 top-2 left-2 rotate-45"></div>
      </div>
    );
  };
  
  // Add effect to simulate old newspaper texture
  const oldPaperEffect = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: isDarkMode ? 0.05 : 0.08,
    backgroundImage: "url('data:image/png;base64,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')",
    pointerEvents: 'none' as const
  };

  return (
    <div className="relative vintage-paper-bg">
      {/* Mobile preview toggle button */}
      <button 
        onClick={toggleMobilePreview}
        className="fixed top-4 right-4 z-50 rounded-sm p-2 shadow-lg transition-all font-mono uppercase text-xs tracking-wide"
        style={{
          backgroundColor: isDarkMode ? 'rgba(51, 51, 51, 0.9)' : 'rgba(240, 230, 210, 0.95)',
          color: isDarkMode ? '#d3b88c' : '#42210b',
          border: isDarkMode ? '1px solid #d3b88c50' : '1px solid #42210b50',
          letterSpacing: '1px',
          boxShadow: isDarkMode ? '0 2px 5px rgba(0,0,0,0.3)' : '0 2px 5px rgba(66,33,11,0.15)'
        }}
        aria-label="Toggle mobile preview"
      >
        {isMobilePreview ? "Desktop" : "Mobilgeräte"}
      </button>
      
      <Card
        variant="default"
        elevation="sm"
        padding="lg"
        className={`max-w-md mx-auto border-0 overflow-hidden transition-all duration-700 relative ${
          animatedForm ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        } ${isMobilePreview ? 'max-w-[320px] mx-auto' : ''}`}
        style={{ 
          aspectRatio: isMobilePreview ? '9/16' : '1/1',
          fontFamily: "'Courier Prime', 'Special Elite', 'American Typewriter', monospace",
          letterSpacing: '0.5px',
          lineHeight: '1.5',
          backgroundColor: isDarkMode ? '#222222' : undefined,
          backgroundImage: !isDarkMode ? 'linear-gradient(120deg, #f0e6d2, #e6d7bf, #f0e6d2, #e6d7bf)' : 'none',
          color: isDarkMode ? '#d3b88c' : '#42210b',
          boxShadow: isDarkMode ? '0px 0px 15px rgba(0,0,0,0.3)' : '0px 5px 15px rgba(66, 33, 11, 0.08)',
          backgroundSize: '400% 400%',
          position: 'relative'
        }}
      >
        {/* Texture overlay for old newspaper effect */}
        <div style={oldPaperEffect}></div>
        
        {/* Art Deco Rahmen */}
        <div className="absolute inset-0 pointer-events-none border-8 p-1">
          <div className="w-full h-full border"></div>
          <ArtDecoCorner position="tl" />
          <ArtDecoCorner position="tr" />
          <ArtDecoCorner position="bl" />
          <ArtDecoCorner position="br" />

          {/* Diagonale Linien im Art Deco Stil */}
          <div className="absolute top-6 left-6 w-8 h-0.5 rotate-45"></div>
          <div className="absolute top-6 right-6 w-8 h-0.5 -rotate-45"></div>
          <div className="absolute bottom-6 left-6 w-8 h-0.5 -rotate-45"></div>
          <div className="absolute bottom-6 right-6 w-8 h-0.5 rotate-45"></div>
        </div>
        
        {/* Vertikales Layout im 1:1 Format */}
        <div className="flex flex-col h-full py-4">
          {/* Kopfzeile mit Reisethematik */}
          <div className="text-center px-6 relative">
            <div className="text-center border-b-2 border-t-2 py-2 w-full">
              <p className="text-xs font-mono uppercase tracking-wider">Persönlich und zuverlässig - Seit MMXXV</p>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-mono tracking-tight mt-4 text-center uppercase font-bold"
                style={{letterSpacing: '1px'}}>
              EMMEL REISEN
            </h1>              <div className="flex justify-center my-2">
              <div className="h-1 w-24"></div>
            </div>
            
            <p className="text-xs font-mono italic text-center mt-1 mb-4">
              &ldquo;MIT UNS ENTDECKEN SIE DIE WELT SEIT EINEM JAHRHUNDERT&rdquo;
            </p>
            
            <div className="text-center border-b py-2 w-full mt-2">
              <p className="text-xs font-mono"> Unser Reiseangebot FRÜHLING/SOMMER 2025</p>
            </div>
          </div>
          
          {/* Usunięto grafikę */}
          
          {/* Login-Formular - Condensed für 1:1 Format */}
          <div className="flex-1 flex flex-col justify-center px-4 py-1">
            <div className="space-y-1 text-center mb-6">
              <h2 className="text-xl font-mono uppercase tracking-wide">REISENDEN-IDENTIFIKATION</h2>
              <p className="text-xs font-mono italic">Bitte geben Sie Ihre Reisedokumente ein</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-7" noValidate> {/* Further increased spacing between form elements */}
              <div className="space-y-1 mb-10"> {/* Increased bottom margin from mb-8 to mb-10 to add 10px more space */}
                <div 
                  className={`relative group rounded-sm overflow-hidden border ${errors.email ? 'border-amber-800/70' : 'border-amber-900/30'}`} 
                  style={{ 
                    backgroundColor: '#f0e6d2',
                    transition: 'all 0.3s ease-in-out',
                    boxShadow: errors.email ? 'inset 0 0 2px rgba(146, 64, 14, 0.4)' : 'none'
                  }}
                >
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Ihre E-Mail-Adresse"
                    className="h-10 px-0 py-1 mx-[-15px] border-0 text-amber-900 placeholder-amber-900/50 font-mono vintage-input" 
                    style={{ 
                      WebkitAppearance: 'none',
                      letterSpacing: '0.6px',
                      paddingLeft: '18px',
                      paddingRight: '18px'
                    }}
                    onInvalid={(e) => e.preventDefault()}
                    icon={
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        style={{ color: isDarkMode ? '#d3b88c' : '#42210b' }}
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    }
                  />
                  {visibleErrors.email && (
                    <div className="placeholder-warning" 
                         style={{
                           fontWeight: '500', 
                           fontStyle: 'italic', 
                           paddingLeft: '8px',
                           animation: isDarkMode ? 'color-pulse-dark 1s ease-in-out infinite' : 'color-pulse 1s ease-in-out infinite',
                           color: isDarkMode ? '#d3b88c' : '#42210b'
                         }}>
                      <span className="vintage-error-text">{errors.email}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-1 mb-2"> {/* Added additional bottom margin */}
                <div 
                  className={`relative group rounded-sm overflow-hidden border ${errors.password ? 'border-amber-800/70' : 'border-amber-900/30'}`}
                  style={{ 
                    backgroundColor: '#f0e6d2',
                    transition: 'all 0.3s ease-in-out',
                    boxShadow: errors.password ? 'inset 0 0 2px rgba(146, 64, 14, 0.4)' : 'none'
                  }}
                >
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Ihr Passwort"
                    className="h-10 px-0 py-1 mx-[-15px] border-0 text-amber-900 placeholder-amber-900/50 font-mono vintage-input"
                    style={{ 
                      WebkitAppearance: 'none',
                      letterSpacing: '0.6px',
                      paddingLeft: '18px',
                      paddingRight: '18px'
                    }}
                    onInvalid={(e) => e.preventDefault()}
                    icon={
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        style={{ color: isDarkMode ? '#d3b88c' : '#42210b' }}
                      >
                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                      </svg>
                    }
                    rightIcon={
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="flex items-center justify-center w-6 h-6"
                        style={{
                          color: isDarkMode ? '#d3b88c' : '#42210b',
                          opacity: 1,
                          transition: 'transform 0.2s, color 0.2s'
                        }}
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: isDarkMode ? '#d3b88c' : '#42210b' }}>
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: isDarkMode ? '#d3b88c' : '#42210b' }}>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        )}
                      </button>
                    }
                  />
                  {visibleErrors.password && (
                    <div className="placeholder-warning" 
                         style={{
                           fontWeight: '500', 
                           fontStyle: 'italic', 
                           paddingLeft: '8px',
                           animation: isDarkMode ? 'color-pulse-dark 1s ease-in-out infinite' : 'color-pulse 1s ease-in-out infinite',
                           color: isDarkMode ? '#d3b88c' : '#42210b'
                         }}>
                      <span className="vintage-error-text">{errors.password}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rememberMe: !prev.rememberMe }))}
                  className="text-xs font-mono border px-3 py-1 rounded-sm"
                  style={{
                    backgroundColor: formData.rememberMe 
                      ? (isDarkMode ? 'rgba(211, 184, 140, 0.15)' : 'rgba(146, 64, 14, 0.1)') 
                      : 'transparent',
                    borderColor: isDarkMode 
                      ? (formData.rememberMe ? 'rgba(211, 184, 140, 0.4)' : 'rgba(211, 184, 140, 0.2)') 
                      : (formData.rememberMe ? 'rgba(146, 64, 14, 0.4)' : 'rgba(146, 64, 14, 0.2)'),
                    color: isDarkMode ? '#d3b88c' : '#42210b',
                    boxShadow: formData.rememberMe ? 'inset 0 1px 2px rgba(0, 0, 0, 0.1)' : 'none',
                    transform: formData.rememberMe ? 'scale(0.98)' : 'scale(1)',
                    letterSpacing: '0.5px',
                    transition: 'transform 0.2s, background-color 0.2s, box-shadow 0.2s'
                  }}
                >
                  Login speichern
                </button>
                <button
                  type="button"
                  onClick={() => window.location.href = '#'}
                  className="text-xs font-mono border px-3 py-1 rounded-sm"
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: isDarkMode ? 'rgba(211, 184, 140, 0.2)' : 'rgba(146, 64, 14, 0.2)',
                    color: isDarkMode ? 'rgba(211, 184, 140, 0.8)' : 'rgba(146, 64, 14, 0.8)',
                    transform: 'scale(1)',
                    letterSpacing: '0.5px',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Code vergessen?
                </button>
              </div>
              
              <div className="space-y-2 pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                  className="border-0 uppercase font-mono tracking-widest text-sm py-2 rounded-sm"
                  style={{
                    backgroundColor: isDarkMode ? '#d3b88c' : '#42210b',
                    color: isDarkMode ? '#222222' : '#f0e6d2',
                    letterSpacing: '2px',
                    boxShadow: isDarkMode 
                      ? '0 3px 6px rgba(0, 0, 0, 0.25)' 
                      : '0 3px 6px rgba(66, 33, 11, 0.1)',
                    transform: loading ? 'scale(0.98)' : 'scale(1)',
                    transition: 'transform 0.2s, background-color 0.3s'
                  }}
                >
                  {loading ? 'Wird geprüft...' : 'REISE BEGINNEN'}
                </Button>
              </div>
            </form>
          </div>

          {/* Art Deco Trenner */}
          <div className="flex items-center justify-center my-2 px-8">
            <div className="h-px flex-1"></div>
            <div className="mx-2 w-4 h-4 rotate-45"></div>
            <div className="h-px flex-1"></div>
          </div>

          {/* Registration link */}
          <div className="text-center mb-4">
            <p className="font-mono italic" style={{ 
                fontSize: '0.85rem',
                color: isDarkMode ? '#d3b88c' : '#42210b' 
              }}>
              Noch keine Mitgliedschaft?{' '}
              <a 
                href="/register" 
                className="font-medium hover:underline transition-colors border-b hover:border-opacity-100" 
                style={{ 
                  color: isDarkMode ? '#d3b88c' : '#42210b',
                  borderColor: isDarkMode ? 'rgba(211, 184, 140, 0.3)' : 'rgba(66, 33, 11, 0.3)'
                }}
              >
                Registrieren
              </a>
            </p>
          </div>

          {/* Przełącznik trybu jasny/ciemny */}
          <div className="flex justify-center mb-1">
            <button
              onClick={toggleDarkMode}
              className="flex items-center space-x-2 px-4 py-1 rounded-sm text-xs font-mono transition-all uppercase tracking-wider"
              style={{
                backgroundColor: isDarkMode ? '#d3b88c' : '#42210b',
                color: isDarkMode ? '#222222' : '#f0e6d2',
                letterSpacing: '1px',
                border: 'none',
                boxShadow: isDarkMode 
                  ? '0 3px 6px rgba(0, 0, 0, 0.25)' 
                  : '0 3px 6px rgba(66, 33, 11, 0.1)',
                transition: 'transform 0.2s, background-color 0.3s'
              }}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? "Hell" : "Dunkel"}
            </button>
          </div>

          {/* Zeitungstypische Fußzeile mit Reisethematik */}
          <div className="mt-auto border-t border-black pt-2">
            <div className="text-center text-[10px] font-mono">
              <p>EMMEL REISEN • PHILLIP-REIS-STRASSE 6 • D-63755 ALZENAU</p>
              <p>Tel: +49 6023 1398 oder 8398 • emmel.reisen@t-online.de</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;
