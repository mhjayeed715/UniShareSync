import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OtpVerificationPage from './pages/OtpVerificationPage';
import AppLayout from './pages/AppLayout';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
  const [page, setPage] = useState('landing');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsAuthenticated(true);
      setUserRole(JSON.parse(user).role);
    }
  }, []);

  const handleNavigate = (newPage) => {
    setPage(newPage);
  };
  
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    const user = localStorage.getItem('user');
    if (user) {
      setUserRole(JSON.parse(user).role);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
    setPage('landing');
  }

  const renderPage = () => {
    if (isAuthenticated) {
      // Show AdminDashboard for admin users, AppLayout for regular users
      if (userRole === 'ADMIN') {
        return <AdminDashboard />;
      }
      return <AppLayout onLogout={handleLogout} />;
    }

    switch (page) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} setUserEmail={setUserEmail} setUserId={setUserId} />;
      case 'signup':
        return <SignupPage onNavigate={handleNavigate} />;
      case 'otp':
        return <OtpVerificationPage onNavigate={handleNavigate} onVerify={handleLoginSuccess} userEmail={userEmail} userId={userId} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="App">
      <Toaster />
      {renderPage()}
    </div>
  );
};

export default App;
