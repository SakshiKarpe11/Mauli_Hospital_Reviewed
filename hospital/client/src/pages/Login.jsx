import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import API from "../services/api";

function Login() {
  const [role, setRole] = useState("patient");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await API.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      // Make sure selected login type matches account role
      if (user.role !== role) {
        setError(
          `This account is registered as ${user.role}. Please select the correct login type.`
        );

        setLoading(false);
        return;
      }

      // Save authentication information
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect according to role
      if (user.role === "admin") {
        navigate("/");
      } else if (user.role === "doctor") {
        navigate("/doctor-dashboard");
      } else if (user.role === "patient") {
        navigate("/patient-dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        setError(
          error.response.data.message ||
            "Invalid email or password"
        );
      } else {
        setError(
          "Unable to connect to the hospital server. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError("Google did not return a sign-in credential. Please try again.");
      return;
    }
    if (role === "admin") {
      setError("Google sign-in is available only for patients and doctors.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await API.post("/auth/google", {
        credential: credentialResponse.credential,
        role,
      });
      const { token, user } = response.data;
      if (user.role !== role) {
        setError(`This account is registered as ${user.role}. Please select the correct login type.`);
        return;
      }
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate(user.role === "doctor" ? "/doctor-dashboard" : "/patient-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-page">

      {/* ================= LEFT SIDE ================= */}

      <section className="portal-left">

        <div className="left-content">

          {/* Logo */}
          <div className="hospital-brand">

            <div className="hospital-logo">
              M
            </div>

            <div>
              <h1>MAULI HOSPITAL</h1>
              <p>Hospital Management System</p>
            </div>

          </div>


          {/* Badge */}
          <div className="portal-badge">
            🛡️ SECURE HEALTHCARE PORTAL
          </div>


          {/* Main Heading */}
          <div className="left-heading">

            <h2>
              Smarter healthcare
              <br />
              for better care
            </h2>

            <p>
              Manage patients, appointments, medical records
              and hospital operations securely from one place.
            </p>

          </div>


          {/* Features */}
          <div className="feature-list">

            <div className="feature-item">

              <div className="feature-icon">
                👥
              </div>

              <div>
                <strong>Patient Management</strong>
                <span>
                  Manage patient information and registration
                </span>
              </div>

            </div>


            <div className="feature-item">

              <div className="feature-icon">
                📅
              </div>

              <div>
                <strong>Appointments & Scheduling</strong>
                <span>
                  Organize appointments and doctor schedules
                </span>
              </div>

            </div>


            <div className="feature-item">

              <div className="feature-icon">
                📋
              </div>

              <div>
                <strong>Digital Medical Records</strong>
                <span>
                  Access medical records securely
                </span>
              </div>

            </div>

          </div>

        </div>


        {/* Left Footer */}
        <div className="left-footer">

          <span>
            © 2026 Mauli Hospital
          </span>

          <div>
            <span>Privacy</span>
            <span>Terms</span>
          </div>

        </div>

      </section>


      {/* ================= RIGHT SIDE ================= */}

      <section className="portal-right">

        <div className="login-wrapper">

          <div className="login-card">

            {/* Header */}
            <div className="login-header">

              <h2>Portal Login</h2>

              <p>
                Select your account type to access your hospital portal
              </p>
              {location.state?.message && <div className="login-success" role="status">{location.state.message}</div>}

            </div>


            {/* Role Tabs */}
            <div className="role-tabs">

              <button
                type="button"
                className={
                  role === "patient"
                    ? "role-tab active"
                    : "role-tab"
                }
                onClick={() =>
                  handleRoleChange("patient")
                }
              >
                <span>👤</span>
                Patient Login
              </button>


              <button
                type="button"
                className={
                  role === "doctor"
                    ? "role-tab active"
                    : "role-tab"
                }
                onClick={() =>
                  handleRoleChange("doctor")
                }
              >
                <span>🩺</span>
                Doctor Login
              </button>


              <button
                type="button"
                className={
                  role === "admin"
                    ? "role-tab active"
                    : "role-tab"
                }
                onClick={() =>
                  handleRoleChange("admin")
                }
              >
                <span>💼</span>
                Staff / Admin
              </button>

            </div>


            {/* Form */}
            <form onSubmit={handleLogin}>

              {/* Email */}
              <div className="form-group">

                <label>Email Address</label>

                <div className="input-box">

                  <span className="input-icon">
                    ✉
                  </span>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder={
                      role === "patient"
                        ? "Enter patient email"
                        : role === "doctor"
                        ? "Enter doctor email"
                        : "Enter staff/admin email"
                    }
                    required
                  />

                </div>

              </div>


              {/* Password */}
              <div className="form-group">

                <label>Password</label>

                <div className="input-box">

                  <span className="input-icon">
                    🔒
                  </span>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                    required
                  />

                  <button
                    type="button"
                    className="password-button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>


              {role !== "admin" && (
                <div className="forgot-password">
                  <Link to="/forgot-password">Forgot Password?</Link>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="login-error">
                  ⚠️ {error}
                </div>
              )}


              {/* Login Button */}
              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading
                  ? "Signing In..."
                  : role === "patient"
                  ? "Sign In to Patient Portal  →"
                  : role === "doctor"
                  ? "Sign In to Doctor Portal  →"
                  : "Sign In to Staff Portal  →"}
              </button>

            </form>

            {role !== "admin" && (
              <div className="google-login-section">
                <div className="google-divider"><span>OR</span></div>
                <div className="google-login-control">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Google sign-in was unsuccessful. Please try again.")}
                    text="continue_with"
                    shape="rectangular"
                    theme="outline"
                    width="100%"
                  />
                </div>
              </div>
            )}

            {role === "patient" && (
              <div style={{ textAlign: "center", marginTop: "18px" }}>
                <span style={{ color: "#64748b" }}>New patient? </span>
                <button
                  type="button"
                  onClick={() => navigate("/patient-register")}
                  style={{ border: "none", background: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer" }}
                >
                  Create an account
                </button>
              </div>
            )}

            {role === "doctor" && (
              <div style={{ textAlign: "center", marginTop: "18px" }}>
                <span style={{ color: "#64748b" }}>New doctor? </span>
                <button
                  type="button"
                  onClick={() => navigate("/doctor-register")}
                  style={{ border: "none", background: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer" }}
                >
                  Create an account
                </button>
              </div>
            )}


            {/* Security */}
            <div className="security-box">

              <div className="security-icon">
                🔒
              </div>

              <div>
                <strong>
                  Secure hospital portal
                </strong>

                <span>
                  Authorized users only
                </span>
              </div>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Login;