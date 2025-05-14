'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface WindowSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

interface WindowContextType {
  windowSize: WindowSize;
}

const WindowContext = createContext<WindowContextType | undefined>(undefined);

interface WindowProviderProps {
  children: ReactNode;
}

export const WindowProvider: React.FC<WindowProviderProps> = ({ children }) => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({
        width,
        height,
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    // Initial call
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <WindowContext.Provider value={{ windowSize }}>
      {children}
    </WindowContext.Provider>
  );
};

export const useWindow = () => {
  const context = useContext(WindowContext);
  
  if (context === undefined) {
    throw new Error('useWindow must be used within a WindowProvider');
  }
  
  return context;
};
