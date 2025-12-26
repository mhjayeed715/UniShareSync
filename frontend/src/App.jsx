import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AppLayout from './pages/AppLayout';

function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // landing, login, signup, app

  const renderPage = () => {
    switch(currentPage) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentPage} />;
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} onLogin={() => setCurrentPage('app')} />;
      case 'signup':
        return <SignupPage onNavigate={setCurrentPage} />;
      case 'app':
        return <AppLayout onLogout={() => setCurrentPage('landing')} />;
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <>
      {renderPage()}
    </>
  );
}

export default App;