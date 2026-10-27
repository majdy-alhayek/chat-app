import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
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

  const logo = logoSrc || "/logo.jpeg";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      if (onError) onError("كلمتا المرور غير متطابقتين!");
      return;
    }

    setIsLoading(true);

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
      if (onSignupSuccess) {
        onSignupSuccess(data.user);
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
            <h1 className="signup-title">إنشاء حساب جديد</h1>
            <p className="signup-subtitle">انضم إلى عائلة ChitChat اليوم</p>
          </div>

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
