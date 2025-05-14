'use client';

import React from 'react';
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { WindowProvider } from "@/components/providers/WindowProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { NotificationProvider } from "@/context/NotificationContext";

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {  
  return (
    <>
      <AuthProvider>
        <SettingsProvider>
          <ThemeProvider>
            <NotificationProvider>
              <WindowProvider>
                <Toaster position="top-right" />
                {children}
              </WindowProvider>
            </NotificationProvider>
          </ThemeProvider>
        </SettingsProvider>
      </AuthProvider>
    </>
  );
};

export default ClientLayout;
