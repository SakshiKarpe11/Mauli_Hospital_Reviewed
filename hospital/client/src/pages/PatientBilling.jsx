import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import "./RolePages.css";
import "./PatientBilling.css";

function PatientBilling() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBills = async () => {
        try {
            setLoading(true);
            const response = await API.get("/billing");
            setBills(response.data);
        } catch (error) {
            console.error("Error fetching patient bills:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

    const total = bills.reduce(
        (sum, bill) => sum + Number(bill.totalAmount || 0),
        0
    );

    const printBill = (bill) => {
        const patientName = bill.patient?.name || "Patient";
        const billDate = bill.billDate
            ? new Date(bill.billDate).toLocaleDateString("en-IN")
            : "-";

        const printWindow = window.open("", "_blank", "width=850,height=700");
        if (!printWindow) {
            alert("Please allow pop-ups to print the bill.");
            return;
        }

        printWindow.document.write(`
            <!doctype html>
            <html>
            <head>
                <title>Mauli Hospital - ${bill.billNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; color: #1f2937; }
                    .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 18px; margin-bottom: 25px; }
                    .header h1 { margin: 0; color: #1d4ed8; }
                    .header p { margin: 6px 0 0; color: #64748b; }
                    .info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 30px; margin-bottom: 25px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                    th, td { border: 1px solid #dbe3ed; padding: 11px; text-align: left; }
                    th { background: #f1f5f9; }
                    .total { text-align: right; font-size: 20px; font-weight: bold; margin-top: 20px; }
                    .status { margin-top: 10px; font-weight: bold; }
                    .footer { margin-top: 45px; text-align: center; color: #64748b; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>MAULI HOSPITAL</h1>
                    <p>Hospital Management System</p>
                    <p>Patient Bill</p>
                </div>
                <div class="info">
                    <div><strong>Patient:</strong> ${patientName}</div>
                    <div><strong>Bill No:</strong> ${bill.billNumber}</div>
                    <div><strong>Date:</strong> ${billDate}</div>
                    <div><strong>Payment Status:</strong> ${bill.paymentStatus || "Pending"}</div>
                </div>
                <table>
                    <thead><tr><th>Particular</th><th>Amount</th></tr></thead>
                    <tbody>
                        <tr><td>Consultation Fee</td><td>₹${Number(bill.consultationFee || 0).toLocaleString("en-IN")}</td></tr>
                        <tr><td>Medicine Charges</td><td>₹${Number(bill.medicineCharges || 0).toLocaleString("en-IN")}</td></tr>
                        <tr><td>Lab Charges</td><td>₹${Number(bill.labCharges || 0).toLocaleString("en-IN")}</td></tr>
                        <tr><td>Other Charges</td><td>₹${Number(bill.otherCharges || 0).toLocaleString("en-IN")}</td></tr>
                    </tbody>
                </table>
                <div class="total">Total Amount: ₹${Number(bill.totalAmount || 0).toLocaleString("en-IN")}</div>
                <div class="status">Payment: ${bill.paymentStatus || "Pending"} ${bill.paymentMethod ? `(${bill.paymentMethod})` : ""}</div>
                <div class="footer">Thank you for choosing Mauli Hospital.</div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 300);
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-section">
                <Navbar />
                <main className="dashboard role-page">
                    <div className="welcome-section">
                        <h1>My Bills</h1>
                        <p>View your hospital bills, check payment status, and print your bills.</p>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">🧾</div>
                            <div><p>Total Bills</p><h2>{bills.length}</h2><span>Hospital bills</span></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">💰</div>
                            <div><p>Total Amount</p><h2>₹{total.toLocaleString("en-IN")}</h2><span>All billed services</span></div>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="panel-header">
                            <h2>Billing History</h2>
                            <span>{bills.length} Bills</span>
                        </div>

                        {loading ? (
                            <div className="empty-state">Loading bills...</div>
                        ) : bills.length === 0 ? (
                            <div className="empty-state">No bills found.</div>
                        ) : (
                            <div className="patient-bill-list">
                                {bills.map((bill) => {
                                    const isPaid = bill.paymentStatus === "Paid";
                                    return (
                                        <div className="patient-bill-card" key={bill._id}>
                                            <div className="patient-bill-main">
                                                <div className="patient-bill-title">
                                                    <div>
                                                        <h3>Bill #{bill.billNumber}</h3>
                                                        <p>{bill.billDate ? new Date(bill.billDate).toLocaleDateString("en-IN") : "-"}</p>
                                                    </div>
                                                    <span className={`role-status ${bill.paymentStatus?.toLowerCase()}`}>{bill.paymentStatus}</span>
                                                </div>

                                                <div className="patient-bill-amounts">
                                                    <span>Consultation ₹{Number(bill.consultationFee || 0).toLocaleString("en-IN")}</span>
                                                    <span>Medicines ₹{Number(bill.medicineCharges || 0).toLocaleString("en-IN")}</span>
                                                    <span>Lab ₹{Number(bill.labCharges || 0).toLocaleString("en-IN")}</span>
                                                    <strong>Total ₹{Number(bill.totalAmount || 0).toLocaleString("en-IN")}</strong>
                                                </div>

                                                <div className="patient-bill-actions">
                                                    <button className="role-small-btn" onClick={() => printBill(bill)}>🖨️ Print Bill</button>

                                                </div>
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="payment-note">
                        <strong>Payment information:</strong> For pending bills, please contact the hospital billing desk. Only authorized hospital staff should update payment status after verifying payment.
                    </div>
                </main>
            </div>
        </div>
    );
}

export default PatientBilling;
