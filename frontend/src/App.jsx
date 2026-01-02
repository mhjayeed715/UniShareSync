import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OtpVerificationPage from './pages/OtpVerificationPage';
import AppLayout from './pages/AppLayout';

const App = () => {
  const [page, setPage] = useState('landing');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleNavigate = (newPage) => {
    setPage(newPage);
  };
  
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPage('login');
  }

  const renderPage = () => {
    if (isAuthenticated) {
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
