import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import "./RolePages.css";

function PatientPrescriptions() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const response = await API.get("/medical-records");
                setRecords(response.data.filter((record) => record.medicines));
            } catch (error) {
                console.error("Error fetching prescriptions:", error);
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
                        <h1>My Prescriptions</h1>
                        <p>Medicines prescribed during your consultations.</p>
                    </div>
                    <div className="panel">
                        <div className="panel-header"><h2>Prescription History</h2><span>{records.length} Prescriptions</span></div>
                        {loading ? <div className="empty-state">Loading prescriptions...</div> : records.length === 0 ? <div className="empty-state">No prescriptions found.</div> : records.map((record) => (
                            <div className="patient-row" key={record._id}>
                                <div className="patient-avatar">💊</div>
                                <div className="role-record-content">
                                    <strong>{record.medicines}</strong>
                                    <p>Diagnosis: {record.diagnosis}</p>
                                    <p>Doctor: {record.doctor?.name || "-"}</p>
                                </div>
                                <span>{record.recordDate ? new Date(record.recordDate).toLocaleDateString("en-IN") : "-"}</span>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default PatientPrescriptions;
