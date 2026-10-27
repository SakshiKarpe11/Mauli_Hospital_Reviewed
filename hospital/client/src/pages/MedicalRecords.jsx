import { useEffect, useState } from "react";
import API from "../services/api";

function MedicalRecords() {

    const emptyForm = {
        patient: "",
        doctor: "",
        diagnosis: "",
        symptoms: "",
        medicines: "",
        notes: "",
        recordDate: ""
    };

    const [records, setRecords] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);

    const [formData, setFormData] = useState(emptyForm);

    const [showForm, setShowForm] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* ===============================
       FETCH MEDICAL RECORDS
    =============================== */

    const fetchRecords = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await API.get("/medical-records");

            setRecords(response.data);
        } catch (error) {
            console.error(
                "Error fetching medical records:",
                error
            );

            setError("Unable to load medical records.");
        } finally {
            setLoading(false);
        }
    };


    /* ===============================
       FETCH PATIENTS
    =============================== */

    const fetchPatients = async () => {
        try {
            const response = await API.get("/patients");

            setPatients(response.data);
        } catch (error) {
            console.error(
                "Error fetching patients:",
                error
            );
        }
    };


    /* ===============================
       FETCH DOCTORS
    =============================== */

    const fetchDoctors = async () => {
        try {
            const response = await API.get("/doctors");

            setDoctors(response.data);
        } catch (error) {
            console.error(
                "Error fetching doctors:",
                error
            );
        }
    };


    /* ===============================
       LOAD DATA
    =============================== */

    useEffect(() => {
        fetchRecords();
        fetchPatients();
        fetchDoctors();
    }, []);


    /* ===============================
       HANDLE INPUT
    =============================== */

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };


    /* ===============================
       ADD RECORD
    =============================== */

    const handleAddRecord = () => {
        setEditingRecord(null);
        setFormData(emptyForm);
        setShowForm(true);
    };


    /* ===============================
       EDIT RECORD
    =============================== */

    const handleEditRecord = (record) => {

        setEditingRecord(record);

        setFormData({
            patient: record.patient?._id || "",
            doctor: record.doctor?._id || "",
            diagnosis: record.diagnosis || "",
            symptoms: record.symptoms || "",
            medicines: record.medicines || "",
            notes: record.notes || "",
            recordDate: record.recordDate
                ? record.recordDate.substring(0, 10)
                : ""
        });

        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    /* ===============================
       CREATE / UPDATE
    =============================== */

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            if (editingRecord) {

                await API.put(
                    `/medical-records/${editingRecord._id}`,
                    formData
                );

                alert(
                    "Medical record updated successfully!"
                );

            } else {

                await API.post(
                    "/medical-records",
                    formData
                );

                alert(
                    "Medical record created successfully!"
                );
            }

            setFormData(emptyForm);
            setEditingRecord(null);
            setShowForm(false);

            fetchRecords();

        } catch (error) {

            console.error(
                "Medical record save error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to save medical record"
            );
        }
    };


    /* ===============================
       DELETE RECORD
    =============================== */

    const handleDeleteRecord = async (record) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this medical record?"
        );

        if (!confirmed) {
            return;
        }

        try {

            await API.delete(
                `/medical-records/${record._id}`
            );

            alert(
                "Medical record deleted successfully!"
            );

            fetchRecords();

        } catch (error) {

            console.error(
                "Delete medical record error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to delete medical record"
            );
        }
    };


    return (
        <div className="medical-records-page">

            {/* HEADER */}

            <div className="medical-records-header">

                <div>
                    <h1>Medical Records</h1>

                    <p>
                        Manage patient medical records and treatment details
                    </p>
                </div>

                <button
                    className="add-medical-record-btn"
                    onClick={handleAddRecord}
                >
                    + New Medical Record
                </button>

            </div>


            {/* FORM */}

            {showForm && (

                <div className="medical-record-form-card">

                    <h2>
                        {editingRecord
                            ? "Edit Medical Record"
                            : "Create New Medical Record"}
                    </h2>


                    <form onSubmit={handleSubmit}>

                        <div className="medical-record-form-grid">


                            {/* PATIENT */}

                            <div className="medical-record-form-group">

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

                            <div className="medical-record-form-group">

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


                            {/* DIAGNOSIS */}

                            <div className="medical-record-form-group">

                                <label>
                                    Diagnosis *
                                </label>

                                <input
                                    type="text"
                                    name="diagnosis"
                                    value={formData.diagnosis}
                                    onChange={handleChange}
                                    placeholder="e.g. Viral Fever"
                                    required
                                />

                            </div>


                            {/* RECORD DATE */}

                            <div className="medical-record-form-group">

                                <label>
                                    Record Date
                                </label>

                                <input
                                    type="date"
                                    name="recordDate"
                                    value={formData.recordDate}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* SYMPTOMS */}

                            <div className="medical-record-form-group full-width">

                                <label>
                                    Symptoms
                                </label>

                                <textarea
                                    name="symptoms"
                                    value={formData.symptoms}
                                    onChange={handleChange}
                                    placeholder="Enter patient symptoms"
                                    rows="3"
                                />

                            </div>


                            {/* MEDICINES */}

                            <div className="medical-record-form-group full-width">

                                <label>
                                    Medicines
                                </label>

                                <textarea
                                    name="medicines"
                                    value={formData.medicines}
                                    onChange={handleChange}
                                    placeholder="Enter prescribed medicines"
                                    rows="3"
                                />

                            </div>


                            {/* NOTES */}

                            <div className="medical-record-form-group full-width">

                                <label>
                                    Notes
                                </label>

                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    placeholder="Enter additional medical notes"
                                    rows="3"
                                />

                            </div>

                        </div>


                        {/* FORM BUTTONS */}

                        <div className="medical-record-form-actions">

                            <button
                                type="button"
                                className="medical-record-cancel-btn"
                                onClick={() => {

                                    setShowForm(false);
                                    setEditingRecord(null);
                                    setFormData(emptyForm);

                                }}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="medical-record-save-btn"
                            >
                                {editingRecord
                                    ? "Update Medical Record"
                                    : "Create Medical Record"}
                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* TABLE */}

            <div className="medical-records-table-card">

                <div className="medical-record-table-header">

                    <div>

                        <h2>
                            Medical Record List
                        </h2>

                        <p>
                            Total Records: {records.length}
                        </p>

                    </div>


                    <button
                        className="medical-record-refresh-btn"
                        onClick={fetchRecords}
                    >
                        Refresh
                    </button>

                </div>


                {loading && (

                    <div className="medical-record-message">
                        Loading medical records...
                    </div>

                )}


                {error && (

                    <div className="medical-record-error">
                        {error}
                    </div>

                )}


                {!loading &&
                    !error &&
                    records.length === 0 && (

                        <div className="medical-record-message">
                            No medical records found.
                        </div>

                    )}


                {!loading &&
                    !error &&
                    records.length > 0 && (

                        <div className="medical-records-table-wrapper">

                            <table className="medical-records-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Patient
                                        </th>

                                        <th>
                                            Doctor
                                        </th>

                                        <th>
                                            Diagnosis
                                        </th>

                                        <th>
                                            Symptoms
                                        </th>

                                        <th>
                                            Medicines
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {records.map((record) => (

                                        <tr
                                            key={record._id}
                                        >

                                            <td>

                                                <strong>
                                                    {record.patient?.name || "-"}
                                                </strong>

                                            </td>


                                            <td>
                                                {record.doctor?.name || "-"}
                                            </td>


                                            <td>
                                                {record.diagnosis || "-"}
                                            </td>


                                            <td>
                                                {record.symptoms || "-"}
                                            </td>


                                            <td>
                                                {record.medicines || "-"}
                                            </td>


                                            <td>

                                                {record.recordDate
                                                    ? new Date(
                                                        record.recordDate
                                                    ).toLocaleDateString("en-IN")
                                                    : "-"
                                                }

                                            </td>


                                            <td>

                                                <div className="medical-record-actions">

                                                    <button
                                                        className="edit-medical-record-btn"
                                                        onClick={() =>
                                                            handleEditRecord(record)
                                                        }
                                                    >
                                                        Edit
                                                    </button>


                                                    <button
                                                        className="delete-medical-record-btn"
                                                        onClick={() =>
                                                            handleDeleteRecord(record)
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

export default MedicalRecords;