import { useEffect, useState } from "react";
import API from "../services/api";

function Doctors() {

    const emptyForm = {
        name: "",
        email: "",
        phone: "",
        specialization: "",
        qualification: "",
        experience: "",
        consultationFee: "",
        availableDays: []
    };

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);

    const [formData, setFormData] = useState(emptyForm);


    // ========================================
    // GET ALL DOCTORS
    // ========================================

    const fetchDoctors = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await API.get("/doctors");

            setDoctors(response.data);

        } catch (error) {

            console.error("Error fetching doctors:", error);

            setError("Unable to load doctors.");

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchDoctors();

    }, []);


    // ========================================
    // HANDLE INPUT
    // ========================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };


    // ========================================
    // HANDLE AVAILABLE DAYS
    // ========================================

    const handleDayChange = (e) => {

        const { value, checked } = e.target;

        if (checked) {

            setFormData({
                ...formData,
                availableDays: [
                    ...formData.availableDays,
                    value
                ]
            });

        } else {

            setFormData({
                ...formData,
                availableDays: formData.availableDays.filter(
                    (day) => day !== value
                )
            });
        }
    };


    // ========================================
    // OPEN ADD FORM
    // ========================================

    const handleAddDoctor = () => {

        setEditingDoctor(null);

        setFormData(emptyForm);

        setShowForm(true);
    };


    // ========================================
    // OPEN EDIT FORM
    // ========================================

    const handleEditDoctor = (doctor) => {

        setEditingDoctor(doctor);

        setFormData({
            name: doctor.name || "",
            email: doctor.email || "",
            phone: doctor.phone || "",
            specialization: doctor.specialization || "",
            qualification: doctor.qualification || "",
            experience: doctor.experience ?? "",
            consultationFee: doctor.consultationFee ?? "",
            availableDays: doctor.availableDays || []
        });

        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    // ========================================
    // CREATE / UPDATE DOCTOR
    // ========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            if (editingDoctor) {

                // UPDATE
                await API.put(
                    `/doctors/${editingDoctor._id}`,
                    formData
                );

                alert("Doctor updated successfully!");

            } else {

                // CREATE
                await API.post(
                    "/doctors",
                    formData
                );

                alert("Doctor added successfully!");
            }


            // Reset form
            setFormData(emptyForm);

            setEditingDoctor(null);

            setShowForm(false);

            // Refresh doctor list
            fetchDoctors();

        } catch (error) {

            console.error("Doctor save error:", error);

            alert(
                error.response?.data?.message ||
                "Unable to save doctor"
            );
        }
    };


    // ========================================
    // DELETE DOCTOR
    // ========================================

    const handleDeleteDoctor = async (doctor) => {

        const confirmed = window.confirm(
            `Are you sure you want to delete ${doctor.name}?`
        );

        if (!confirmed) {
            return;
        }

        try {

            await API.delete(
                `/doctors/${doctor._id}`
            );

            alert("Doctor deleted successfully!");

            fetchDoctors();

        } catch (error) {

            console.error("Delete doctor error:", error);

            alert(
                error.response?.data?.message ||
                "Unable to delete doctor"
            );
        }
    };


    return (

        <div className="doctors-page">


            {/* ========================================
                PAGE HEADER
            ======================================== */}

            <div className="doctors-header">

                <div>

                    <h1>Doctor Management</h1>

                    <p>
                        Manage hospital doctors and their information
                    </p>

                </div>


                <button
                    className="add-doctor-btn"
                    onClick={handleAddDoctor}
                >
                    + Add New Doctor
                </button>

            </div>


            {/* ========================================
                ADD / EDIT FORM
            ======================================== */}

            {showForm && (

                <div className="doctor-form-card">

                    <div className="doctor-form-title">

                        <h2>
                            {editingDoctor
                                ? "Edit Doctor"
                                : "Add New Doctor"}
                        </h2>

                    </div>


                    <form onSubmit={handleSubmit}>

                        <div className="doctor-form-grid">


                            {/* NAME */}

                            <div className="doctor-form-group">

                                <label>
                                    Doctor Name *
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter doctor name"
                                    required
                                />

                            </div>


                            {/* EMAIL */}

                            <div className="doctor-form-group">

                                <label>
                                    Email *
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email"
                                    required
                                />

                            </div>


                            {/* PHONE */}

                            <div className="doctor-form-group">

                                <label>
                                    Phone *
                                </label>

                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                    required
                                />

                            </div>


                            {/* SPECIALIZATION */}

                            <div className="doctor-form-group">

                                <label>
                                    Specialization *
                                </label>

                                <input
                                    type="text"
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleChange}
                                    placeholder="e.g. General Physician"
                                    required
                                />

                            </div>


                            {/* QUALIFICATION */}

                            <div className="doctor-form-group">

                                <label>
                                    Qualification
                                </label>

                                <input
                                    type="text"
                                    name="qualification"
                                    value={formData.qualification}
                                    onChange={handleChange}
                                    placeholder="e.g. MBBS, MD"
                                />

                            </div>


                            {/* EXPERIENCE */}

                            <div className="doctor-form-group">

                                <label>
                                    Experience (Years)
                                </label>

                                <input
                                    type="number"
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    placeholder="Enter experience"
                                    min="0"
                                />

                            </div>


                            {/* CONSULTATION FEE */}

                            <div className="doctor-form-group">

                                <label>
                                    Consultation Fee (₹)
                                </label>

                                <input
                                    type="number"
                                    name="consultationFee"
                                    value={formData.consultationFee}
                                    onChange={handleChange}
                                    placeholder="Enter consultation fee"
                                    min="0"
                                />

                            </div>


                            {/* AVAILABLE DAYS */}

                            <div className="doctor-form-group">

                                <label>
                                    Available Days
                                </label>

                                <div className="days-container">

                                    {[
                                        "Monday",
                                        "Tuesday",
                                        "Wednesday",
                                        "Thursday",
                                        "Friday",
                                        "Saturday"
                                    ].map((day) => (

                                        <label
                                            key={day}
                                            className="day-checkbox"
                                        >

                                            <input
                                                type="checkbox"
                                                value={day}
                                                checked={formData.availableDays.includes(day)}
                                                onChange={handleDayChange}
                                            />

                                            {day}

                                        </label>

                                    ))}

                                </div>

                            </div>

                        </div>


                        {/* FORM BUTTONS */}

                        <div className="doctor-form-actions">

                            <button
                                type="button"
                                className="doctor-cancel-btn"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingDoctor(null);
                                    setFormData(emptyForm);
                                }}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="doctor-save-btn"
                            >
                                {editingDoctor
                                    ? "Update Doctor"
                                    : "Save Doctor"}
                            </button>

                        </div>

                    </form>

                </div>
            )}


            {/* ========================================
                DOCTOR TABLE
            ======================================== */}

            <div className="doctors-table-card">


                <div className="doctor-table-header">

                    <div>

                        <h2>Doctor List</h2>

                        <p>
                            Total Doctors: {doctors.length}
                        </p>

                    </div>


                    <button
                        className="doctor-refresh-btn"
                        onClick={fetchDoctors}
                    >
                        Refresh
                    </button>

                </div>


                {/* LOADING */}

                {loading && (

                    <div className="doctor-message">
                        Loading doctors...
                    </div>

                )}


                {/* ERROR */}

                {error && (

                    <div className="doctor-error">
                        {error}
                    </div>

                )}


                {/* EMPTY */}

                {!loading &&
                    !error &&
                    doctors.length === 0 && (

                        <div className="doctor-message">
                            No doctors found.
                        </div>

                    )}


                {/* TABLE */}

                {!loading &&
                    !error &&
                    doctors.length > 0 && (

                        <div className="doctors-table-wrapper">

                            <table className="doctors-table">

                                <thead>

                                    <tr>

                                        <th>Name</th>

                                        <th>Specialization</th>

                                        <th>Phone</th>

                                        <th>Qualification</th>

                                        <th>Experience</th>

                                        <th>Fee</th>

                                        <th>Actions</th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {doctors.map((doctor) => (

                                        <tr key={doctor._id}>

                                            <td>
                                                <strong>
                                                    {doctor.name}
                                                </strong>
                                            </td>


                                            <td>
                                                {doctor.specialization}
                                            </td>


                                            <td>
                                                {doctor.phone}
                                            </td>


                                            <td>
                                                {doctor.qualification || "-"}
                                            </td>


                                            <td>
                                                {doctor.experience ?? "-"} years
                                            </td>


                                            <td>
                                                ₹{doctor.consultationFee ?? "-"}
                                            </td>


                                            {/* ACTIONS */}

                                            <td>

                                                <div className="doctor-actions">

                                                    <button
                                                        className="edit-doctor-btn"
                                                        onClick={() =>
                                                            handleEditDoctor(doctor)
                                                        }
                                                    >
                                                        Edit
                                                    </button>


                                                    <button
                                                        className="delete-doctor-btn"
                                                        onClick={() =>
                                                            handleDeleteDoctor(doctor)
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

            </div>

        </div>
    );
}

export default Doctors;