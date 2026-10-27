import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";

function PatientDashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const [appointments, setAppointments] = useState([]);
    const [records, setRecords] = useState([]);
    const [bills, setBills] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [profileResponse, appointmentsResponse, recordsResponse, billsResponse] = await Promise.all([
                    API.get("/patients/me"),
                    API.get("/appointments"),
                    API.get("/medical-records"),
                    API.get("/billing")
                ]);
                setProfile(profileResponse.data);
                setAppointments(appointmentsResponse.data);
                setRecords(recordsResponse.data);
                setBills(billsResponse.data);
            } catch (error) {
                console.error("Error loading patient dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const upcoming = appointments
        .filter((item) => item.status === "Scheduled" && new Date(item.appointmentDate) >= new Date(new Date().setHours(0, 0, 0, 0)))
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

    const lastRecord = records[0];
    const totalBills = bills.reduce((sum, bill) => sum + Number(bill.totalAmount || 0), 0);

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-section">
                <Navbar />
                <main className="dashboard">
                    <div className="welcome-section">
                        <h1>Welcome, {user?.name || "Patient"} 👋</h1>
                        <p>Manage your appointments, medical records and healthcare.</p>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card"><div className="stat-icon">📅</div><div><p>Upcoming Appointments</p><h2>{loading ? "..." : upcoming.length}</h2><span>Scheduled appointments</span></div></div>
                        <div className="stat-card"><div className="stat-icon">📋</div><div><p>Medical Records</p><h2>{loading ? "..." : records.length}</h2><span>Available records</span></div></div>
                        <div className="stat-card"><div className="stat-icon">🧾</div><div><p>My Bills</p><h2>{loading ? "..." : bills.length}</h2><span>Total bills</span></div></div>
                        <div className="stat-card"><div className="stat-icon">💰</div><div><p>Total Billed</p><h2>{loading ? "..." : `₹${totalBills.toLocaleString("en-IN")}`}</h2><span>Hospital billing</span></div></div>
                    </div>

                    <div className="panel" style={{ marginBottom: "20px" }}>
                        <div className="panel-header">
                            <h2>Registration</h2>
                            <button onClick={() => navigate("/my-registration")}>View / Update</button>
                        </div>
                        <div className="patient-row">
                            <div className="patient-avatar">👤</div>
                            <div>
                                <strong>{profile?.name || user?.name || "Patient"}</strong>
                                <p>{profile?.email || user?.email || ""}</p>
                                <span>{profile?.phone || "Phone not added"} • {profile?.bloodGroup || "Blood group not added"}</span>
                            </div>
                            <span>{profile ? "Registered" : "Profile unavailable"}</span>
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        <div className="panel">
                            <div className="panel-header">
                                <h2>Upcoming Appointments</h2>
                                <button onClick={() => navigate("/my-appointments")}>View All</button>
                            </div>
                            {loading ? <div className="empty-state">Loading...</div> : upcoming.length === 0 ? <div className="empty-state">No upcoming appointments.</div> : upcoming.slice(0, 3).map((appointment) => (
                                <div className="appointment" key={appointment._id}>
                                    <strong>{appointment.appointmentTime}</strong>
                                    <div><p>{appointment.doctor?.name || "Doctor"}</p><span>{appointment.reason || "Consultation"} • {new Date(appointment.appointmentDate).toLocaleDateString("en-IN")}</span></div>
                                </div>
                            ))}
                        </div>

                        <div className="panel">
                            <div className="panel-header">
                                <h2>Recent Medical Record</h2>
                                <button onClick={() => navigate("/my-records")}>View All</button>
                            </div>
                            {!lastRecord ? <div className="empty-state">No medical records yet.</div> : (
                                <div className="patient-row">
                                    <div className="patient-avatar">📋</div>
                                    <div><strong>{lastRecord.diagnosis}</strong><p>{lastRecord.doctor?.name || "Doctor"}</p><span>{lastRecord.medicines || "No medicines listed"}</span></div>
                                    <span>{lastRecord.recordDate ? new Date(lastRecord.recordDate).toLocaleDateString("en-IN") : "-"}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default PatientDashboard;
