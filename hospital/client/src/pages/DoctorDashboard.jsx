import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";

function DoctorDashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [allAppointments, setAllAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [todayResponse, appointmentsResponse, patientsResponse, recordsResponse] = await Promise.all([
                    API.get("/appointments/today"),
                    API.get("/appointments"),
                    API.get("/doctors/me/patients"),
                    API.get("/medical-records")
                ]);
                setTodayAppointments(todayResponse.data);
                setAllAppointments(appointmentsResponse.data);
                setPatients(patientsResponse.data);
                setRecords(recordsResponse.data);
            } catch (error) {
                console.error("Error loading doctor dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const completedVisits = allAppointments.filter((appointment) => {
        const date = new Date(appointment.appointmentDate);
        return appointment.status === "Completed" && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-section">
                <Navbar />
                <main className="dashboard">
                    <div className="welcome-section">
                        <h1>Good Morning, {user?.name || "Doctor"} 👋</h1>
                        <p>Here's what's happening with your patients today.</p>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card"><div className="stat-icon">👥</div><div><p>My Patients</p><h2>{loading ? "..." : patients.length}</h2><span>Currently under care</span></div></div>
                        <div className="stat-card"><div className="stat-icon">📅</div><div><p>Today's Appointments</p><h2>{loading ? "..." : todayAppointments.length}</h2><span>Appointments today</span></div></div>
                        <div className="stat-card"><div className="stat-icon">📋</div><div><p>Medical Records</p><h2>{loading ? "..." : records.length}</h2><span>Patient records</span></div></div>
                        <div className="stat-card"><div className="stat-icon">🩺</div><div><p>Completed Visits</p><h2>{loading ? "..." : completedVisits}</h2><span>This month</span></div></div>
                    </div>

                    <div className="dashboard-grid">
                        <div className="panel">
                            <div className="panel-header"><h2>Today's Patients</h2><button onClick={() => navigate("/doctor-appointments")}>View All</button></div>
                            {loading ? <div className="empty-state">Loading appointments...</div> : todayAppointments.length === 0 ? <div className="empty-state">No appointments today.</div> : todayAppointments.map((appointment) => (
                                <div className="patient-row" key={appointment._id}>
                                    <div className="patient-avatar">{appointment.patient?.name?.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase() || "P"}</div>
                                    <div><strong>{appointment.patient?.name || "Unknown Patient"}</strong><p>{appointment.reason || "Appointment"}</p></div>
                                    <span>{appointment.appointmentTime}</span>
                                </div>
                            ))}
                        </div>

                        <div className="panel">
                            <div className="panel-header"><h2>Quick Actions</h2></div>
                            <div className="appointment" onClick={() => navigate("/doctor-records")} style={{ cursor: "pointer" }}><strong>📝</strong><div><p>Medical Records</p><span>Create or review patient records</span></div></div>
                            <div className="appointment" onClick={() => navigate("/doctor-appointments")} style={{ cursor: "pointer" }}><strong>📅</strong><div><p>Appointments</p><span>View and update your schedule</span></div></div>
                            <div className="appointment" onClick={() => navigate("/doctor-patients")} style={{ cursor: "pointer" }}><strong>👥</strong><div><p>My Patients</p><span>View patients under your care</span></div></div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default DoctorDashboard;
