import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./PatientRegister.css";

function DoctorRegister() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            await API.post("/auth/register", {
                name: form.name,
                email: form.email,
                phone: form.phone,
                password: form.password,
                role: "doctor"
            });

            setSuccess("Registration successful. You can now login to the Doctor Portal.");
            setTimeout(() => navigate("/login"), 1200);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to complete doctor registration."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="patient-register-page">
            <div className="patient-register-card">
                <div className="register-brand">
                    <div className="hospital-logo">M</div>
                    <div>
                        <h1>MAULI HOSPITAL</h1>
                        <p>Doctor Registration</p>
                    </div>
                </div>

                <h2>Create Doctor Account</h2>
                <p className="register-subtitle">
                    Register to access your appointments, patients and medical records.
                </p>

                {error && <div className="register-error">⚠️ {error}</div>}
                {success && <div className="register-success">✓ {success}</div>}

                <form onSubmit={handleSubmit}>
                    <label>
                        Full Name
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Dr. Full Name"
                            required
                        />
                    </label>

                    <label>
                        Email Address
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label>
                        Phone Number
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label>
                        Password
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label>
                        Confirm Password
                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <button disabled={loading}>
                        {loading ? "Creating Account..." : "Create Doctor Account"}
                    </button>
                </form>

                <button className="back-login" onClick={() => navigate("/login")}>
                    ← Back to Login
                </button>
            </div>
        </div>
    );
}

export default DoctorRegister;
