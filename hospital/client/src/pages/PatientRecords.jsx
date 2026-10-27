import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import "./RolePages.css";

function PatientRecords() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const response = await API.get("/medical-records");
                setRecords(response.data);
            } catch (error) {
                console.error("Error fetching patient records:", error);
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
                        <h1>My Medical Records</h1>
                        <p>View your diagnosis, medicines and treatment history.</p>
                    </div>
                    <div className="panel">
                        <div className="panel-header"><h2>Medical History</h2><span>{records.length} Records</span></div>
                        {loading ? <div className="empty-state">Loading records...</div> : records.length === 0 ? <div className="empty-state">No medical records found.</div> : (
                            records.map((record) => (
                                <div className="patient-row" key={record._id}>
                                    <div className="patient-avatar">📋</div>
                                    <div className="role-record-content">
                                        <strong>{record.diagnosis}</strong>
                                        <p>Doctor: {record.doctor?.name || "-"}</p>
                                        <p>Symptoms: {record.symptoms || "-"}</p>
                                        <p>Medicines: {record.medicines || "-"}</p>
                                        {record.notes && <p>Notes: {record.notes}</p>}
                                    </div>
                                    <span>{record.recordDate ? new Date(record.recordDate).toLocaleDateString("en-IN") : "-"}</span>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default PatientRecords;
