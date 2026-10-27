import Billing from "../models/Billing.js";
import Patient from "../models/patient.js";
import User from "../models/user.js";

const getOwnPatient = async (req) => {
    const user = await User.findById(req.user.userId);
    if (!user?.email) return null;
    return Patient.findOne({ email: user.email });
};

export const getBills = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === "patient") {
            const patient = await getOwnPatient(req);
            query = { patient: patient?._id || null };
        }

        const bills = await Billing.find(query)
            .populate("patient", "name phone email")
            .sort({ billDate: -1 });

        res.status(200).json(bills);
    } catch (error) {
        console.error("Get bills error:", error);
        res.status(500).json({ message: "Server error while fetching bills" });
    }
};

export const getBillById = async (req, res) => {
    try {
        const bill = await Billing.findById(req.params.id)
            .populate("patient", "name phone email");

        if (!bill) {
            return res.status(404).json({ message: "Bill not found" });
        }

        if (req.user.role === "patient") {
            const patient = await getOwnPatient(req);
            if (!patient || bill.patient._id.toString() !== patient._id.toString()) {
                return res.status(403).json({ message: "You are not authorized to view this bill" });
            }
        }

        res.status(200).json(bill);
    } catch (error) {
        console.error("Get bill error:", error);
        res.status(500).json({ message: "Server error while fetching bill" });
    }
};

export const createBill = async (req, res) => {
    try {
        const {
            patient,
            billNumber,
            billDate,
            consultationFee,
            medicineCharges,
            labCharges,
            otherCharges,
            totalAmount,
            paymentStatus,
            paymentMethod,
            notes
        } = req.body;

        if (!patient || !billNumber || totalAmount === undefined) {
            return res.status(400).json({
                message: "Patient, bill number and total amount are required"
            });
        }

        const bill = await Billing.create({
            patient,
            billNumber,
            billDate,
            consultationFee,
            medicineCharges,
            labCharges,
            otherCharges,
            totalAmount,
            paymentStatus,
            paymentMethod,
            notes
        });

        const populatedBill = await Billing.findById(bill._id)
            .populate("patient", "name phone email");

        res.status(201).json({ message: "Bill created successfully", bill: populatedBill });
    } catch (error) {
        console.error("Create bill error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "Bill number already exists" });
        }
        res.status(500).json({ message: "Server error while creating bill" });
    }
};

export const updateBill = async (req, res) => {
    try {
        const bill = await Billing.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate("patient", "name phone email");

        if (!bill) return res.status(404).json({ message: "Bill not found" });

        res.status(200).json({ message: "Bill updated successfully", bill });
    } catch (error) {
        console.error("Update bill error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "Bill number already exists" });
        }
        res.status(500).json({ message: "Server error while updating bill" });
    }
};

export const deleteBill = async (req, res) => {
    try {
        const bill = await Billing.findByIdAndDelete(req.params.id);
        if (!bill) return res.status(404).json({ message: "Bill not found" });
        res.status(200).json({ message: "Bill deleted successfully" });
    } catch (error) {
        console.error("Delete bill error:", error);
        res.status(500).json({ message: "Server error while deleting bill" });
    }
};
