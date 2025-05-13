'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  Home, Calendar, User, Building2, Bus, Users, Map, 
  FileText, Settings, HelpCircle, ChevronRight, ChevronLeft, LogOut
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const { user, logout } = useAuth();
  const [activePath, setActivePath] = useState('/');
  useEffect(() => {
    setActivePath(window.location.pathname);
  }, []);
  
  const menuItems = [
    { 
      name: 'Dashboard', 
      icon: <Home size={20} />, 
      href: '/dashboard',
      allowedRoles: ['all'] 
    },
    { 
      name: 'Buchungen', 
      icon: <Calendar size={20} />, 
      href: '/bookings',
      allowedRoles: ['admin', 'manager', 'dispatcher', 'driver', 'individual_customer', 'business_customer']
    },
    { 
      name: 'Kalender', 
      icon: <Calendar size={20} />, 
      href: '/calendar',
      allowedRoles: ['admin', 'manager', 'dispatcher', 'driver']
    },
    { 
      name: 'Individualkunden', 
      icon: <User size={20} />, 
      href: '/individual-customers',
      allowedRoles: ['admin', 'manager', 'dispatcher', 'driver']
    },
    { 
      name: 'Geschäftskunden', 
      icon: <Building2 size={20} />, 
      href: '/business-customers',
      allowedRoles: ['admin', 'manager', 'dispatcher', 'driver']
    },
    { 
      name: 'Flotte', 
      icon: <Bus size={20} />, 
      href: '/fleet',
      allowedRoles: ['admin', 'manager', 'dispatcher']
    },
    { 
      name: 'Fahrer', 
      icon: <Users size={20} />, 
      href: '/drivers',
      allowedRoles: ['admin', 'manager', 'dispatcher']
    },
    { 
      name: 'Reisen', 
      icon: <Map size={20} />, 
      href: '/trips',
      allowedRoles: ['admin', 'manager', 'dispatcher', 'driver']
    },
    { 
      name: 'Berichte', 
      icon: <FileText size={20} />, 
      href: '/reports',
      allowedRoles: ['admin', 'manager']
    },
    { 
      name: 'Einstellungen', 
      icon: <Settings size={20} />, 
      href: '/settings',
      allowedRoles: ['admin', 'manager']
    },
    { 
      name: 'Hilfe', 
      icon: <HelpCircle size={20} />, 
      href: '/help',
      allowedRoles: ['all']
    },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    if (!user) return false;
    if (item.allowedRoles.includes('all')) return true;
    return user.role && item.allowedRoles.includes(user.role);
  });

  return (
    <div 
      className={`h-full fixed top-0 left-0 z-40 bg-gray-900 text-white transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
        <div className={`flex items-center ${!isOpen && 'justify-center w-full'}`}>
          {isOpen ? (
            <span className="text-xl font-semibold">Emmel</span>
          ) : (
            <span className="text-xl font-bold">E</span>
          )}
        </div>
        <button 
          onClick={toggleSidebar}
          className={`p-1 rounded-full hover:bg-gray-800 focus:outline-none ${!isOpen && 'hidden'}`}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <div className="py-4">
        <nav className="px-2 space-y-1">
          {filteredMenuItems.map((item) => {
            const isActive = activePath === item.href || activePath.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors
                  ${isActive 
                    ? 'bg-blue-700 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
                `}
                onClick={() => setActivePath(item.href)}
              >
                <div className={`mr-3 ${!isOpen && 'mr-0'}`}>
                  {item.icon}
                </div>
                <span className={`${!isOpen && 'hidden'} transition-opacity duration-200`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {user && (
        <div className={`absolute bottom-0 w-full pb-4 px-2 border-t border-gray-800 pt-4`}>
          <button
            onClick={() => logout()}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut size={20} className={`mr-3 ${!isOpen && 'mr-0'}`} />
            <span className={`${!isOpen && 'hidden'} transition-opacity duration-200`}>
              Abmelden
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;