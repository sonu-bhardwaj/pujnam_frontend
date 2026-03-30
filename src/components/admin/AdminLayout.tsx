import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Image,
  Calendar,
  Tag,
  Settings,
  X,
  LogIn,
  Sparkles,
  Phone,
  Video,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminOrders } from './AdminOrders';
import { AdminCustomers } from './AdminCustomers';
import { AdminBanners } from './AdminBanners';
import { AdminPromoBlocks } from './AdminPromoBlocks';
import { AdminSectionVideos } from './AdminSectionVideos';
import { AdminPanchang } from './AdminPanchang';
import { AdminCoupons } from './AdminCoupons';
import { AdminSettings } from './AdminSettings';
import { AdminFestivals } from './AdminFestivals';
import { authApi } from '../../lib/api';

interface AdminLayoutProps {
  onClose?: () => void;
}

type MenuItem = {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
};

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'categories', label: 'Categories', icon: FolderTree },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'festivals', label: 'Festivals', icon: Sparkles },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'banners', label: 'Banners', icon: Image },
  { id: 'section-videos', label: 'Video Section', icon: Video },
  { id: 'promo-blocks', label: 'Poojan & Astro', icon: Phone },
  { id: 'panchang', label: 'Panchang', icon: Calendar },
  { id: 'coupons', label: 'Coupons', icon: Tag },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onClose = () => {} }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordOTP, setForgotPasswordOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data, error } = await authApi.getProfile();
      if (!error && data?.user?.role === 'admin') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const { data, error } = await authApi.login(loginData.email, loginData.password);
      if (error) {
        setLoginError(error);
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        if (data?.user?.role === 'admin') {
          setIsAuthenticated(true);
        } else {
          setLoginError('Access denied. Admin only.');
          await authApi.logout();
        }
      }
    } catch (err) {
      setLoginError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await authApi.logout();
    setIsAuthenticated(false);
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    const { error } = await authApi.forgotPassword(forgotPasswordEmail);
    if (error) {
      setLoginError(error);
    } else {
      setForgotPasswordStep('otp');
    }

    setIsLoading(false);
  };

  const handleVerifyForgotPasswordOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    if (!forgotPasswordOTP.trim() || forgotPasswordOTP.length !== 6) {
      setLoginError('Please enter a valid 6-digit OTP');
      setIsLoading(false);
      return;
    }

    const { error } = await authApi.verifyPasswordResetOTP(forgotPasswordEmail, forgotPasswordOTP);
    if (error) {
      setLoginError(error);
      setIsLoading(false);
      return;
    }

    setForgotPasswordStep('reset');
    setIsLoading(false);
  };

  const handleAdminResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (newPassword.length < 6 || newPassword !== confirmPassword) {
      setLoginError('Passwords must match and be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    const { error } = await authApi.resetPassword(
      forgotPasswordEmail,
      forgotPasswordOTP,
      newPassword,
    );

    if (error) {
      setLoginError(error);
    } else {
      setShowForgotPassword(false);
      setForgotPasswordStep('email');
      setForgotPasswordOTP('');
      setNewPassword('');
      setConfirmPassword('');
      setLoginError('');
    }

    setIsLoading(false);
  };

  const renderContent = () => {
    try {
      switch (activeTab) {
        case 'dashboard':
          return <AdminDashboard />;
        case 'categories':
          return <AdminCategories />;
        case 'products':
          return <AdminProducts />;
        case 'festivals':
          return <AdminFestivals />;
        case 'orders':
          return <AdminOrders />;
        case 'customers':
          return <AdminCustomers />;
        case 'banners':
          return <AdminBanners />;
        case 'section-videos':
          return <AdminSectionVideos />;
        case 'promo-blocks':
          return <AdminPromoBlocks />;
        case 'panchang':
          return <AdminPanchang />;
        case 'coupons':
          return <AdminCoupons />;
        case 'settings':
          return <AdminSettings />;
        default:
          return (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {menuItems.find((item) => item.id === activeTab)?.label || 'Unknown'} section coming soon...
              </p>
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering admin content:', error);
      return (
        <div className="text-center py-12">
          <p className="text-red-600 text-lg mb-4">Error loading {menuItems.find((item) => item.id === activeTab)?.label || 'page'}</p>
          <p className="text-gray-600 text-sm">Please check the console for details.</p>
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF8C00] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2">
              Admin <span className="text-[#FF8C00]">Login</span>
            </h2>
            <p className="text-gray-600">Enter your admin credentials</p>
          </div>

          {showForgotPassword ? (
            <div className="space-y-4">
              {forgotPasswordStep === 'email' && (
                <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                  {loginError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {loginError}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Email</label>
                    <input
                      type="email"
                      required
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent"
                      placeholder="Enter admin email"
                    />
                  </div>
                  <button type="submit" disabled={isLoading} className="btn-primary w-full">
                    {isLoading ? 'Sending OTP...' : 'Send Reset OTP'}
                  </button>
                  <button type="button" onClick={() => setShowForgotPassword(false)} className="btn-secondary w-full">
                    Back to Login
                  </button>
                </form>
              )}

              {forgotPasswordStep === 'otp' && (
                <form onSubmit={handleVerifyForgotPasswordOTP} className="space-y-4">
                  {loginError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {loginError}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Enter OTP</label>
                    <input
                      type="text"
                      required
                      value={forgotPasswordOTP}
                      onChange={(e) => setForgotPasswordOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent"
                      placeholder="6-digit OTP"
                    />
                  </div>
                  <button type="submit" disabled={forgotPasswordOTP.length !== 6 || isLoading} className="btn-primary w-full">
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <button type="button" onClick={() => setForgotPasswordStep('email')} className="btn-secondary w-full">
                    Change Email
                  </button>
                </form>
              )}

              {forgotPasswordStep === 'reset' && (
                <form onSubmit={handleAdminResetPassword} className="space-y-4">
                  {loginError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {loginError}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent"
                        placeholder="New password"
                      />
                      <button type="button" onClick={() => setShowNewPassword((prev) => !prev)} className="absolute inset-y-0 right-0 px-4 text-gray-500">
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent"
                        placeholder="Confirm password"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword((prev) => !prev)} className="absolute inset-y-0 right-0 px-4 text-gray-500">
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading} className="btn-primary w-full">
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent"
                    placeholder="Enter password"
                  />
                  <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute inset-y-0 right-0 px-4 text-gray-500">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(true);
                  setForgotPasswordEmail(loginData.email);
                  setForgotPasswordStep('email');
                  setLoginError('');
                }}
                className="text-sm text-[#FF8C00] hover:underline"
              >
                Forgot Password?
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <LogIn size={20} />
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <a
              href="#/"
              className="text-gray-600 hover:text-[#FF8C00] transition-colors inline-block"
            >
              Back to Store
            </a>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      <aside
        className={`bg-white shadow-lg transition-all duration-300 flex flex-col h-full ${
          isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="p-6 border-b flex-shrink-0">
          <h2 className="text-2xl font-bold text-[#1A1A1A]">
            Admin <span className="text-[#FF8C00]">Panel</span>
          </h2>
        </div>

        <nav className="p-4 flex-1 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  console.log('Switching to tab:', item.id);
                  setActiveTab(item.id);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                  activeTab === item.id
                    ? 'bg-[#FF8C00] text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-md p-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-600 hover:text-[#FF8C00] transition-colors"
            >
              <Package size={24} />
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleLogout}
                className="btn-secondary flex items-center gap-2"
              >
                <LogIn size={20} />
                Logout
              </button>
              <a 
                href="#/" 
                className="btn-primary flex items-center gap-2"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = '#/';
                  if (onClose) onClose();
                }}
              >
                <X size={20} />
                Back to Store
              </a>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <div key={activeTab}>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};
