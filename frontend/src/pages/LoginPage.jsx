import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = ({ onNavigate, onLoginSuccess, setUserEmail, setUserId }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const loadingToast = toast.loading('Logging in...');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await res.json();
      } catch (err) {
        throw new Error('Server returned an invalid response. Please try again later.');
      }
      
      toast.dismiss(loadingToast);

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Admin login: token and user are returned directly
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success(data.message || 'Admin login successful!');
        onLoginSuccess();
      } else { // Regular user: OTP flow
        setUserEmail(email);
        if (data.userId) {
            setUserId(data.userId);
        }
        toast.success(data.message || 'OTP sent to your email');
        onNavigate('otp');
      }

    } catch (err) {
      toast.dismiss(loadingToast);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-brand-light">
      <div className="hidden lg:flex w-1/2 bg-brand-blue p-12 flex-col justify-between relative overflow-hidden">
         <div className="z-10">
          <img src="/unisharesync.png" alt="UniShareSync Logo" className="h-12 w-auto"/>
          <h1 className="text-4xl font-bold text-white mt-8 leading-tight">
            Connecting University Minds, <br/> One File at a Time.
          </h1>
          <p className="text-gray-200 mt-4 max-w-lg">
            Join a secure, unified platform for students and faculty to share and manage academic resources effortlessly.
          </p>
        </div>
        <div className="z-10 text-sm text-gray-300">
          © 2026 UniShareSync. All Rights Reserved.
        </div>
        {/* Background decorative elements */}
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-white/10 rounded-full"></div>
        <div className="absolute top-1/2 -left-36 w-96 h-96 border-4 border-white/20 rounded-full"></div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <button onClick={() => onNavigate('landing')} className="flex items-center text-sm text-brand-gray hover:text-brand-blue mb-8">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
          </button>
          
          <h2 className="text-2xl font-bold text-brand-blue mb-2">Login to UniShareSync</h2>
          <p className="text-brand-gray mb-8">Please enter your university credentials.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">University Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@university.ac.bd"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal transition-all outline-none"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-brand-teal rounded border-gray-300 focus:ring-brand-teal"/>
                <span className="ml-2 text-sm text-brand-gray">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-brand-teal hover:text-teal-700">Forgot password?</a>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-semibold transition-all ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-blue hover:bg-blue-900 shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? 'Requesting OTP...' : 'Login'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-brand-gray text-sm">
              New to UniShareSync?{' '}
              <button onClick={() => onNavigate('signup')} className="font-semibold text-brand-teal hover:underline">
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
