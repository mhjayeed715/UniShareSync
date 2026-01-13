import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Building2 } from 'lucide-react';

const SignupPage = ({ onNavigate, setUserEmail, setUserId }) => {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/departments');
      const data = await res.json();
      console.log('Departments fetched:', data);
      if (data.success) {
        setDepartments(data.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (role === 'faculty' && !designation.trim()) {
      setError('Designation is required for faculty signup');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, designation: designation.trim(), department: department.trim() }),
      });

      let data;
      try {
        data = await res.json();
      } catch (err) {
        throw new Error('Server returned an invalid response. Please try again later.');
      }

      if (!res.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Navigate to login page after successful signup
      onNavigate('login');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

          <form onSubmit={handleSubmit} className="space-y-5">
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
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal outline-none" placeholder="Mehrab Hossain" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">University Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal outline-none" placeholder="yourname@university.ac.bd" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">Department</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal outline-none appearance-none bg-white"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {role === 'faculty' && (
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">Designation</label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal outline-none"
                  placeholder="Assistant Professor, Department of CSE"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal outline-none" 
                    placeholder="••••••••" 
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
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    required 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal outline-none" 
                    placeholder="••••••••" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="flex items-start pt-2">
              <input type="checkbox" required className="mt-1 w-4 h-4 text-brand-teal rounded border-gray-300 focus:ring-brand-teal"/>
              <span className="ml-2 text-xs text-brand-gray">
                I agree to the <a href="#" className="text-brand-teal underline">Terms of Service</a> and <a href="#" className="text-brand-teal underline">Privacy Policy</a>.
              </span>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-brand-blue text-white font-semibold hover:bg-blue-900 shadow-md hover:shadow-lg transition-all">
              {loading ? 'Creating Account...' : 'Create Account'}
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
