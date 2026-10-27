import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Eye, EyeOff, MessageSquare, ArrowRight } from 'lucide-react';
import './Login.css';

export default function Login({ logoSrc, onLoginSuccess, onRegisterSuccess }) {
  const [animState, setAnimState] = useState('rising');
  const [isRegisterMode, setIsRegisterMode] = useState(false); // للتبديل بين تسجيل الدخول وإنشاء حساب
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const logo = logoSrc || '/logo.jpeg';

  useEffect(() => {
    const riseTimer = setTimeout(() => {
      setAnimState('holding');
    }, 800);

    const holdTimer = setTimeout(() => {
      setAnimState('done');
    }, 1800);

    return () => {
      clearTimeout(riseTimer);
      clearTimeout(holdTimer);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isRegisterMode && password !== confirmPassword) {
      alert('كلمتا المرور غير متطابقتين!');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (isRegisterMode) {
        if (onRegisterSuccess) {
          onRegisterSuccess({ name, email, password });
        } else {
          alert(`تم إنشاء الحساب بنجاح للمستخدم: ${name}`);
        }
      } else {
        if (onLoginSuccess) {
          onLoginSuccess({ email, password });
        } else {
          alert(`تم تسجيل الدخول بنجاح بحساب: ${email}`);
        }
      }
    }, 1200);
  };

  return (
    <div className="login-container">
      <div className="login-bg-glow-1" />
      <div className="login-bg-glow-2" />

      {/* 1. أنيميشن الشعار الترحيبي */}
      {animState !== 'done' && (
        <div className="splash-overlay">
          <div className={`splash-logo-wrapper ${animState}`}>
            <div style={{ position: 'relative' }}>
              <div className="logo-glow-effect" />
              <img
                src={logo}
                alt="ChitChat Logo"
                className="app-logo-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="app-logo-fallback" style={{ display: 'none' }}>
                <MessageSquare style={{ width: '2.5rem', height: '2.5rem', color: '#ffffff' }} />
              </div>
            </div>
            <span className="splash-title">ChitChat</span>
          </div>
        </div>
      )}

      {/* 2. نموذج تسجيل الدخول أو إنشاء حساب */}
      <div className={`login-form-container ${animState === 'done' ? 'visible-form' : 'hidden-form'}`}>
        <div className="login-card">
          <div className="login-card-top-bar" />

          <div className="login-header">
            <div className="form-logo-wrapper">
              <div className="form-logo-glow" />
              <img
                src={logo}
                alt="ChitChat Logo"
                className="form-logo-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="form-logo-fallback" style={{ display: 'none' }}>
                <MessageSquare style={{ width: '2rem', height: '2rem', color: '#ffffff' }} />
              </div>
            </div>
            <h1 className="login-title">
              {isRegisterMode ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </h1>
            <p className="login-subtitle">
              {isRegisterMode ? 'انضم إلى عائلة ChitChat اليوم' : 'مرحباً بك مجدداً في ChitChat'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" dir="ltr">
            {/* حقل الاسم (يظهر فقط في حالة إنشاء حساب) */}
            {isRegisterMode && (
              <div className="input-group">
                <label className="input-label">Name</label>
                <div className="input-wrapper">
                  <div className="input-icon-left">
                    <User style={{ width: '1.25rem', height: '1.25rem' }} />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="input-field"
                  />
                </div>
              </div>
            )}

            {/* حقل البريد الإلكتروني */}
            <div className="input-group">
              <label className="input-label">Email</label>
              <div className="input-wrapper">
                <div className="input-icon-left">
                  <Mail style={{ width: '1.25rem', height: '1.25rem' }} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="input-field"
                />
              </div>
            </div>

            {/* حقل كلمة المرور */}
            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <div className="input-icon-left">
                  <Lock style={{ width: '1.25rem', height: '1.25rem' }} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field with-right-icon"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-btn"
                >
                  {showPassword ? <EyeOff style={{ width: '1.25rem', height: '1.25rem' }} /> : <Eye style={{ width: '1.25rem', height: '1.25rem' }} />}
                </button>
              </div>
            </div>

            {/* حقل تأكيد كلمة المرور (يظهر فقط في حالة إنشاء حساب) */}
            {isRegisterMode && (
              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <div className="input-wrapper">
                  <div className="input-icon-left">
                    <Lock style={{ width: '1.25rem', height: '1.25rem' }} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field with-right-icon"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle-btn"
                  >
                    {showConfirmPassword ? <EyeOff style={{ width: '1.25rem', height: '1.25rem' }} /> : <Eye style={{ width: '1.25rem', height: '1.25rem' }} />}
                  </button>
                </div>
              </div>
            )}

            {/* زر الإرسال */}
            <button
              type="submit"
              disabled={isLoading}
              className="submit-btn"
            >
              {isLoading ? (
                <div className="spinner" />
              ) : (
                <>
                  <span>{isRegisterMode ? 'Sign up' : 'Log in'}</span>
                  <ArrowRight style={{ width: '1rem', height: '1rem' }} />
                </>
              )}
            </button>
          </form>

          {/* رابط التبديل بين تسجيل الدخول وإنشاء حساب */}
          <div className="auth-switch-text" dir="rtl">
            {isRegisterMode ? (
              <>
                لديك حساب بالفعل؟
                <button
                  onClick={() => setIsRegisterMode(false)}
                  className="auth-switch-link"
                >
                  تسجيل الدخول
                </button>
              </>
            ) : (
              <>
                ليس لديك حساب؟
                <button
                  onClick={() => setIsRegisterMode(true)}
                  className="auth-switch-link"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}