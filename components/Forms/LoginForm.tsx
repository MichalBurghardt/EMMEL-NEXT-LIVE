"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { Button, Card, Input, Checkbox, Label } from '@/components/UI';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

/**
 * Fixed Login Form Component
 * Contains a structured login form with proper error handling and German translations
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

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { email: '', password: '' };
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'E-Mail-Adresse ist erforderlich';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
      isValid = false;
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Passwort ist erforderlich';
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
      // For development/demo purposes, always succeed and set a demo token
      // REMOVE THIS FOR PRODUCTION
      if (formData.email === 'demo@example.com' && formData.password === 'demopass') {
        localStorage.setItem('auth_token', 'demo-token-for-development');
        show('success', 'Demo-Login erfolgreich!');
        router.push(redirectTo);
        setLoading(false);
        return;
      }

      // Use the login method from useAuth hook
      const success = await login(formData.email, formData.password);
      
      if (success) {
        show('success', 'Anmeldung erfolgreich!');
        
        // Handle successful login
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(redirectTo);
        }
      } else {
        show('error', 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.');
      }
    } catch (error) {
      console.error('Login error:', error);
      show('error', 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.');
    } finally {
      setLoading(false);
    }
  };

  // Eye icon for password visibility toggle
  const PasswordToggleIcon = () => (
    <button
      type="button"
      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? (
        // Closed eye icon
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        // Open eye icon
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );
  // Email icon
  const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  // Lock icon
  const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  return (
    <Card
      variant="accent"
      accentColor="green"
      elevation="lg"
      padding="lg"
      className="w-full"
    >      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Willkommen zurück</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Melden Sie sich bei Ihrem Emmel-Konto an</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" required>
            E-Mail-Adresse
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="max.mustermann@beispiel.de"
            icon={<EmailIcon />}
            error={errors.email}
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" required>
              Passwort
            </Label>            <a href="#" className="text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300">
              Passwort vergessen?
            </a>
          </div>
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            icon={<LockIcon />}
            rightIcon={<PasswordToggleIcon />}
            error={errors.password}
            required
          />
        </div>
        
        <div className="flex items-center">
          <Checkbox
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            label="Angemeldet bleiben"
          />
        </div>
        
        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          loading={loading}
        >
          {loading ? 'Anmeldung...' : 'Anmelden'}
        </Button>
      </form>
        <div className="mt-6 text-center text-sm">
        <p className="text-gray-600 dark:text-gray-300">
          Noch kein Konto?{' '}
          <a href="/register" className="font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300">
            Registrieren
          </a>
        </p>
      </div>
    </Card>
  );
};

export default LoginForm;
