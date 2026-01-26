import React, { useState } from 'react';
import { User, UserRole } from '../App';
import { GraduationCap, Users, BookOpen, Shield, AlertCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { SEO } from './SEO';
import { toast } from 'sonner';

export function Login() {
  const { login } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (!result.success) {
        setError(result.message || 'Login failed');
        toast.error(result.message || 'Invalid credentials');
      } else {
        toast.success('Login successful!');
      }
    } catch (err) {
      setError('An error occurred during login');
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { value: 'student' as UserRole, label: 'Student', icon: GraduationCap, color: 'bg-blue-500', email: 'rahul@student.edu' },
    { value: 'parent' as UserRole, label: 'Parent', icon: Users, color: 'bg-green-500', email: 'parent@email.com' },
    { value: 'teacher' as UserRole, label: 'Teacher', icon: BookOpen, color: 'bg-purple-500', email: 'priya@teacher.edu' },
    { value: 'admin' as UserRole, label: 'Admin', icon: Shield, color: 'bg-red-500', email: 'admin@school.edu' }
  ];

  // Auto-fill email when role is selected
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    const selectedRoleData = roles.find(r => r.value === role);
    if (selectedRoleData) {
      setEmail(selectedRoleData.email);
    }
  };

  return (
    <>
      <SEO 
        title="Login" 
        description="Login to School Management System - Access your student, parent, teacher, or admin dashboard"
        keywords="school login, student portal, parent portal, teacher portal, admin dashboard"
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <GraduationCap className="w-10 h-10 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-gray-900 mb-2">School Management System</h1>
            <p className="text-gray-600">Select your role and login to continue</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid grid-cols-4 gap-2 mb-6">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.value}
                    onClick={() => handleRoleSelect(role.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                      selectedRole === role.value
                        ? `${role.color} text-white shadow-lg scale-105`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    aria-label={`Select ${role.label} role`}
                    type="button"
                  >
                    <Icon className="w-6 h-6" aria-hidden="true" />
                    <span className="text-xs">{role.label}</span>
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : `Login as ${roles.find(r => r.value === selectedRole)?.label}`}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p className="mb-2"><strong>Demo Credentials:</strong></p>
              <div className="text-xs space-y-1">
                {roles.map(role => (
                  <div key={role.value}>
                    <strong>{role.label}:</strong> {role.email} / password123
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}