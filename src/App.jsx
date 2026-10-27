import React, { useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';

export default function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login' أو 'signup'

  return (
    <div>
      {currentView === 'login' ? (
        <Login 
          onNavigateToSignup={() => setCurrentView('signup')} 
          onLoginSuccess={(data) => console.log('Logged in:', data)}
        />
      ) : (
        <Signup 
          onNavigateToLogin={() => setCurrentView('login')} 
          onSignupSuccess={(data) => console.log('Signed up:', data)}
        />
      )}
    </div>
  );
}