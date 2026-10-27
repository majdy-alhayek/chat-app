import React, { useState } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Notification from "./components/Notification";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [currentView, setCurrentView] = useState("login"); // 'login', 'signup', 'dashboard'
  const [currentUser, setCurrentUser] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
  };

  // إذا قام المستخدم بتسجيل الدخول أو إنشاء حساب بنجاح
  if (currentView === "dashboard") {
    return (
      <Dashboard
        user={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          setCurrentView("login");
          showNotification("تم تسجيل الخروج بنجاح", "info");
        }}
      />
    );
  }

  return (
    <div>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {currentView === "login" ? (
        <Login
          onNavigateToSignup={() => setCurrentView("signup")}
          onLoginSuccess={(data) => {
            setCurrentUser(data);
            setCurrentView("dashboard");
            showNotification(
              `تم تسجيل الدخول بنجاح بحساب: ${data.email}`,
              "success",
            );
          }}
          onError={(msg) => showNotification(msg, "error")}
        />
      ) : (
        <Signup
          onNavigateToLogin={() => setCurrentView("login")}
          onSignupSuccess={(data) => {
            setCurrentUser(data);
            showNotification(
              `تم إنشاء الحساب بنجاح للمستخدم: ${data.name}`,
              "success",
            );
            setTimeout(() => setCurrentView("dashboard"), 1000);
          }}
          onError={(msg) => showNotification(msg, "error")}
        />
      )}
    </div>
  );
}
