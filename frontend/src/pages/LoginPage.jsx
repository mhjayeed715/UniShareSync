import React, { useState } from 'react';
import { Mail, Lock, Users, ArrowLeft } from 'lucide-react';

const LoginPage = ({ onNavigate, onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onLogin(); // Trigger app entry
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-brand-light">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-brand-blue p-12 flex-col justify-between relative overflow-hidden">
    <div className="z-10">
      {/* Logo and Brand Name */}
      <div className="flex items-center gap-3 mb-8">
        <img 
          src="/unisharesync.png"
          alt="UniShareSync Logo"
          className="h-10 w-auto" 
        />
        <span className="text-2xl font-bold text-white">UniShareSync</span>
      </div>

          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            Welcome back to your <br/> digital campus.
          </h1>
          <ul className="space-y-4 text-blue-100">
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-brand-teal"></div>
              Access shared course resources
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-brand-teal"></div>
              Track your projects and deadlines
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-brand-teal"></div>
              Stay updated with smart notifications
            </li>
          </ul>
        </div>
        <div className="z-10 text-blue-200 text-sm">
          © 2025 UniShareSync
        </div>
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-teal rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Right Side - Form */}
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
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal transition-all outline-none"
                />
              </div>
            </div>

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
              {loading ? 'Authenticating...' : 'Login'}
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