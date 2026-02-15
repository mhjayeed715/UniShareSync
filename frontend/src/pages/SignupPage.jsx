import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Building2, X } from 'lucide-react';

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900/75 backdrop-blur-sm" onClick={onClose}></div>
        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-brand-teal">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/departments`);
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

    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      setLoading(false);
      return;
    }

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
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/auth/signup`, {
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
              <label className="block text-sm font-medium text-brand-dark mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal outline-none" placeholder="yourname@gmail.com" />
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
              <input 
                type="checkbox" 
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-brand-teal rounded border-gray-300 focus:ring-brand-teal cursor-pointer"
              />
              <span className="ml-2 text-xs text-gray-600">
                I agree to the{' '}
                <button 
                  type="button" 
                  onClick={() => openModal('terms')} 
                  className="text-brand-teal font-medium hover:underline"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button 
                  type="button" 
                  onClick={() => openModal('privacy')} 
                  className="text-brand-teal font-medium hover:underline"
                >
                  Privacy Policy
                </button>.
              </span>
            </div>

            <button 
              type="submit" 
              disabled={loading || !agreedToTerms} 
              className={`w-full py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all ${
                agreedToTerms 
                  ? 'bg-brand-blue text-white hover:bg-blue-900' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
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

      {/* Privacy Policy Modal */}
      <Modal isOpen={activeModal === 'privacy'} onClose={closeModal} title="Privacy Policy">
        <div className="space-y-6 text-sm">
          <p className="text-gray-500">Last updated: February 2026</p>
          <div className="space-y-4">
            <section>
              <h4 className="font-bold text-gray-900 mb-2">1. Information We Collect</h4>
              <p className="text-gray-600">We collect information you provide directly, including your name, email address, student/faculty ID, and profile information. We also collect data about your usage of the platform to improve our services.</p>
            </section>
            <section>
              <h4 className="font-bold text-gray-900 mb-2">2. How We Use Your Information</h4>
              <p className="text-gray-600">Your information is used to provide and improve our services, communicate with you about updates and features, and ensure platform security. We never sell your personal data to third parties.</p>
            </section>
            <section>
              <h4 className="font-bold text-gray-900 mb-2">3. Data Security</h4>
              <p className="text-gray-600">We implement industry-standard security measures including encryption, secure authentication (JWT), and role-based access control to protect your data.</p>
            </section>
            <section>
              <h4 className="font-bold text-gray-900 mb-2">4. Your Rights</h4>
              <p className="text-gray-600">You have the right to access, update, or delete your personal information at any time through your profile settings. You can also request a copy of your data by contacting us.</p>
            </section>
            <section>
              <h4 className="font-bold text-gray-900 mb-2">5. Cookies</h4>
              <p className="text-gray-600">We use essential cookies to maintain your session and preferences. No third-party tracking cookies are used.</p>
            </section>
            <section>
              <h4 className="font-bold text-gray-900 mb-2">6. Contact</h4>
              <p className="text-gray-600">For privacy-related inquiries, contact us at mehrabjayeed715@gmail.com</p>
            </section>
          </div>
        </div>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal isOpen={activeModal === 'terms'} onClose={closeModal} title="Terms of Service">
        <div className="space-y-6 text-sm">
          <p className="text-gray-500">Last updated: February 2026</p>
          <div className="space-y-4">
            <section>
              <h4 className="font-bold text-gray-900 mb-2">1. Acceptance of Terms</h4>
              <p className="text-gray-600">By using UniShareSync, you agree to these terms of service. If you do not agree, please do not use the platform.</p>
            </section>
            <section>
              <h4 className="font-bold text-gray-900 mb-2">2. User Responsibilities</h4>
              <p className="text-gray-600">Users must provide accurate information, respect intellectual property rights, and not upload harmful or inappropriate content. You are responsible for maintaining the security of your account.</p>
            </section>
            <section>
              <h4 className="font-bold text-gray-900 mb-2">3. Content Guidelines</h4>
              <p className="text-gray-600">All uploaded resources must be educational in nature. Plagiarized or copyrighted content without permission is strictly prohibited. Admin reserves the right to remove inappropriate content.</p>
            </section>
            <section>
              <h4 className="font-bold text-gray-900 mb-2">4. Account Termination</h4>
              <p className="text-gray-600">We reserve the right to suspend or terminate accounts that violate these terms or engage in abusive behavior.</p>
            </section>
            <section>
              <h4 className="font-bold text-gray-900 mb-2">5. Limitation of Liability</h4>
              <p className="text-gray-600">UniShareSync is provided "as is" without warranties. We are not liable for any damages arising from your use of the platform.</p>
            </section>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SignupPage;
