import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import "./RolePages.css";

function DoctorAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [rescheduleId, setRescheduleId] = useState(null);
    const [rescheduleDate, setRescheduleDate] = useState("");
    const [rescheduleTime, setRescheduleTime] = useState("");

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await API.get("/appointments");
            setAppointments(response.data);
        } catch (error) {
            console.error("Error fetching doctor appointments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            setSavingId(id);
            await API.put(`/appointments/${id}`, { status });
            await fetchAppointments();
        } catch (error) {
            alert(error.response?.data?.message || "Unable to update appointment");
        } finally {
            setSavingId(null);
        }
    };


    const startReschedule = (appointment) => {
        setRescheduleId(appointment._id);
        setRescheduleDate(appointment.appointmentDate
            ? new Date(appointment.appointmentDate).toISOString().slice(0, 10)
            : "");
        setRescheduleTime(appointment.appointmentTime || "");
    };

    const saveReschedule = async (id) => {
        if (!rescheduleDate || !rescheduleTime) {
            alert("Please select both a new date and time.");
            return;
        }

        try {
            setSavingId(id);
            await API.put(`/appointments/${id}`, {
                appointmentDate: rescheduleDate,
                appointmentTime: rescheduleTime
            });
            setRescheduleId(null);
            alert("Appointment rescheduled successfully. The updated date and time will appear in the patient's appointment list.");
            await fetchAppointments();
        } catch (error) {
            alert(error.response?.data?.message || "Unable to reschedule appointment");
        } finally {
            setSavingId(null);
        }
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-section">
                <Navbar />
                <main className="dashboard role-page">
                    <div className="welcome-section">
                        <h1>My Appointments</h1>
                        <p>View your schedule and update appointment status.</p>
                    </div>

                    <div className="panel">
                        <div className="panel-header">
                            <h2>Appointment Schedule</h2>
                            <span>{appointments.length} Appointments</span>
                        </div>

                        {loading ? (
                            <div className="empty-state">Loading appointments...</div>
                        ) : appointments.length === 0 ? (
                            <div className="empty-state">No appointments assigned to you.</div>
                        ) : (
                            <div className="role-table-wrap">
                                <table className="role-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Patient</th>
                                            <th>Reason</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointments.map((appointment) => (
                                            <tr key={appointment._id}>
                                                <td>{new Date(appointment.appointmentDate).toLocaleDateString("en-IN")}</td>
                                                <td>{appointment.appointmentTime}</td>
                                                <td>
                                                    <strong>{appointment.patient?.name || "Unknown"}</strong>
                                                    <small>{appointment.patient?.phone || ""}</small>
                                                </td>
                                                <td>{appointment.reason || "Consultation"}</td>
                                                <td>
                                                    <span className={`role-status ${appointment.status?.toLowerCase()}`}>
                                                        {appointment.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="appointment-action-stack">
                                                        <select
                                                            value={appointment.status}
                                                            disabled={savingId === appointment._id}
                                                            onChange={(e) => updateStatus(appointment._id, e.target.value)}
                                                            className="role-select"
                                                            aria-label="Appointment status"
                                                        >
                                                            <option value="Scheduled">Scheduled</option>
                                                            <option value="Completed">Completed</option>
                                                            <option value="Cancelled">Cancelled</option>
                                                        </select>
                                                        {appointment.status !== "Completed" && appointment.status !== "Cancelled" && (
                                                            <button
                                                                type="button"
                                                                className="role-small-btn"
                                                                onClick={() => startReschedule(appointment)}
                                                            >
                                                                Reschedule
                                                            </button>
                                                        )}
                                                    </div>
                                                    {rescheduleId === appointment._id && (
                                                        <div className="reschedule-inline">
                                                            <label>
                                                                New date
                                                                <input
                                                                    type="date"
                                                                    min={new Date().toISOString().slice(0, 10)}
                                                                    value={rescheduleDate}
                                                                    onChange={(e) => setRescheduleDate(e.target.value)}
                                                                />
                                                            </label>
                                                            <label>
                                                                New time
                                                                <input
                                                                    type="time"
                                                                    value={rescheduleTime}
                                                                    onChange={(e) => setRescheduleTime(e.target.value)}
                                                                />
                                                            </label>
                                                            <button
                                                                type="button"
                                                                className="role-small-btn"
                                                                disabled={savingId === appointment._id}
                                                                onClick={() => saveReschedule(appointment._id)}
                                                            >
                                                                {savingId === appointment._id ? "Saving..." : "Save"}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="role-small-btn"
                                                                onClick={() => setRescheduleId(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
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

export default DoctorAppointments;
