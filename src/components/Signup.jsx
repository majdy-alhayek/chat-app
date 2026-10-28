import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import "./Signup.css";

export default function Signup({
  logoSrc,
  onSignupSuccess,
  onNavigateToLogin,
  onError,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // حالات خاصة بنظام التحقق (OTP)
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const logo = logoSrc || "/logo.jpeg";

  // 1. دالة إرسال التسجيل
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      if (onError) onError("كلمتا المرور غير متطابقتين!");
      return;
    }

    setIsLoading(true);
    if (onError) onError(""); // مسح الأخطاء السابقة

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "فشل إنشاء الحساب");
      }

      setIsLoading(false);
      setSuccessMessage(data.message || "تم إرسال رمز التحقق إلى بريدك الإلكتروني");
      setIsVerificationStep(true); // الانتقال لواجهة إدخال الرمز
    } catch (err) {
      setIsLoading(false);
      if (onError) onError(err.message);
    }
  };

  // 2. دالة التحقق من الرمز
  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (onError) onError("");

    try {
      const response = await fetch("http://localhost:5000/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "رمز التحقق غير صحيح");
      }

      setIsLoading(false);
      alert("تم تفعيل الحساب بنجاح!");
      
      if (onSignupSuccess) {
        onSignupSuccess(data.user);
      } else if (onNavigateToLogin) {
        onNavigateToLogin();
      }
    } catch (err) {
      setIsLoading(false);
      if (onError) onError(err.message);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-bg-glow-1" />
      <div className="signup-bg-glow-2" />

      <div className="signup-form-container">
        <div className="signup-card">
          <div className="signup-card-top-bar" />

          <div className="signup-header">
            <div className="form-logo-wrapper">
              <div className="form-logo-glow" />
              <img src={logo} alt="ChitChat Logo" className="form-logo-img" />
            </div>
            <h1 className="signup-title">
              {isVerificationStep ? "التحقق من البريد الإلكتروني" : "إنشاء حساب جديد"}
            </h1>
            <p className="signup-subtitle">
              {isVerificationStep 
                ? "أدخل رمز التحقق المكون من 6 أرقام المرسل إلى بريدك" 
                : "انضم إلى عائلة ChitChat اليوم"}
            </p>
          </div>

          {successMessage && (
            <p style={{ color: '#4ade80', fontSize: '0.75rem', textAlign: 'center', marginBottom: '0.75rem', backgroundColor: 'rgba(74, 222, 128, 0.1)', padding: '0.5rem', borderRadius: '0.375rem' }}>
              {successMessage}
            </p>
          )}

          {!isVerificationStep ? (
            // نموذج التسجيل الأساسي
            <form onSubmit={handleSubmit} className="signup-form" dir="ltr">
              <div className="input-group">
                <label className="input-label">Name</label>
                <div className="input-wrapper">
                  <div className="input-icon-left">
                    <User style={{ width: "1.1rem", height: "1.1rem" }} />
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

              <div className="input-group">
                <label className="input-label">Email</label>
                <div className="input-wrapper">
                  <div className="input-icon-left">
                    <Mail style={{ width: "1.1rem", height: "1.1rem" }} />
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
                    <Lock style={{ width: "1.1rem", height: "1.1rem" }} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
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
                    {showPassword ? (
                      <EyeOff style={{ width: "1.1rem", height: "1.1rem" }} />
                    ) : (
                      <Eye style={{ width: "1.1rem", height: "1.1rem" }} />
                    )}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <div className="input-wrapper">
                  <div className="input-icon-left">
                    <Lock style={{ width: "1.1rem", height: "1.1rem" }} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
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
                    {showConfirmPassword ? (
                      <EyeOff style={{ width: "1.1rem", height: "1.1rem" }} />
                    ) : (
                      <Eye style={{ width: "1.1rem", height: "1.1rem" }} />
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="submit-btn">
                {isLoading ? (
                  <div className="spinner" />
                ) : (
                  <>
                    <span>Sign up</span>
                    <ArrowRight style={{ width: "1rem", height: "1rem" }} />
                  </>
                )}
              </button>
            </form>
          ) : (
            // نموذج إدخال رمز التحقق (OTP)
            <form onSubmit={handleVerify} className="signup-form" dir="ltr">
              <div className="input-group">
                <label className="input-label">Verification Code (OTP)</label>
                <div className="input-wrapper">
                  <div className="input-icon-left">
                    <ShieldCheck style={{ width: "1.1rem", height: "1.1rem" }} />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    className="input-field"
                    style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1rem' }}
                  />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="submit-btn">
                {isLoading ? (
                  <div className="spinner" />
                ) : (
                  <>
                    <span>تفعيل الحساب</span>
                    <ArrowRight style={{ width: "1rem", height: "1rem" }} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="auth-switch-text" dir="rtl">
            لديك حساب بالفعل؟
            <button onClick={onNavigateToLogin} className="auth-switch-link">
              تسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}