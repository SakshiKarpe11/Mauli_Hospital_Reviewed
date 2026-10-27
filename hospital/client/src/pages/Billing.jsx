import { useEffect, useState } from "react";
import API from "../services/api";
import "./Billing.css";

function Billing() {
    const [bills, setBills] = useState([]);
    const [patients, setPatients] = useState([]);

    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        patient: "",
        billNumber: "",
        billDate: "",
        consultationFee: "",
        medicineCharges: "",
        labCharges: "",
        otherCharges: "",
        totalAmount: 0,
        paymentStatus: "Pending",
        paymentMethod: "",
        notes: ""
    });

    /* ================= FETCH DATA ================= */

    const fetchBills = async () => {
        try {
            const response = await API.get("/billing");
            setBills(response.data);
        } catch (error) {
            console.error("Error fetching bills:", error);
            alert("Failed to fetch bills");
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await API.get("/patients");
            setPatients(response.data);
        } catch (error) {
            console.error("Error fetching patients:", error);
            alert("Failed to fetch patients");
        }
    };

    useEffect(() => {
        fetchBills();
        fetchPatients();
    }, []);

    /* ================= FORM HANDLING ================= */

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    /* ================= AUTOMATIC TOTAL ================= */

    useEffect(() => {
        const consultation = Number(formData.consultationFee) || 0;
        const medicine = Number(formData.medicineCharges) || 0;
        const lab = Number(formData.labCharges) || 0;
        const other = Number(formData.otherCharges) || 0;

        const total = consultation + medicine + lab + other;

        setFormData((prev) => ({
            ...prev,
            totalAmount: total
        }));
    }, [
        formData.consultationFee,
        formData.medicineCharges,
        formData.labCharges,
        formData.otherCharges
    ]);

    /* ================= CREATE / UPDATE ================= */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.patient) {
            alert("Please select a patient");
            return;
        }

        if (!formData.billNumber) {
            alert("Please enter bill number");
            return;
        }

        try {
            if (editingId) {
                await API.put(`/billing/${editingId}`, formData);
                alert("Bill updated successfully");
            } else {
                await API.post("/billing", formData);
                alert("Bill created successfully");
            }

            resetForm();
            fetchBills();

        } catch (error) {
            console.error("Billing error:", error);

            alert(
                error.response?.data?.message ||
                "Something went wrong"
            );
        }
    };

    /* ================= EDIT ================= */

    const handleEdit = (bill) => {
        setEditingId(bill._id);

        setFormData({
            patient: bill.patient?._id || "",
            billNumber: bill.billNumber || "",
            billDate: bill.billDate
                ? bill.billDate.substring(0, 10)
                : "",
            consultationFee: bill.consultationFee || "",
            medicineCharges: bill.medicineCharges || "",
            labCharges: bill.labCharges || "",
            otherCharges: bill.otherCharges || "",
            totalAmount: bill.totalAmount || 0,
            paymentStatus: bill.paymentStatus || "Pending",
            paymentMethod: bill.paymentMethod || "",
            notes: bill.notes || ""
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    /* ================= DELETE ================= */

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this bill?"
        );

        if (!confirmDelete) return;

        try {
            await API.delete(`/billing/${id}`);

            alert("Bill deleted successfully");

            fetchBills();

        } catch (error) {
            console.error("Delete bill error:", error);

            alert("Failed to delete bill");
        }
    };

    /* ================= PRINT BILL ================= */

    const printBill = (bill) => {
        const escapeHtml = (value) => String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");

        const patientName = escapeHtml(bill.patient?.name || "N/A");
        const billNumber = escapeHtml(bill.billNumber || "-");
        const billDate = bill.billDate
            ? new Date(bill.billDate).toLocaleDateString("en-IN")
            : "-";
        const amount = (value) => Number(value || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        const printWindow = window.open("", "_blank", "width=850,height=700");
        if (!printWindow) {
            alert("Please allow pop-ups to print the bill.");
            return;
        }

        printWindow.document.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Mauli Hospital - ${billNumber}</title>
<style>
body{font-family:Arial,sans-serif;padding:36px;color:#1f2937}
header{text-align:center;border-bottom:2px solid #2563eb;padding-bottom:18px;margin-bottom:24px}
h1{margin:0;color:#1d4ed8} header p{margin:6px 0;color:#64748b}
.info{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px}
table{width:100%;border-collapse:collapse;margin-top:14px}
th,td{border:1px solid #dbe3ed;padding:11px;text-align:left}
th{background:#f1f5f9}.amount{text-align:right;font-weight:bold;font-size:20px;margin-top:20px}
footer{text-align:center;margin-top:42px;color:#64748b;font-size:12px}
@media print{body{padding:0}}
</style>
</head>
<body>
<header><h1>MAULI HOSPITAL</h1><p>Hospital Management System</p><p>Patient Bill</p></header>
<div class="info">
<div><strong>Patient:</strong> ${patientName}</div>
<div><strong>Bill Number:</strong> ${billNumber}</div>
<div><strong>Bill Date:</strong> ${escapeHtml(billDate)}</div>
<div><strong>Payment Status:</strong> ${escapeHtml(bill.paymentStatus || "Pending")}</div>
<div><strong>Payment Method:</strong> ${escapeHtml(bill.paymentMethod || "-")}</div>
</div>
<table><thead><tr><th>Particular</th><th>Amount (INR)</th></tr></thead><tbody>
<tr><td>Consultation Fee</td><td>₹${amount(bill.consultationFee)}</td></tr>
<tr><td>Medicine Charges</td><td>₹${amount(bill.medicineCharges)}</td></tr>
<tr><td>Lab Charges</td><td>₹${amount(bill.labCharges)}</td></tr>
<tr><td>Other Charges</td><td>₹${amount(bill.otherCharges)}</td></tr>
</tbody></table>
<div class="amount">Total Amount: ₹${amount(bill.totalAmount)}</div>
${bill.notes ? `<p><strong>Notes:</strong> ${escapeHtml(bill.notes)}</p>` : ""}
<footer>Thank you for choosing Mauli Hospital.</footer>
</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 300);
    };

    /* ================= RESET ================= */

    const resetForm = () => {
        setEditingId(null);

        setFormData({
            patient: "",
            billNumber: "",
            billDate: "",
            consultationFee: "",
            medicineCharges: "",
            labCharges: "",
            otherCharges: "",
            totalAmount: 0,
            paymentStatus: "Pending",
            paymentMethod: "",
            notes: ""
        });
    };

    return (
        <div className="billing-page">

            {/* HEADER */}

            <div className="billing-header">
                <div>
                    <h1>Billing Management</h1>
                    <p>
                        Create and manage patient bills
                    </p>
                </div>

                <button
                    className="refresh-btn"
                    onClick={fetchBills}
                >
                    🔄 Refresh
                </button>
            </div>


            {/* BILL FORM */}

            <div className="billing-card">

                <h2>
                    {editingId
                        ? "Edit Bill"
                        : "Create New Bill"}
                </h2>

                <form onSubmit={handleSubmit}>

                    <div className="form-grid">

                        {/* PATIENT */}

                        <div className="form-group">
                            <label>Patient *</label>

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
                                        {patient.name} - {patient.phone}
                                    </option>
                                ))}
                            </select>
                        </div>


                        {/* BILL NUMBER */}

                        <div className="form-group">
                            <label>Bill Number *</label>

                            <input
                                type="text"
                                name="billNumber"
                                placeholder="e.g. BILL-001"
                                value={formData.billNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>


                        {/* BILL DATE */}

                        <div className="form-group">
                            <label>Bill Date</label>

                            <input
                                type="date"
                                name="billDate"
                                value={formData.billDate}
                                onChange={handleChange}
                            />
                        </div>


                        {/* CONSULTATION */}

                        <div className="form-group">
                            <label>Consultation Fee</label>

                            <input
                                type="number"
                                name="consultationFee"
                                min="0"
                                placeholder="0"
                                value={formData.consultationFee}
                                onChange={handleChange}
                            />
                        </div>


                        {/* MEDICINE */}

                        <div className="form-group">
                            <label>Medicine Charges</label>

                            <input
                                type="number"
                                name="medicineCharges"
                                min="0"
                                placeholder="0"
                                value={formData.medicineCharges}
                                onChange={handleChange}
                            />
                        </div>


                        {/* LAB */}

                        <div className="form-group">
                            <label>Lab Charges</label>

                            <input
                                type="number"
                                name="labCharges"
                                min="0"
                                placeholder="0"
                                value={formData.labCharges}
                                onChange={handleChange}
                            />
                        </div>


                        {/* OTHER */}

                        <div className="form-group">
                            <label>Other Charges</label>

                            <input
                                type="number"
                                name="otherCharges"
                                min="0"
                                placeholder="0"
                                value={formData.otherCharges}
                                onChange={handleChange}
                            />
                        </div>


                        {/* TOTAL */}

                        <div className="form-group">
                            <label>Total Amount</label>

                            <input
                                type="number"
                                value={formData.totalAmount}
                                readOnly
                                className="total-input"
                            />
                        </div>


                        {/* PAYMENT STATUS */}

                        <div className="form-group">
                            <label>Payment Status</label>

                            <select
                                name="paymentStatus"
                                value={formData.paymentStatus}
                                onChange={handleChange}
                            >
                                <option value="Pending">
                                    Pending
                                </option>

                                <option value="Paid">
                                    Paid
                                </option>

                                <option value="Partial">
                                    Partial
                                </option>
                            </select>
                        </div>


                        {/* PAYMENT METHOD */}

                        <div className="form-group">
                            <label>Payment Method</label>

                            <select
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Select Method
                                </option>

                                <option value="Cash">
                                    Cash
                                </option>

                                <option value="UPI">
                                    UPI
                                </option>

                                <option value="Card">
                                    Card
                                </option>

                                <option value="Online">
                                    Online
                                </option>
                            </select>
                        </div>

                    </div>


                    {/* NOTES */}

                    <div className="form-group full-width">
                        <label>Notes</label>

                        <textarea
                            name="notes"
                            rows="3"
                            placeholder="Enter notes..."
                            value={formData.notes}
                            onChange={handleChange}
                        ></textarea>
                    </div>


                    {/* BUTTONS */}

                    <div className="form-buttons">

                        <button
                            type="submit"
                            className="save-btn"
                        >
                            {editingId
                                ? "Update Bill"
                                : "Create Bill"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>
                        )}

                    </div>

                </form>

            </div>


            {/* BILLS TABLE */}

            <div className="billing-card">

                <div className="table-header">
                    <div>
                        <h2>All Bills</h2>
                        <p>
                            Total Bills: {bills.length}
                        </p>
                    </div>
                </div>

                <div className="table-container">

                    <table>

                        <thead>
                            <tr>
                                <th>Bill No.</th>
                                <th>Patient</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {bills.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="no-data"
                                    >
                                        No bills found
                                    </td>
                                </tr>
                            ) : (

                                bills.map((bill) => (

                                    <tr key={bill._id}>

                                        <td>
                                            <strong>
                                                {bill.billNumber}
                                            </strong>
                                        </td>

                                        <td>
                                            {bill.patient?.name || "N/A"}
                                        </td>

                                        <td>
                                            {bill.billDate
                                                ? new Date(
                                                    bill.billDate
                                                ).toLocaleDateString()
                                                : "-"}
                                        </td>

                                        <td>
                                            ₹{bill.totalAmount}
                                        </td>

                                        <td>

                                            <span
                                                className={`status ${bill.paymentStatus?.toLowerCase()}`}
                                            >
                                                {bill.paymentStatus}
                                            </span>

                                        </td>

                                        <td>
                                            {bill.paymentMethod || "-"}
                                        </td>

                                        <td>

                                            <button
                                                className="edit-btn"
                                                onClick={() => printBill(bill)}
                                            >
                                                🖨️ Print
                                            </button>

                                            <button
                                                className="edit-btn"
                                                onClick={() =>
                                                    handleEdit(bill)
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="delete-btn"
                                                onClick={() =>
                                                    handleDelete(bill._id)
                                                }
                                            >
                                                Delete
                                            </button>

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}

export default Billing;