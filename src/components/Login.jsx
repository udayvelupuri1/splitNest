import React, { useState, useEffect } from 'react';
import { Phone, Key, ArrowRight, User, UserPlus, LogIn } from 'lucide-react';
import { setupRecaptcha, sendOTP, verifyOTP } from '../services/authService';
import { findUserByMobileOrUniqueId } from '../services/userService';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const { setUser } = useAuth();

  useEffect(() => {
    const verifier = setupRecaptcha('recaptcha-container');
    setRecaptchaVerifier(verifier);
    
    return () => {
      if (verifier) {
        verifier.clear();
      }
    };
  }, []);

  const resetForm = () => {
    setName('');
    setMobile('');
    setOtp('');
    setShowOTP(false);
    setError('');
    setConfirmationResult(null);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleSendOTP = async () => {
    if (!mobile || !recaptchaVerifier) return;
    
    setLoading(true);
    setError('');
    
    try {
      // For signin, check if user exists
      if (mode === 'signin') {
        const existingUser = await findUserByMobileOrUniqueId(mobile);
        if (!existingUser) {
          setError('User not found. Please sign up first.');
          setLoading(false);
          return;
        }
      }
      
      // For signup, check if user already exists
      if (mode === 'signup') {
        const existingUser = await findUserByMobileOrUniqueId(mobile);
        if (existingUser) {
          setError('User already exists. Please sign in instead.');
          setLoading(false);
          return;
        }
      }

      const phoneNumber = `+91${mobile}`;
      const confirmation = await sendOTP(phoneNumber, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setShowOTP(true);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || !confirmationResult) return;
    
    setLoading(true);
    setError('');
    
    try {
      if (mode === 'signup') {
        await verifyOTP(confirmationResult, otp, mobile, name);
      } else {
        // For signin, just verify OTP and sign in existing user
        await verifyOTP(confirmationResult, otp, mobile, '');
      }
      // User will be automatically set by AuthContext
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SplitNest</h1>
          <p className="text-gray-600">Split expenses, simplified</p>
        </div>

        {!showOTP ? (
          <>
            {/* Mode Selection Buttons */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => switchMode('signin')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  mode === 'signin'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LogIn className="h-4 w-4 inline mr-2" />
                Sign In
              </button>
              <button
                onClick={() => switchMode('signup')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  mode === 'signup'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <UserPlus className="h-4 w-4 inline mr-2" />
                Sign Up
              </button>
            </div>

            <div className="space-y-6">
              {/* Name field - only for signup */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    maxLength={10}
                  />
                </div>
              </div>

              <button
                onClick={handleSendOTP}
                disabled={
                  loading || 
                  mobile.length !== 10 || 
                  (mode === 'signup' && !name.trim())
                }
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {mode === 'signup' ? 'Complete Registration' : 'Verify Your Number'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Enter the OTP sent to +91{mobile}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  maxLength={6}
                />
              </div>
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  {mode === 'signup' ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>

            <button
              onClick={() => setShowOTP(false)}
              className="w-full text-gray-600 hover:text-gray-800 transition-colors"
            >
              Change mobile number
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div id="recaptcha-container" style={{ position: 'absolute', left: '-9999px' }}></div>
      </div>
    </div>
  );
};

export default Login;