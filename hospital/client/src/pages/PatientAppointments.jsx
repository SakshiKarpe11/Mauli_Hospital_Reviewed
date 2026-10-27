import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import "./RolePages.css";

function PatientAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const response = await API.get("/appointments");
                setAppointments(response.data);
            } catch (error) {
                console.error("Error fetching patient appointments:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-section">
                <Navbar />
                <main className="dashboard role-page">
                    <div className="welcome-section">
                        <h1>My Appointments</h1>
                        <p>View appointments booked by the hospital.</p>
                    </div>
                    <div className="panel">
                        <div className="panel-header">
                            <h2>Appointment History</h2>
                            <span>{appointments.length} Appointments</span>
                        </div>
                        {loading ? <div className="empty-state">Loading appointments...</div> : appointments.length === 0 ? <div className="empty-state">No appointments found.</div> : (
                            <div className="role-table-wrap">
                                <table className="role-table">
                                    <thead><tr><th>Date</th><th>Time</th><th>Doctor</th><th>Specialization</th><th>Reason</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {appointments.map((appointment) => (
                                            <tr key={appointment._id}>
                                                <td>{new Date(appointment.appointmentDate).toLocaleDateString("en-IN")}</td>
                                                <td>{appointment.appointmentTime}</td>
                                                <td>{appointment.doctor?.name || "-"}</td>
                                                <td>{appointment.doctor?.specialization || "-"}</td>
                                                <td>{appointment.reason || "Consultation"}</td>
                                                <td><span className={`role-status ${appointment.status?.toLowerCase()}`}>{appointment.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default PatientAppointments;
