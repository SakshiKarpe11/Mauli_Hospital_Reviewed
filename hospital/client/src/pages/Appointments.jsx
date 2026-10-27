import { useEffect, useState } from "react";
import API from "../services/api";

function Appointments() {

    const emptyForm = {
        patient: "",
        doctor: "",
        appointmentDate: "",
        appointmentTime: "",
        reason: ""
    };

    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);

    const [formData, setFormData] = useState(emptyForm);

    const [showForm, setShowForm] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ================================
    // FETCH APPOINTMENTS
    // ================================

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await API.get("/appointments");

            setAppointments(response.data);

        } catch (error) {
            console.error("Error fetching appointments:", error);
            setError("Unable to load appointments.");
        } finally {
            setLoading(false);
        }
    };


    // ================================
    // FETCH PATIENTS
    // ================================

    const fetchPatients = async () => {
        try {
            const response = await API.get("/patients");

            setPatients(response.data);

        } catch (error) {
            console.error("Error fetching patients:", error);
        }
    };


    // ================================
    // FETCH DOCTORS
    // ================================

    const fetchDoctors = async () => {
        try {
            const response = await API.get("/doctors");

            setDoctors(response.data);

        } catch (error) {
            console.error("Error fetching doctors:", error);
        }
    };


    // ================================
    // LOAD DATA
    // ================================

    useEffect(() => {
        fetchAppointments();
        fetchPatients();
        fetchDoctors();
    }, []);


    // ================================
    // HANDLE INPUT
    // ================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };


    // ================================
    // ADD APPOINTMENT
    // ================================

    const handleAddAppointment = () => {

        setEditingAppointment(null);

        setFormData(emptyForm);

        setShowForm(true);
    };


    // ================================
    // EDIT APPOINTMENT
    // ================================

    const handleEditAppointment = (appointment) => {

        setEditingAppointment(appointment);

        setFormData({
            patient: appointment.patient?._id || "",
            doctor: appointment.doctor?._id || "",
            appointmentDate: appointment.appointmentDate
                ? appointment.appointmentDate.substring(0, 10)
                : "",
            appointmentTime: appointment.appointmentTime || "",
            reason: appointment.reason || ""
        });

        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    // ================================
    // SAVE APPOINTMENT
    // ================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            if (editingAppointment) {

                await API.put(
                    `/appointments/${editingAppointment._id}`,
                    formData
                );

                alert("Appointment updated successfully!");

            } else {

                await API.post(
                    "/appointments",
                    formData
                );

                alert("Appointment created successfully!");
            }

            setFormData(emptyForm);

            setEditingAppointment(null);

            setShowForm(false);

            fetchAppointments();

        } catch (error) {

            console.error(
                "Appointment save error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to save appointment"
            );
        }
    };


    // ================================
    // DELETE APPOINTMENT
    // ================================

    const handleDeleteAppointment = async (appointment) => {

        const confirmed = window.confirm(
            `Are you sure you want to delete this appointment?`
        );

        if (!confirmed) {
            return;
        }

        try {

            await API.delete(
                `/appointments/${appointment._id}`
            );

            alert("Appointment deleted successfully!");

            fetchAppointments();

        } catch (error) {

            console.error(
                "Delete appointment error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to delete appointment"
            );
        }
    };


    return (

        <div className="appointments-page">

            {/* ================= HEADER ================= */}

            <div className="appointments-header">

                <div>

                    <h1>Appointment Management</h1>

                    <p>
                        Manage patient appointments and OPD schedules
                    </p>

                </div>

                <button
                    className="add-appointment-btn"
                    onClick={handleAddAppointment}
                >
                    + New Appointment
                </button>

            </div>


            {/* ================= FORM ================= */}

            {showForm && (

                <div className="appointment-form-card">

                    <h2>
                        {editingAppointment
                            ? "Edit Appointment"
                            : "Create New Appointment"}
                    </h2>


                    <form onSubmit={handleSubmit}>

                        <div className="appointment-form-grid">

                            {/* PATIENT */}

                            <div className="appointment-form-group">

                                <label>
                                    Patient *
                                </label>

                                <select
                                    name="patient"
                                    value={formData.patient}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        Select Patient
                                    </option>

                                    {patients.map((patient) => (

                                        <option
                                            key={patient._id}
                                            value={patient._id}
                                        >
                                            {patient.name}
                                        </option>

                                    ))}

                                </select>

                            </div>


                            {/* DOCTOR */}

                            <div className="appointment-form-group">

                                <label>
                                    Doctor *
                                </label>

                                <select
                                    name="doctor"
                                    value={formData.doctor}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        Select Doctor
                                    </option>

                                    {doctors.map((doctor) => (

                                        <option
                                            key={doctor._id}
                                            value={doctor._id}
                                        >
                                            {doctor.name} - {doctor.specialization}
                                        </option>

                                    ))}

                                </select>

                            </div>


                            {/* DATE */}

                            <div className="appointment-form-group">

                                <label>
                                    Appointment Date *
                                </label>

                                <input
                                    type="date"
                                    name="appointmentDate"
                                    value={formData.appointmentDate}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            {/* TIME */}

                            <div className="appointment-form-group">

                                <label>
                                    Appointment Time *
                                </label>

                                <input
                                    type="time"
                                    name="appointmentTime"
                                    value={formData.appointmentTime}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            {/* REASON */}

                            <div className="appointment-form-group full-width">

                                <label>
                                    Reason / Visit Type
                                </label>

                                <input
                                    type="text"
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    placeholder="e.g. General Checkup"
                                />

                            </div>

                        </div>


                        {/* FORM BUTTONS */}

                        <div className="appointment-form-actions">

                            <button
                                type="button"
                                className="appointment-cancel-btn"
                                onClick={() => {

                                    setShowForm(false);

                                    setEditingAppointment(null);

                                    setFormData(emptyForm);

                                }}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="appointment-save-btn"
                            >
                                {editingAppointment
                                    ? "Update Appointment"
                                    : "Create Appointment"}
                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* ================= TABLE ================= */}

            <div className="appointments-table-card">

                <div className="appointment-table-header">

                    <div>

                        <h2>
                            Appointment List
                        </h2>

                        <p>
                            Total Appointments: {appointments.length}
                        </p>

                    </div>

                    <button
                        className="appointment-refresh-btn"
                        onClick={fetchAppointments}
                    >
                        Refresh
                    </button>

                </div>


                {/* LOADING */}

                {loading && (

                    <div className="appointment-message">
                        Loading appointments...
                    </div>

                )}


                {/* ERROR */}

                {error && (

                    <div className="appointment-error">
                        {error}
                    </div>

                )}


                {/* EMPTY */}

                {!loading &&
                    !error &&
                    appointments.length === 0 && (

                        <div className="appointment-message">
                            No appointments found.
                        </div>

                    )}


                {/* TABLE */}

                {!loading &&
                    !error &&
                    appointments.length > 0 && (

                        <div className="appointments-table-wrapper">

                            <table className="appointments-table">

                                <thead>

                                    <tr>

                                        <th>Patient</th>

                                        <th>Doctor</th>

                                        <th>Date</th>

                                        <th>Time</th>

                                        <th>Reason</th>

                                        <th>Status</th>

                                        <th>Actions</th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {appointments.map(
                                        (appointment) => (

                                            <tr
                                                key={appointment._id}
                                            >

                                                <td>
                                                    <strong>
                                                        {appointment.patient?.name || "-"}
                                                    </strong>
                                                </td>


                                                <td>
                                                    {appointment.doctor?.name || "-"}
                                                </td>


                                                <td>

                                                    {appointment.appointmentDate
                                                        ? new Date(
                                                            appointment.appointmentDate
                                                        ).toLocaleDateString("en-IN")
                                                        : "-"
                                                    }

                                                </td>


                                                <td>
                                                    {appointment.appointmentTime || "-"}
                                                </td>


                                                <td>
                                                    {appointment.reason || "-"}
                                                </td>


                                                <td>
                                                    {appointment.status || "-"}
                                                </td>


                                                <td>

                                                    <div className="appointment-actions">

                                                        <button
                                                            className="edit-appointment-btn"
                                                            onClick={() =>
                                                                handleEditAppointment(
                                                                    appointment
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>


                                                        <button
                                                            className="delete-appointment-btn"
                                                            onClick={() =>
                                                                handleDeleteAppointment(
                                                                    appointment
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

            </div>

        </div>
    );
}

export default Appointments;