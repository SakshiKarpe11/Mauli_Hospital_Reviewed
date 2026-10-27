import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import "./Reports.css";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function BarChart({ title, items, formatter = (v) => v }) {
    const max = Math.max(...items.map((x) => x.value), 1);
    return (
        <div className="report-card">
            <h2>{title}</h2>
            <div className="bar-chart">
                {items.map((item, index) => (
                    <div className="bar-item" key={item.label}>
                        <div className="bar-value">{formatter(item.value)}</div>
                        <div className="bar-track"><div className="bar-fill" style={{ height: `${Math.max((item.value / max) * 100, item.value ? 8 : 0)}%`, background: COLORS[index % COLORS.length] }} /></div>
                        <div className="bar-label">{item.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Reports() {
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [records, setRecords] = useState([]);
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [p, d, a, r, b] = await Promise.all([
                    API.get("/patients"), API.get("/doctors"), API.get("/appointments"),
                    API.get("/medical-records"), API.get("/billing")
                ]);
                setPatients(p.data || []); setDoctors(d.data || []); setAppointments(a.data || []); setRecords(r.data || []); setBills(b.data || []);
            } catch (error) { console.error("Error loading reports:", error); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    const genderData = useMemo(() => ["Male", "Female", "Other"].map(label => ({ label, value: patients.filter(p => p.gender === label).length })), [patients]);
    const appointmentData = useMemo(() => ["Scheduled", "Completed", "Cancelled"].map(label => ({ label, value: appointments.filter(a => a.status === label).length })), [appointments]);
    const paymentData = useMemo(() => ["Paid", "Pending", "Partial"].map(label => ({ label, value: bills.filter(b => b.paymentStatus === label).length })), [bills]);
    const doctorSpecialization = useMemo(() => {
        const map = {};
        doctors.forEach(d => { const key = d.specialization || "Other"; map[key] = (map[key] || 0) + 1; });
        return Object.entries(map).map(([label, value]) => ({ label, value }));
    }, [doctors]);

    const totalRevenue = bills.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
    const paidRevenue = bills.filter(b => b.paymentStatus === "Paid").reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-section">
                <Navbar />
                <main className="dashboard reports-page">
                    <div className="welcome-section">
                        <h1>Reports & Analysis</h1>
                        <p>Visual overview of patients, appointments, doctors, medical records and billing.</p>
                    </div>
                    {loading ? <div className="panel"><div className="empty-state">Loading hospital reports...</div></div> : (
                        <>
                            <div className="report-summary-grid">
                                <div><span>Total Patients</span><strong>{patients.length}</strong></div>
                                <div><span>Total Doctors</span><strong>{doctors.length}</strong></div>
                                <div><span>Medical Records</span><strong>{records.length}</strong></div>
                                <div><span>Total Revenue</span><strong>₹{totalRevenue.toLocaleString("en-IN")}</strong></div>
                                <div><span>Paid Revenue</span><strong>₹{paidRevenue.toLocaleString("en-IN")}</strong></div>
                            </div>
                            <div className="reports-grid">
                                <BarChart title="Patients by Gender" items={genderData} />
                                <BarChart title="Appointment Status" items={appointmentData} />
                                <BarChart title="Payment Status" items={paymentData} />
                                <BarChart title="Doctors by Specialization" items={doctorSpecialization.length ? doctorSpecialization : [{ label: "No data", value: 0 }]} />
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

export default Reports;
