import React, { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import "./Login.css";

export default function Login({
  logoSrc,
  onLoginSuccess,
  onNavigateToSignup,
  onError,
}) {
  const [animState, setAnimState] = useState("rising");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // حالات نسيان كلمة المرور
  const [forgotStep, setForgotStep] = useState("login"); // "login" | "email" | "otp" | "newPassword"
  const [forgotEmail, setForgotEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const logo = logoSrc || "/logo.jpeg";

  useEffect(() => {
    const riseTimer = setTimeout(() => {
      setAnimState("holding");
    }, 800);

    const holdTimer = setTimeout(() => {
      setAnimState("done");
    }, 1800);

    return () => {
      clearTimeout(riseTimer);
      clearTimeout(holdTimer);
    };
  }, []);

  // 1. تسجيل الدخول العادي
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (onError) onError("");

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "فشل تسجيل الدخول");
      }

      setIsLoading(false);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setIsLoading(false);
      if (onError) onError(err.message);
    }
  };

  // 2. طلب إرسال رمز التحقق لنسيان كلمة المرور
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (onError) onError("");

    try {
      const response = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "حدث خطأ أثناء إرسال الرمز");
      }

      setIsLoading(false);
      setSuccessMessage(data.message || "تم إرسال رمز التحقق إلى بريدك");
      setForgotStep("otp");
    } catch (err) {
      setIsLoading(false);
      if (onError) onError(err.message);
    }
  };

  // 3. إعادة إرسال رمز التحقق لنسيان كلمة المرور
  const handleResendCode = async () => {
    setIsLoading(true);
    if (onError) onError("");

    try {
      const response = await fetch("http://localhost:5000/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "فشل إعادة إرسال الرمز");
      }

      setIsLoading(false);
      setSuccessMessage(data.message || "تم إعادة إرسال الرمز بنجاح");
    } catch (err) {
      setIsLoading(false);
      if (onError) onError(err.message);
    }
  };

  // 4. التحقق من الرمز عبر السيرفر
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (onError) onError("");

    try {
      const response = await fetch("http://localhost:5000/verify-forgot-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "رمز التحقق غير صحيح");
      }

      setIsLoading(false);
      setSuccessMessage("تم التحقق من الرمز بنجاح، أدخل كلمة المرور الجديدة");
      setForgotStep("newPassword");
    } catch (err) {
      setIsLoading(false);
      if (onError) onError(err.message);
    }
  };

  // 5. تغيير كلمة المرور الجديدة
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      if (onError) onError("كلمتا المرور غير متطابقتين!");
      return;
    }

    setIsLoading(true);
    if (onError) onError("");

    try {
      const response = await fetch("http://localhost:5000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          code: verificationCode,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "فشل تغيير كلمة المرور");
      }

      setIsLoading(false);
      setSuccessMessage("تم تغيير كلمة المرور بنجاح، يمكنك تسجيل الدخول الآن");
      
      setTimeout(() => {
        setForgotStep("login");
        setSuccessMessage("");
        setVerificationCode("");
        setNewPassword("");
        setConfirmNewPassword("");
      }, 2000);

    } catch (err) {
      setIsLoading(false);
      if (onError) onError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg-glow-1" />
      <div className="login-bg-glow-2" />

      {animState !== "done" && (
        <div className="splash-overlay">
          <div className={`splash-logo-wrapper ${animState}`}>
            <div style={{ position: "relative" }}>
              <div className="logo-glow-effect" />
              <img
                src={logo}
                alt="ChitChat Logo"
                className="app-logo-img"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="app-logo-fallback" style={{ display: "none" }}>
                <MessageSquare style={{ width: "2.5rem", height: "2.5rem", color: "#ffffff" }} />
              </div>
            </div>
            <span className="splash-title">ChitChat</span>
          </div>
        </div>
      )}

      <div className={`login-form-container ${animState === "done" ? "visible-form" : "hidden-form"}`}>
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
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="app-logo-fallback" style={{ display: "none" }}>
                <MessageSquare style={{ width: "2rem", height: "2rem", color: "#ffffff" }} />
              </div>
            </div>
            <h1 className="login-title">
              {forgotStep === "login" && "تسجيل الدخول"}
              {forgotStep === "email" && "استعادة كلمة المرور"}
              {forgotStep === "otp" && "التحقق من الرمز"}
              {forgotStep === "newPassword" && "كلمة مرور جديدة"}
            </h1>
            <p className="login-subtitle">
              {forgotStep === "login" && "مرحباً بك مجدداً في ChitChat"}
              {forgotStep === "email" && "أدخل بريدك الإلكتروني لإرسال رمز التحقق"}
              {forgotStep === "otp" && "أدخل رمز التحقق المرسل إلى بريدك"}
              {forgotStep === "newPassword" && "أدخل كلمة المرور الجديدة لحسابك"}
            </p>
          </div>

          {successMessage && (
            <p style={{ color: '#4ade80', fontSize: '0.75rem', textAlign: 'center', marginBottom: '0.75rem', backgroundColor: 'rgba(74, 222, 128, 0.1)', padding: '0.5rem', borderRadius: '0.375rem' }}>
              {successMessage}
            </p>
          )}

          {/* 1. نموذج تسجيل الدخول */}
          {forgotStep === "login" && (
            <form onSubmit={handleSubmit} className="login-form" dir="ltr">
              <div className="input-group">
                <label className="input-label">Email</label>
                <div className="input-wrapper">
                  <div className="input-icon-left">
                    <Mail style={{ width: "1.25rem", height: "1.25rem" }} />
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
                    <Lock style={{ width: "1.25rem", height: "1.25rem" }} />
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
                    {showPassword ? <EyeOff style={{ width: "1.25rem", height: "1.25rem" }} /> : <Eye style={{ width: "1.25rem", height: "1.25rem" }} />}
                  </button>
                </div>
              </div>

              <div style={{ textAlign: "right", marginTop: "-0.25rem" }}>
                <button
                  type="button"
                  onClick={() => {
                    setForgotStep("email");
                    if (onError) onError("");
                  }}
                  style={{ background: "none", border: "none", color: "#60a5fa", fontSize: "0.75rem", cursor: "pointer", padding: 0, textDecoration: "underline" }}
                >
                  نسيت كلمة المرور؟
                </button>
              </div>

              <button type="submit" disabled={isLoading} className="submit-btn">
                {isLoading ? <div className="spinner" /> : <><span>تسجيل الدخول</span><ArrowRight style={{ width: "1rem", height: "1rem" }} /></>}
              </button>
            </form>
          )}

          {/* 2. إدخال البريد الإلكتروني لاستعادة كلمة المرور */}
          {forgotStep === "email" && (
            <form onSubmit={handleForgotSubmit} className="login-form" dir="ltr">
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <div className="input-wrapper">
                  <div className="input-icon-left">
                    <Mail style={{ width: "1.25rem", height: "1.25rem" }} />
                  </div>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="input-field"
                  />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="submit-btn">
                {isLoading ? <div className="spinner" /> : <><span>إرسال رمز التحقق</span><ArrowRight style={{ width: "1rem", height: "1rem" }} /></>}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForgotStep("login");
                  if (onError) onError("");
                  setSuccessMessage("");
                }}
                style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "0.75rem", cursor: "pointer", textAlign: "center", marginTop: "0.5rem" }}
              >
                العودة لتسجيل الدخول
              </button>
            </form>
          )}

          {/* 3. إدخال رمز التحقق OTP مع رابط إعادة الإرسال */}
          {forgotStep === "otp" && (
            <form onSubmit={handleVerifyOtp} className="login-form" dir="ltr">
              <div className="input-group">
                <label className="input-label">Verification Code (OTP)</label>
                <div className="input-wrapper">
                  <div className="input-icon-left">
                    <ShieldCheck style={{ width: "1.25rem", height: "1.25rem" }} />
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

              <div style={{ textAlign: "center", marginTop: "0.25rem" }}>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  style={{ background: "none", border: "none", color: "#60a5fa", fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline" }}
                >
                  لم يصلك الرمز؟ إعادة إرسال الرمز
                </button>
              </div>

              <button type="submit" disabled={isLoading} className="submit-btn">
                {isLoading ? <div className="spinner" /> : <><span>تأكيد الرمز</span><ArrowRight style={{ width: "1rem", height: "1rem" }} /></>}
              </button>
            </form>
          )}

          {/* 4. إدخال كلمة المرور الجديدة وتأكيدها */}
          {forgotStep === "newPassword" && (
            <form onSubmit={handleResetPasswordSubmit} className="login-form" dir="ltr">
              <div className="input-group">
                <label className="input-label">New Password</label>
                <div className="input-wrapper">
                  <div className="input-icon-left">
                    <Lock style={{ width: "1.25rem", height: "1.25rem" }} />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field with-right-icon"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="password-toggle-btn"
                  >
                    {showNewPassword ? <EyeOff style={{ width: "1.25rem", height: "1.25rem" }} /> : <Eye style={{ width: "1.25rem", height: "1.25rem" }} />}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Confirm New Password</label>
                <div className="input-wrapper">
                  <div className="input-icon-left">
                    <Lock style={{ width: "1.25rem", height: "1.25rem" }} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field with-right-icon"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle-btn"
                  >
                    {showConfirmPassword ? <EyeOff style={{ width: "1.25rem", height: "1.25rem" }} /> : <Eye style={{ width: "1.25rem", height: "1.25rem" }} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="submit-btn">
                {isLoading ? <div className="spinner" /> : <><span>Change Password</span><ArrowRight style={{ width: "1rem", height: "1rem" }} /></>}
              </button>
            </form>
          )}

          {forgotStep === "login" && (
            <div className="auth-switch-text" dir="rtl">
              ليس لديك حساب؟
              <button onClick={onNavigateToSignup} className="auth-switch-link">
                Sign up
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}