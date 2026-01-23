import React, { useState, useRef } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const OtpVerificationPage = ({ onNavigate, onVerify, userEmail, userId }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputsRef = useRef([]);

  // Get remember me preference from localStorage
  const rememberMe = localStorage.getItem('rememberMe') === 'true';

  const handleInputChange = (e, index) => {
    const { value } = e.target;
    if (/^[0-9]$/.test(value) || value === '') {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value !== '' && index < 5) {
        inputsRef.current[index + 1].focus();
      }
      
      // Auto-submit if all fields are filled
      if (value !== '' && newOtp.every(digit => digit !== '')) {
        submitOtp(newOtp.join(''));
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.every(char => /^[0-9]$/.test(char))) {
      const newOtp = [...otp];
      pastedData.forEach((digit, index) => {
        if (index < 6) newOtp[index] = digit;
      });
      setOtp(newOtp);
      
      // Focus the next empty input or the last one
      const nextIndex = pastedData.length < 6 ? pastedData.length : 5;
      inputsRef.current[nextIndex].focus();

      // Auto-submit if all fields are filled
      if (newOtp.every(digit => digit !== '')) {
        submitOtp(newOtp.join(''));
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const submitOtp = async (otpCode) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp: otpCode, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      toast.success('Login successful!');
      onVerify();

    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      // Clear OTP on error for better UX? Optional.
      // setOtp(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
      // Clean up remember me preference
      localStorage.removeItem('rememberMe');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }
    submitOtp(otpCode);
  };
  
  const handleResendOtp = async () => {
    toast.loading('Resending OTP...');
    try {
        const res = await fetch('http://localhost:5000/api/auth/resend-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Failed to resend OTP');
        }

        toast.success('A new OTP has been sent to your email.');
    } catch (err) {
        toast.error(err.message);
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-light p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <button onClick={() => onNavigate('login')} className="flex items-center text-sm text-brand-gray hover:text-brand-blue mb-8">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
        </button>

        <div className="text-center mb-8">
          <div className="inline-block bg-brand-teal p-3 rounded-full mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-brand-blue">Check Your Email</h2>
          <p className="text-brand-gray mt-2">
            We've sent a 6-digit verification code to <br />
            <span className="font-semibold text-brand-dark">{userEmail || 'your email'}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputsRef.current[index] = el}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleInputChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}                onPaste={handlePaste}                className="w-12 h-14 text-center text-2xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal transition-all outline-none"
              />
            ))}
          </div>
          
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

          <div className="mb-4">
            <label className="flex items-center justify-center">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-brand-teal rounded border-gray-300 focus:ring-brand-teal"
              />
              <span className="ml-2 text-sm text-brand-gray">Remember me for 24 hours</span>
            </label>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-all ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-blue hover:bg-blue-900 shadow-md hover:shadow-lg'
            }`}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-brand-gray">
            Didn't receive the code?{' '}
            <button onClick={handleResendOtp} className="font-semibold text-brand-teal hover:underline">
              Resend
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationPage;
