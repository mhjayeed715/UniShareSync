import React, { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, GraduationCap } from 'lucide-react';

const SignupPage = ({ onNavigate }) => {
  const [role, setRole] = useState('student');

  return (
    <div className="min-h-screen flex bg-brand-light py-10 px-4">
      <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8">
          <button onClick={() => onNavigate('landing')} className="flex items-center text-sm text-brand-gray hover:text-brand-blue mb-6">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
          </button>

      <div className="text-center mb-8">
        <img
          src="/unisharesync.png"
          alt="UniShareSync Logo"
          className="h-12 w-auto mx-auto mb-4"
        />
        <h2 className="text-2xl font-bold text-brand-blue">Create your account</h2>
        <p className="text-brand-gray mt-2">Join the UniShareSync community today</p>
      </div>

          <form className="space-y-5">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl mb-6">
              {['student', 'faculty'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                    role === r 
                      ? 'bg-white text-brand-blue shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal outline-none" placeholder="Mehrab Hossain" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">University Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="email" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal outline-none" placeholder="yourname@university.ac.bd" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="password" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal outline-none" placeholder="••••••••" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="password" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal outline-none" placeholder="••••••••" />
                </div>
              </div>
            </div>

            {/* Dynamic Fields based on Role */}
            {role === 'student' && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                   <label className="block text-sm font-medium text-brand-dark mb-1">Department</label>
                   <select className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
                     <option>Computer Science & Engineering</option>
                     <option>Bachelor of Business Administration</option>
                     <option>Bachelor of Law</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-brand-dark mb-1">Year</label>
                   <select className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
                     <option>1st Year</option>
                     <option>2nd Year</option>
                     <option>3rd Year</option>
                     <option>4th Year</option>
                   </select>
                </div>
              </div>
            )}

            {role === 'faculty' && (
              <div className="pt-2 border-t border-gray-100">
                 <label className="block text-sm font-medium text-brand-dark mb-1">Designation</label>
                 <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal outline-none" placeholder="e.g. Associate Professor" />
              </div>
            )}

            <div className="flex items-start pt-2">
              <input type="checkbox" className="mt-1 w-4 h-4 text-brand-teal rounded border-gray-300 focus:ring-brand-teal"/>
              <span className="ml-2 text-xs text-brand-gray">
                I agree to the <a href="#" className="text-brand-teal underline">Terms of Service</a> and <a href="#" className="text-brand-teal underline">Privacy Policy</a>.
              </span>
            </div>

            <button type="submit" className="w-full py-3 rounded-lg bg-brand-blue text-white font-semibold hover:bg-blue-900 shadow-md hover:shadow-lg transition-all">
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-brand-gray text-sm">
              Already have an account?{' '}
              <button onClick={() => onNavigate('login')} className="font-semibold text-brand-teal hover:underline">
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;