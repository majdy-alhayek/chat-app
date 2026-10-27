import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, MessageSquare, ArrowRight } from 'lucide-react';
import './Login.css';

export default function Login({ logoSrc, onLoginSuccess }) {
  const [animState, setAnimState] = useState('rising');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // مسار الصورة من مجلد public (تأكد من مطابقة اسم وامتداد الصورة هنا)
  const logo = logoSrc || '/logo.jpeg';

  useEffect(() => {
    // 1. مرحلة الصعود والتوقف في المنتصف لمدة 1 ثانية
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
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess({ email, password });
      } else {
        alert(`تم تسجيل الدخول بنجاح بحساب: ${email}`);
      }
    }, 1200);
  };

  return (
    <div className="login-container">
      <div className="login-bg-glow-1" />
      <div className="login-bg-glow-2" />

      {/* 1. أنيميشن الشعار الترحيبي (صعود وثبات 1 ثانية ثم انتقال للفورم) */}
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
                  // إذا حدث خطأ في تحميل الصورة يتم إظهار الأيقونة الاحتياطية بدلاً من كسر التصميم
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

      {/* 2. نموذج تسجيل الدخول */}
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
            <h1 className="login-title">تسجيل الدخول</h1>
            <p className="login-subtitle">مرحباً بك مجدداً في ChitChat</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" dir="ltr">
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

            <button
              type="submit"
              disabled={isLoading}
              className="submit-btn"
            >
              {isLoading ? (
                <div className="spinner" />
              ) : (
                <>
                  <span>Log in</span>
                  <ArrowRight style={{ width: '1rem', height: '1rem' }} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}