import React, { useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Notification from './components/Notification';

export default function App() {
  const [currentView, setCurrentView] = useState('login');
  const [notification, setNotification] = useState(null); // { message, type }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  return (
    <div>
      {/* عرض مكون الإشعار بشكل عائم عند وجود أي رسالة */}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      {currentView === 'login' ? (
        <Login 
          onNavigateToSignup={() => setCurrentView('signup')} 
          onLoginSuccess={(data) => {
            showNotification(`تم تسجيل الدخول بنجاح بحساب: ${data.email}`, 'success');
          }}
          onError={(msg) => showNotification(msg, 'error')}
        />
      ) : (
        <Signup 
          onNavigateToLogin={() => setCurrentView('login')} 
          onSignupSuccess={(data) => {
            showNotification(`تم إنشاء الحساب بنجاح للمستخدم: ${data.name}`, 'success');
            setTimeout(() => setCurrentView('login'), 1500); // التوجيه لصفحة تسجيل الدخول تلقائياً
          }}
          onError={(msg) => showNotification(msg, 'error')}
        />
      )}
    </div>
  );
}