// Responsive Dashboard Layout for all user roles
import React, { useState, ReactNode } from 'react';
import { User } from '../App';
import { LogOut, Menu, X } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface ResponsiveDashboardProps {
  user: User;
  onLogout: () => void;
  menuItems: MenuItem[];
  currentPage: string;
  onPageChange: (page: string) => void;
  children: ReactNode;
  roleColor: string; // e.g., 'blue', 'green', 'purple', 'red'
  subtitle?: string; // e.g., 'Class 10-A', 'Parent Portal'
}

export function ResponsiveDashboard({
  user,
  onLogout,
  menuItems,
  currentPage,
  onPageChange,
  children,
  roleColor,
  subtitle
}: ResponsiveDashboardProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const colorClasses = {
    blue: {
      avatar: 'bg-blue-600',
      active: 'bg-blue-600 text-white',
      hover: 'hover:bg-blue-50'
    },
    green: {
      avatar: 'bg-green-600',
      active: 'bg-green-600 text-white',
      hover: 'hover:bg-green-50'
    },
    purple: {
      avatar: 'bg-purple-600',
      active: 'bg-purple-600 text-white',
      hover: 'hover:bg-purple-50'
    },
    red: {
      avatar: 'bg-red-600',
      active: 'bg-red-600 text-white',
      hover: 'hover:bg-red-50'
    }
  };

  const colors = colorClasses[roleColor as keyof typeof colorClasses] || colorClasses.blue;

  const handlePageChange = (pageId: string) => {
    onPageChange(pageId);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${colors.avatar} rounded-full flex items-center justify-center text-white text-sm`}>
            {user.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-gray-900 text-sm font-medium">{user.name}</h3>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex lg:flex-col w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${colors.avatar} rounded-full flex items-center justify-center text-white`}>
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-gray-900 truncate">{user.name}</h3>
              {subtitle && <p className="text-sm text-gray-500 truncate">{subtitle}</p>}
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handlePageChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  currentPage === item.id
                    ? colors.active
                    : `text-gray-700 hover:bg-gray-100`
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${colors.avatar} rounded-full flex items-center justify-center text-white`}>
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-gray-900 truncate">{user.name}</h3>
              {subtitle && <p className="text-sm text-gray-500 truncate">{subtitle}</p>}
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handlePageChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  currentPage === item.id
                    ? colors.active
                    : `text-gray-700 hover:bg-gray-100`
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
