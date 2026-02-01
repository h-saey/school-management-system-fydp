// Global Application Context with Role-Based Access Control
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, dataService } from '../services/dataService';
import { sessionService } from '../services/sessionService';
import { UserRole } from '../App';

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  canAccessEntity: (entityType: string, entityId: string) => boolean;
  refreshUser: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize session on mount
  useEffect(() => {
    const session = sessionService.getSession();
    if (session) {
      setCurrentUser(session.user);
      setIsAuthenticated(true);
    }

    // Listen for session timeout
    const handleSessionTimeout = () => {
      handleLogout();
      alert('Your session has expired due to inactivity. Please login again.');
    };

    window.addEventListener('sessionTimeout', handleSessionTimeout);

    return () => {
      window.removeEventListener('sessionTimeout', handleSessionTimeout);
    };
  }, []);

  const handleLogin = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const result = dataService.authenticate(email, password);
    
    if (result.success && result.user) {
      sessionService.startSession(result.user);
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      return { success: true };
    }

    return { success: false, message: result.message };
  };

  const handleLogout = () => {
    sessionService.endSession();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!currentUser) return false;

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(currentUser.role);
  };

  const canAccessEntity = (entityType: string, entityId: string): boolean => {
    if (!currentUser) return false;

    // Admin can access everything
    if (currentUser.role === 'admin') return true;

    // Role-based entity access control
    switch (entityType) {
      case 'student':
        if (currentUser.role === 'student') {
          const student = dataService.getStudentByUserId(currentUser.id);
          return student?.id === entityId;
        }
        if (currentUser.role === 'parent') {
          const parent = dataService.getParentByUserId(currentUser.id);
          return parent?.childrenIds.includes(entityId) || false;
        }
        if (currentUser.role === 'teacher') {
          // Teachers can access students in their assigned classes
          const teacher = dataService.getTeacherByUserId(currentUser.id);
          const student = dataService.getStudentById(entityId);
          if (teacher && student) {
            const studentClass = `${student.class}-${student.section}`;
            return teacher.assignedClasses.includes(studentClass);
          }
        }
        return false;

      case 'parent':
        if (currentUser.role === 'parent') {
          const parent = dataService.getParentByUserId(currentUser.id);
          return parent?.id === entityId;
        }
        return false;

      case 'teacher':
        if (currentUser.role === 'teacher') {
          const teacher = dataService.getTeacherByUserId(currentUser.id);
          return teacher?.id === entityId;
        }
        return false;

      case 'message':
        // Can access messages sent to or from the current user
        const data = dataService;
        // This would need the actual message ID lookup
        return true; // Simplified for prototype

      default:
        return false;
    }
  };

  const refreshUser = () => {
    if (currentUser) {
      const updatedUser = dataService.getUserById(currentUser.id);
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login: handleLogin,
        logout: handleLogout,
        hasPermission,
        canAccessEntity,
        refreshUser
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
