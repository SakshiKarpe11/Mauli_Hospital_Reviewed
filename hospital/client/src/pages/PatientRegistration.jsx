import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import "./RolePages.css";

function PatientRegistration() {
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({
        name: "", phone: "", dateOfBirth: "", age: "", gender: "",
        bloodGroup: "", address: "", emergencyContact: "", medicalHistory: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadProfile = async () => {
        try {
            setLoading(true);
            const response = await API.get("/patients/me");
            setProfile(response.data);
            setForm({
                name: response.data.name || "",
                phone: response.data.phone || "",
                dateOfBirth: response.data.dateOfBirth ? response.data.dateOfBirth.substring(0, 10) : "",
                age: response.data.age ?? "",
                gender: response.data.gender || "",
                bloodGroup: response.data.bloodGroup || "",
                address: response.data.address || "",
                emergencyContact: response.data.emergencyContact || "",
                medicalHistory: response.data.medicalHistory || ""
            });
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load your registration details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadProfile(); }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setMessage(""); setError("");
        try {
            const response = await API.put("/patients/me", form);
            setProfile(response.data.patient);
            const user = JSON.parse(localStorage.getItem("user") || "{}") || {};
            user.name = response.data.patient.name;
            localStorage.setItem("user", JSON.stringify(user));
            setMessage("Registration details updated successfully.");
        } catch (err) {
            setError(err.response?.data?.message || "Unable to update registration details.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-section">
                <Navbar />
                <main className="dashboard role-page">
                    <div className="welcome-section">
                        <h1>My Registration</h1>
                        <p>View and update your registered hospital information.</p>
                    </div>

                    {loading ? <div className="panel"><div className="empty-state">Loading registration...</div></div> : (
                        <div className="panel">
                            <div className="panel-header">
                                <h2>Patient Registration Details</h2>
                                <span>{profile?.email || "Patient Account"}</span>
                            </div>
                            {message && <div className="success-message">✓ {message}</div>}
                            {error && <div className="login-error">⚠️ {error}</div>}
                            <form onSubmit={handleSubmit} className="role-form-grid">
                                <div><label>Full Name</label><input name="name" value={form.name} onChange={handleChange} required /></div>
                                <div><label>Email</label><input value={profile?.email || ""} readOnly /></div>
                                <div><label>Phone</label><input name="phone" value={form.phone} onChange={handleChange} required /></div>
                                <div><label>Date of Birth</label><input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} /></div>
                                <div><label>Age</label><input type="number" min="0" max="120" name="age" value={form.age} onChange={handleChange} /></div>
                                <div><label>Gender</label><select name="gender" value={form.gender} onChange={handleChange}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></div>
                                <div><label>Blood Group</label><select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}><option value="">Select</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(v => <option key={v}>{v}</option>)}</select></div>
                                <div><label>Emergency Contact</label><input name="emergencyContact" value={form.emergencyContact} onChange={handleChange} /></div>
                                <div className="role-form-full"><label>Address</label><textarea name="address" value={form.address} onChange={handleChange} rows="3" /></div>
                                <div className="role-form-full"><label>Medical History</label><textarea name="medicalHistory" value={form.medicalHistory} onChange={handleChange} rows="3" placeholder="Previous conditions, allergies, important history..." /></div>
                                <div className="role-form-full"><button className="role-primary-btn" disabled={saving}>{saving ? "Saving..." : "Save Registration Details"}</button></div>
                            </form>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default PatientRegistration;
