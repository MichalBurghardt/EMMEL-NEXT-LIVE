'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  isDarkMode: boolean;
  language: string;
  notifications: boolean;
  compactMode: boolean;
}

interface SettingsContextType {
  settings: Settings;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  toggleDarkMode: () => void;
  toggleCompactMode: () => void;
  toggleNotifications: () => void;
  setLanguage: (language: string) => void;
}

const defaultSettings: Settings = {
  isDarkMode: false,
  language: 'en',
  notifications: true,
  compactMode: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
  initialSettings?: Partial<Settings>;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children, initialSettings = {} }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window === 'undefined') {
      return { ...defaultSettings, ...initialSettings };
    }
    
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      try {
        return { ...defaultSettings, ...JSON.parse(savedSettings), ...initialSettings };
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
    
    return { ...defaultSettings, ...initialSettings };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-settings', JSON.stringify(settings));
    }
  }, [settings]);

  const setSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleDarkMode = () => setSetting('isDarkMode', !settings.isDarkMode);
  const toggleCompactMode = () => setSetting('compactMode', !settings.compactMode);
  const toggleNotifications = () => setSetting('notifications', !settings.notifications);
  const setLanguage = (language: string) => setSetting('language', language);

  return (
    <SettingsContext.Provider value={{ 
      settings,
      setSetting,
      toggleDarkMode,
      toggleCompactMode,
      toggleNotifications,
      setLanguage,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  
  return context;
};

// Helper hook for dark mode
export const useTheme = () => {
  const { settings } = useSettings();
  return { isDarkMode: settings.isDarkMode };
};
