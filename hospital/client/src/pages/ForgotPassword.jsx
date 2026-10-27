import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./AuthPages.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendCode = async (event) => {
    event.preventDefault();
    setMessage(""); setError(""); setLoading(true);
    try {
      const response = await API.post("/auth/forgot-password", { email });
      setCodeSent(true);
      setMessage(response.data.message || "If an account exists, a verification code has been sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not send the verification code. Please try again.");
    } finally { setLoading(false); }
  };

  const updatePassword = async (event) => {
    event.preventDefault();
    setMessage(""); setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const response = await API.post("/auth/reset-password", {
        email, otp, newPassword
      });
      navigate("/login", { replace: true, state: { message: response.data.message } });
    } catch (err) {
      setError(err.response?.data?.message || "Could not update the password. Please try again.");
    } finally { setLoading(false); }
  };

  return <main className="auth-page"><section className="auth-card">
    <div className="auth-logo">M</div><p className="auth-eyebrow">MAULI HOSPITAL</p>
    <h1>Forgot password?</h1>
    {!codeSent ? <>
      <p className="auth-subtitle">Enter your registered email. We’ll email you a 6-digit verification code—no reset link.</p>
      <form onSubmit={sendCode} className="auth-form">
        <label htmlFor="forgot-email">Email address</label>
        <input id="forgot-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
        <button type="submit" disabled={loading}>{loading ? "Sending code..." : "Send verification code"}</button>
      </form>
    </> : <>
      <p className="auth-subtitle">Enter the 6-digit code sent to your email, then choose a new password.</p>
      <form onSubmit={updatePassword} className="auth-form">
        <label htmlFor="reset-email">Email address</label>
        <input id="reset-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <label htmlFor="reset-otp">6-digit verification code</label>
        <input id="reset-otp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" required />
        <label htmlFor="new-password">New password</label>
        <input id="new-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
        <label htmlFor="confirm-password">Confirm new password</label>
        <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? "Updating password..." : "Update password"}</button>
        <button type="button" className="auth-back" disabled={loading} onClick={() => { setCodeSent(false); setOtp(""); setNewPassword(""); setConfirmPassword(""); setMessage(""); setError(""); }}>Use another email / request new code</button>
      </form>
    </>}
    {message && <p className="auth-success" role="status">{message}</p>}
    {error && <p className="auth-error" role="alert">{error}</p>}
    <Link className="auth-back" to="/login">← Back to login</Link>
  </section></main>;
}
