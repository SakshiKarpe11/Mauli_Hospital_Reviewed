import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import API from "../services/api";
import "./AuthPages.css";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault(); setError("");
    if (!token) { setError("This reset link is missing its token. Request a new link."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const response = await API.post("/auth/reset-password", { token, newPassword });
      navigate("/login", { replace: true, state: { message: response.data.message } });
    } catch (err) { setError(err.response?.data?.message || "Could not reset password. Request a new link."); }
    finally { setLoading(false); }
  };

  return <main className="auth-page"><section className="auth-card">
    <div className="auth-logo">M</div><p className="auth-eyebrow">MAULI HOSPITAL</p>
    <h1>Reset password</h1><p className="auth-subtitle">Choose a new password for your account.</p>
    <form onSubmit={submit} className="auth-form"><label htmlFor="new-password">New password</label>
      <input id="new-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
      <label htmlFor="confirm-password">Confirm new password</label>
      <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
      <button type="submit" disabled={loading}>{loading ? "Updating..." : "Update password"}</button>
    </form>
    {error && <p className="auth-error" role="alert">{error}</p>}
    <Link className="auth-back" to="/forgot-password">Request another reset link</Link>
  </section></main>;
}
