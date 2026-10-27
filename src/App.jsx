import React from 'react';
import Login from './components/Login';

function App() {
  const handleLoginSuccess = (credentials) => {
    console.log("تم تسجيل الدخول بالبيانات:", credentials);
    // يمكنك هنا توجيه المستخدم لصفحة المحادثات الرئيسية
  };

  return (
    <Login 
      logoSrc="/path-to-your-logo.png" // يمكنك تمرير مسار صورتك هنا
      onLoginSuccess={handleLoginSuccess} 
    />
  );
}

export default App;