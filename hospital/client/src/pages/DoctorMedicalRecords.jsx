import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import "./RolePages.css";

const emptyForm = {
    patient: "",
    doctor: "",
    diagnosis: "",
    symptoms: "",
    medicines: "",
    notes: "",
    recordDate: ""
};

function DoctorMedicalRecords() {
    const [records, setRecords] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctor, setDoctor] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const [recordsResponse, patientsResponse, doctorResponse] = await Promise.all([
                API.get("/medical-records"),
                API.get("/doctors/me/patients"),
                API.get("/doctors/me")
            ]);
            setRecords(recordsResponse.data);
            setPatients(patientsResponse.data);
            setDoctor(doctorResponse.data);
        } catch (error) {
            console.error("Error loading doctor records:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const openCreate = () => {
        setEditingId(null);
        setFormData({ ...emptyForm, doctor: doctor?._id || "" });
        setShowForm(true);
    };

    const openEdit = (record) => {
        setEditingId(record._id);
        setFormData({
            patient: record.patient?._id || "",
            doctor: record.doctor?._id || doctor?._id || "",
            diagnosis: record.diagnosis || "",
            symptoms: record.symptoms || "",
            medicines: record.medicines || "",
            notes: record.notes || "",
            recordDate: record.recordDate ? record.recordDate.substring(0, 10) : ""
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await API.put(`/medical-records/${editingId}`, formData);
            } else {
                await API.post("/medical-records", formData);
            }
            setShowForm(false);
            setFormData(emptyForm);
            setEditingId(null);
            await loadData();
        } catch (error) {
            alert(error.response?.data?.message || "Unable to save medical record");
        }
    };

    const deleteRecord = async (id) => {
        if (!window.confirm("Delete this medical record?")) return;
        try {
            await API.delete(`/medical-records/${id}`);
            await loadData();
        } catch (error) {
            alert(error.response?.data?.message || "Unable to delete record");
        }
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-section">
                <Navbar />
                <main className="dashboard role-page">
                    <div className="role-page-header">
                        <div className="welcome-section">
                            <h1>Medical Records</h1>
                            <p>Create and review records for your patients.</p>
                        </div>
                        <button className="role-primary-btn" onClick={openCreate}>+ New Record</button>
                    </div>

                    {showForm && (
                        <div className="panel role-form-panel">
                            <div className="panel-header">
                                <h2>{editingId ? "Edit Medical Record" : "New Medical Record"}</h2>
                                <button className="role-secondary-btn" onClick={() => setShowForm(false)}>Close</button>
                            </div>
                            <form onSubmit={handleSubmit} className="role-form-grid">
                                <label>
                                    Patient
                                    <select value={formData.patient} onChange={(e) => setFormData({ ...formData, patient: e.target.value })} required>
                                        <option value="">Select patient</option>
                                        {patients.map((patient) => <option key={patient._id} value={patient._id}>{patient.name}</option>)}
                                    </select>
                                </label>
                                <label>
                                    Diagnosis
                                    <input value={formData.diagnosis} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} required />
                                </label>
                                <label>
                                    Symptoms
                                    <input value={formData.symptoms} onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })} />
                                </label>
                                <label>
                                    Medicines
                                    <input value={formData.medicines} onChange={(e) => setFormData({ ...formData, medicines: e.target.value })} />
                                </label>
                                <label>
                                    Record Date
                                    <input type="date" value={formData.recordDate} onChange={(e) => setFormData({ ...formData, recordDate: e.target.value })} />
                                </label>
                                <label className="full-field">
                                    Notes
                                    <textarea rows="3" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                                </label>
                                <div className="role-form-actions full-field">
                                    <button type="submit" className="role-primary-btn">{editingId ? "Update Record" : "Save Record"}</button>
                                    <button type="button" className="role-secondary-btn" onClick={() => setShowForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="panel">
                        <div className="panel-header">
                            <h2>Patient Medical Records</h2>
                            <span>{records.length} Records</span>
                        </div>
                        {loading ? (
                            <div className="empty-state">Loading medical records...</div>
                        ) : records.length === 0 ? (
                            <div className="empty-state">No medical records found.</div>
                        ) : (
                            <div className="role-table-wrap">
                                <table className="role-table">
                                    <thead><tr><th>Date</th><th>Patient</th><th>Diagnosis</th><th>Medicines</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {records.map((record) => (
                                            <tr key={record._id}>
                                                <td>{record.recordDate ? new Date(record.recordDate).toLocaleDateString("en-IN") : "-"}</td>
                                                <td>{record.patient?.name || "Unknown"}</td>
                                                <td>{record.diagnosis}</td>
                                                <td>{record.medicines || "-"}</td>
                                                <td>
                                                    <button className="role-small-btn" onClick={() => openEdit(record)}>Edit</button>
                                                    <button className="role-small-btn danger" onClick={() => deleteRecord(record._id)}>Delete</button>
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

export default DoctorMedicalRecords;
