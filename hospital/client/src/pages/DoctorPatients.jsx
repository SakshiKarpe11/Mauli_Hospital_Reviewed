import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import "./RolePages.css";

function DoctorPatients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const response = await API.get("/doctors/me/patients");
                setPatients(response.data);
            } catch (error) {
                console.error("Error fetching doctor patients:", error);
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
                        <h1>My Patients</h1>
                        <p>Patients who have appointments with you.</p>
                    </div>

                    <div className="panel">
                        <div className="panel-header">
                            <h2>Patient List</h2>
                            <span>{patients.length} Patients</span>
                        </div>

                        {loading ? (
                            <div className="empty-state">Loading patients...</div>
                        ) : patients.length === 0 ? (
                            <div className="empty-state">No patients assigned yet.</div>
                        ) : (
                            patients.map((patient) => (
                                <div className="patient-row" key={patient._id}>
                                    <div className="patient-avatar">
                                        {patient.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <strong>{patient.name}</strong>
                                        <p>{patient.gender || "Gender not provided"} • {patient.bloodGroup || "Blood group not provided"}</p>
                                        <small>{patient.phone} {patient.email ? `• ${patient.email}` : ""}</small>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default DoctorPatients;
