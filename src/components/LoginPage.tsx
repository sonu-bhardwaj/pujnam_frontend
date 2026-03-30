import React, { useState, useEffect } from 'react';
import { ArrowRight, MessageCircle, Mail, LogIn, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../lib/api';
import { useNotification } from '../contexts/NotificationContext';
import { AnnouncementBar } from './AnnouncementBar';
// import { PanchangBar } from './PanchangBar';
import { Header } from './Header';
import { Footer } from './Footer';

export const LoginPage: React.FC = () => {
  const { showSuccess, showError, showInfo } = useNotification();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'otp' | 'email'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordOTP, setForgotPasswordOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSendingForgotPasswordOTP, setIsSendingForgotPasswordOTP] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  useEffect(() => {
    // Get return URL from query params
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const returnUrl = params.get('return');
    if (returnUrl) {
      // Store return URL for after login
      sessionStorage.setItem('returnUrl', returnUrl);
    }
  }, []);

  const handleRequestOTP = () => {
    if (phoneNumber.length === 10) {
      setShowOtpInput(true);
    }
  };

  const handleVerifyOTP = () => {
    // TODO: Implement OTP verification
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const { data, error } = await authApi.login(email, password);
      if (error) {
        // Check if email needs verification
        if (data?.requiresVerification) {
          setRequiresVerification(true);
          setVerificationEmail(email);
          setLoginError('Please verify your email first');
        } else {
          setLoginError(error);
        }
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        showSuccess('Login successful! Welcome back!');
        
        // Redirect to return URL or home
        const returnUrl = sessionStorage.getItem('returnUrl');
        if (returnUrl) {
          sessionStorage.removeItem('returnUrl');
          window.location.hash = returnUrl.replace('#', '');
        } else {
          window.location.hash = '/';
        }
      }
    } catch (err) {
      setLoginError('Login failed. Please try again.');
      showError('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!acceptedTerms) {
      const message = 'Please accept Terms and Conditions to create your account';
      setLoginError(message);
      showError(message);
      return;
    }

    if (!name.trim()) {
      setLoginError('Please enter your name');
      return;
    }

    if (!email.trim()) {
      setLoginError('Please enter your email');
      return;
    }

    if (password.length < 6) {
      setLoginError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await authApi.register(email, password, name, phoneNumber || undefined);
      if (error) {
        setLoginError(error);
        setIsLoading(false);
        return;
      }

      if (data?.requiresVerification) {
        setRequiresVerification(true);
        setVerificationEmail(email);
        setIsLoading(false);
      } else if (data?.user) {
        // Redirect to return URL or home
        const returnUrl = sessionStorage.getItem('returnUrl');
        if (returnUrl) {
          sessionStorage.removeItem('returnUrl');
          window.location.hash = returnUrl.replace('#', '');
        } else {
          window.location.hash = '/';
        }
      }
    } catch (err) {
      setLoginError('Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSendVerificationCode = async () => {
    setIsSendingCode(true);
    setLoginError('');

    try {
      const { error } = await authApi.sendVerificationCode(verificationEmail);
      if (error) {
        setLoginError(error);
        showError(error);
      } else {
        setLoginError('');
        showSuccess('Verification code sent to your email!');
      }
    } catch (err) {
      setLoginError('Failed to send verification code. Please try again.');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setLoginError('Please enter a valid 6-digit verification code');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await authApi.verifyEmail(verificationEmail, verificationCode);
      if (error) {
        setLoginError(error);
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        showSuccess('Email verified successfully! Welcome!');
        
        // Redirect to return URL or home
        const returnUrl = sessionStorage.getItem('returnUrl');
        if (returnUrl) {
          sessionStorage.removeItem('returnUrl');
          window.location.hash = returnUrl.replace('#', '');
        } else {
          window.location.hash = '/';
        }
      }
    } catch (err) {
      setLoginError('Verification failed. Please try again.');
      showError('Verification failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSendingForgotPasswordOTP(true);

    if (!forgotPasswordEmail.trim()) {
      setLoginError('Please enter your email address');
      setIsSendingForgotPasswordOTP(false);
      return;
    }

    try {
      const { data, error } = await authApi.forgotPassword(forgotPasswordEmail);
      if (error) {
        setLoginError(error);
        showError(error);
      } else {
        setLoginError('');
        showSuccess('Password reset OTP sent to your email!');
        setForgotPasswordStep('otp');
      }
    } catch (err) {
      setLoginError('Failed to send password reset OTP. Please try again.');
      showError('Failed to send password reset OTP. Please try again.');
    } finally {
      setIsSendingForgotPasswordOTP(false);
    }
  };

  const handleResendForgotPasswordOTP = async () => {
    setIsSendingForgotPasswordOTP(true);
    setLoginError('');

    try {
      const { error } = await authApi.resendPasswordResetOTP(forgotPasswordEmail);
      if (error) {
        setLoginError(error);
        showError(error);
      } else {
        showSuccess('Password reset OTP resent to your email!');
      }
    } catch (err) {
      setLoginError('Failed to resend OTP. Please try again.');
    } finally {
      setIsSendingForgotPasswordOTP(false);
    }
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

    try {
      const { error } = await authApi.verifyPasswordResetOTP(forgotPasswordEmail, forgotPasswordOTP);
      if (error) {
        setLoginError(error);
        showError(error);
        setIsLoading(false);
        return;
      }

      showSuccess('OTP verified successfully!');
      setForgotPasswordStep('reset');
    } catch (err) {
      setLoginError('Failed to verify OTP. Please try again.');
      showError('Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    if (!forgotPasswordOTP.trim() || forgotPasswordOTP.length !== 6) {
      setLoginError('Please enter a valid 6-digit OTP');
      setIsLoading(false);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setLoginError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setLoginError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await authApi.resetPassword(forgotPasswordEmail, forgotPasswordOTP, newPassword);
      if (error) {
        setLoginError(error);
        setIsLoading(false);
        return;
      }

      showSuccess('Password reset successfully! You can now login with your new password.');
      
      // Reset form and go back to login
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
      setForgotPasswordOTP('');
      setNewPassword('');
      setConfirmPassword('');
      setForgotPasswordStep('email');
      setIsLoading(false);
    } catch (err) {
      setLoginError('Failed to reset password. Please try again.');
      showError('Failed to reset password. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AnnouncementBar />
      {/* <PanchangBar /> */}
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center text-[#1A1A1A] mb-2">
            Login to Continue
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Enter your login details to proceed with checkout
          </p>

          <div className="space-y-6">
            {/* Login Method Toggle */}
            <div className="flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 font-semibold transition-colors ${
                  loginMethod === 'email'
                    ? 'text-[#FF8C00] border-b-2 border-[#FF8C00]'
                    : 'text-gray-500'
                }`}
              >
                Email Login
              </button>
              <button
                onClick={() => setLoginMethod('otp')}
                className={`flex-1 py-2 font-semibold transition-colors ${
                  loginMethod === 'otp'
                    ? 'text-[#FF8C00] border-b-2 border-[#FF8C00]'
                    : 'text-gray-500'
                }`}
              >
                OTP Login
              </button>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{loginError}</p>
              </div>
            )}

            {showForgotPassword ? (
              <div className="space-y-4">
                {forgotPasswordStep === 'email' && (
                  <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-blue-800 text-sm font-semibold mb-1">Forgot Your Password?</p>
                      <p className="text-blue-700 text-xs">
                        Enter your email address and we'll send you an OTP to reset your password.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingForgotPasswordOTP}
                      className="w-full bg-[#FF8C00] text-white py-3 rounded-lg font-semibold hover:bg-[#e67e00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSendingForgotPasswordOTP ? 'Sending OTP...' : 'Send Reset OTP'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordEmail('');
                        setForgotPasswordOTP('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setForgotPasswordStep('email');
                      }}
                      className="w-full bg-white text-[#FF8C00] border-2 border-[#FF8C00] py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                    >
                      Back to Login
                    </button>
                  </form>
                )}

                {forgotPasswordStep === 'otp' && (
                  <form onSubmit={handleVerifyForgotPasswordOTP} className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-blue-800 text-sm font-semibold mb-1">OTP Sent!</p>
                      <p className="text-blue-700 text-xs">
                        We've sent a 6-digit OTP to <strong>{forgotPasswordEmail}</strong>. Please check your email.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Enter OTP</label>
                      <input
                        type="text"
                        value={forgotPasswordOTP}
                        onChange={(e) => setForgotPasswordOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit OTP"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] text-center text-2xl tracking-widest"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={forgotPasswordOTP.length !== 6 || isLoading}
                      className="w-full bg-[#FF8C00] text-white py-3 rounded-lg font-semibold hover:bg-[#e67e00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Verifying OTP...' : 'Verify OTP'}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleResendForgotPasswordOTP}
                        disabled={isSendingForgotPasswordOTP}
                        className="text-[#FF8C00] hover:underline text-sm disabled:opacity-50"
                      >
                        {isSendingForgotPasswordOTP ? 'Sending...' : "Didn't receive OTP? Resend"}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordStep('email');
                        setForgotPasswordOTP('');
                      }}
                      className="w-full bg-white text-[#FF8C00] border-2 border-[#FF8C00] py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                    >
                      Change Email
                    </button>
                  </form>
                )}

                {forgotPasswordStep === 'reset' && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-green-800 text-sm font-semibold mb-1">OTP Verified!</p>
                      <p className="text-green-700 text-xs">
                        Now create a new password for your account.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showResetPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password (min 6 characters)"
                          required
                          minLength={6}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                        />
                        <button type="button" onClick={() => setShowResetPassword((prev) => !prev)} className="absolute inset-y-0 right-0 px-4 text-gray-500">
                          {showResetPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showResetConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          required
                          minLength={6}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                        />
                        <button type="button" onClick={() => setShowResetConfirmPassword((prev) => !prev)} className="absolute inset-y-0 right-0 px-4 text-gray-500">
                          {showResetConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || newPassword.length < 6 || newPassword !== confirmPassword}
                      className="w-full bg-[#FF8C00] text-white py-3 rounded-lg font-semibold hover:bg-[#e67e00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? 'Resetting Password...' : 'Reset Password'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordStep('otp');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="w-full bg-white text-[#FF8C00] border-2 border-[#FF8C00] py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                    >
                      Back to OTP
                    </button>
                  </form>
                )}
              </div>
            ) : requiresVerification ? (
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800 text-sm">
                    We've sent a verification code to <strong>{verificationEmail}</strong>
                  </p>
                  <p className="text-blue-700 text-xs mt-1">
                    Please check your email and enter the 6-digit code below.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Code</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] text-center text-2xl tracking-widest"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full bg-[#FF8C00] text-white py-3 rounded-lg font-semibold hover:bg-[#e67e00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Verifying...' : 'Verify Email'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    disabled={isSendingCode}
                    className="text-[#FF8C00] hover:underline text-sm disabled:opacity-50"
                  >
                    {isSendingCode ? 'Sending...' : "Didn't receive code? Resend"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setRequiresVerification(false);
                    setVerificationCode('');
                    setVerificationEmail('');
                    setIsRegistering(false);
                  }}
                  className="w-full bg-white text-[#FF8C00] border-2 border-[#FF8C00] py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                >
                  Back to Registration
                </button>
              </form>
            ) : loginMethod === 'email' ? (
              <>
                {!isRegistering ? (
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                        />
                        <button type="button" onClick={() => setShowLoginPassword((prev) => !prev)} className="absolute inset-y-0 right-0 px-4 text-gray-500">
                          {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(true);
                          setForgotPasswordEmail(email);
                          setForgotPasswordStep('email');
                        }}
                        className="text-sm text-[#FF8C00] hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#FF8C00] text-white py-3 rounded-lg font-semibold hover:bg-[#e67e00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <LogIn size={20} />
                      {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRegistering(true)}
                      className="w-full bg-white text-[#FF8C00] border-2 border-[#FF8C00] py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                    >
                      Create New Account
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10 digit phone number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                      <div className="relative">
                        <input
                          type={showRegisterPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          required
                          minLength={6}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                        />
                        <button type="button" onClick={() => setShowRegisterPassword((prev) => !prev)} className="absolute inset-y-0 right-0 px-4 text-gray-500">
                          {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-4 h-4 text-[#FF8C00] border-gray-300 rounded focus:ring-[#FF8C00]"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I accept that I have read & understood{' '}
                <a href="#/privacy" className="text-[#FF8C00] hover:underline">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="#/terms" className="text-[#FF8C00] hover:underline">
                  T&Cs
                </a>
                .
              </label>
            </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#FF8C00] text-white py-3 rounded-lg font-semibold hover:bg-[#e67e00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegistering(false);
                        setLoginError('');
                      }}
                      className="w-full bg-white text-[#FF8C00] border-2 border-[#FF8C00] py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                    >
                      Back to Login
                    </button>
                  </form>
                )}
              </>
            ) : !showOtpInput ? (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Number</label>
                    <div className="relative">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-r border-gray-300">
                          <MessageCircle size={20} className="text-green-600" />
                          <span className="text-[#1A1A1A]">+91</span>
                        </div>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="Enter WhatsApp number"
                          className="flex-1 px-4 py-3 outline-none focus:border-[#FF8C00]"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Enter your WhatsApp number to receive OTP</p>
                  </div>
                </div>

                <button
                  onClick={handleRequestOTP}
                  disabled={phoneNumber.length !== 10}
                  className="w-full bg-[#FF8C00] text-white py-3 rounded-lg font-semibold hover:bg-[#e67e00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <MessageCircle size={20} />
                  Request OTP via WhatsApp
                  <ArrowRight size={20} />
                </button>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Enter OTP</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] text-center text-2xl tracking-widest"
                    />
                    <p className="text-xs text-gray-500 mt-1">OTP sent to WhatsApp: +91 {phoneNumber}</p>
                  </div>
                </div>

                <button
                  onClick={handleVerifyOTP}
                  disabled={otp.length !== 6}
                  className="w-full bg-[#FF8C00] text-white py-3 rounded-lg font-semibold hover:bg-[#e67e00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verify OTP
                </button>

                <button
                  onClick={() => {
                    setShowOtpInput(false);
                    setOtp('');
                  }}
                  className="w-full text-[#FF8C00] hover:underline"
                >
                  Change WhatsApp Number
                </button>
              </>
            )}

           
          </div>
        </div>

        <div className="mt-16 bg-[#FF8C00] text-white rounded-lg p-8">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-serif italic mb-2">
                Sign up for latest news, events and offers
              </h2>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="your email@email.com"
                className="flex-1 md:w-80 px-4 py-3 rounded-l-full text-[#1A1A1A] outline-none"
              />
              <button className="bg-[#1A1A1A] text-white px-8 py-3 rounded-r-full font-semibold hover:bg-black transition-colors">
                SIGN UP
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
