import Patient from "../models/patient.js";
import User from "../models/user.js";

export const getPatients = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Only admin can view all patients" });
        }
        const patients = await Patient.find().sort({ createdAt: -1 });
        res.json(patients);
    } catch (error) {
        console.error("Get patients error:", error);
        res.status(500).json({ message: "Server error while fetching patients" });
    }
};

export const getMyPatient = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const patient = user?.email ? await Patient.findOne({ email: user.email }) : null;

        if (!patient) {
            return res.status(404).json({ message: "Patient profile not found for this account" });
        }

        res.json(patient);
    } catch (error) {
        console.error("Get my patient error:", error);
        res.status(500).json({ message: "Server error while fetching patient profile" });
    }
};

export const updateMyPatient = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: "Patient account not found" });

        const patient = await Patient.findOne({ email: user.email });
        if (!patient) return res.status(404).json({ message: "Patient profile not found" });

        const allowedFields = [
            "name", "phone", "dateOfBirth", "age", "gender", "bloodGroup",
            "address", "emergencyContact", "medicalHistory"
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) patient[field] = req.body[field];
        }

        await patient.save();

        if (req.body.name && req.body.name.trim()) {
            user.name = req.body.name.trim();
            await user.save();
        }

        res.json({ message: "Patient registration updated successfully", patient });
    } catch (error) {
        console.error("Update my patient error:", error);
        res.status(500).json({ message: "Server error while updating patient profile" });
    }
};

export const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ message: "Patient not found" });

        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "You are not authorized to view this patient" });
        }

        res.json(patient);
    } catch (error) {
        console.error("Get patient error:", error);
        res.status(500).json({ message: "Server error while fetching patient" });
    }
};

export const createPatient = async (req, res) => {
    try {
        const { name, email, phone, age, dateOfBirth, gender, bloodGroup, address, emergencyContact, medicalHistory } = req.body;
        if (!name || !phone) {
            return res.status(400).json({ message: "Patient name and phone are required" });
        }

        const normalizedEmail = email?.trim().toLowerCase();
        if (normalizedEmail) {
            const duplicate = await Patient.findOne({ email: normalizedEmail });
            if (duplicate) return res.status(400).json({ message: "A patient with this email already exists" });
        }

        const patient = await Patient.create({
            name,
            email: normalizedEmail,
            phone,
            age,
            dateOfBirth,
            gender,
            bloodGroup,
            address,
            emergencyContact,
            medicalHistory
        });

        res.status(201).json({ message: "Patient registered successfully", patient });
    } catch (error) {
        console.error("Create patient error:", error);
        res.status(500).json({ message: "Server error while creating patient" });
    }
};

export const updatePatient = async (req, res) => {
    try {
        const existingPatient = await Patient.findById(req.params.id);
        if (!existingPatient) return res.status(404).json({ message: "Patient not found" });
        const oldEmail = existingPatient.email;

        if (req.body.email) {
            const normalizedEmail = req.body.email.trim().toLowerCase();
            const duplicate = await Patient.findOne({ email: normalizedEmail, _id: { $ne: req.params.id } });
            if (duplicate) return res.status(400).json({ message: "A patient with this email already exists" });
            req.body.email = normalizedEmail;
        }

        const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (oldEmail && patient.email && oldEmail !== patient.email) {
            await User.updateOne({ email: oldEmail, role: "patient" }, { $set: { email: patient.email } });
        }

        res.json({ message: "Patient updated successfully", patient });
    } catch (error) {
        console.error("Update patient error:", error);
        res.status(500).json({ message: "Server error while updating patient" });
    }
};

export const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);
        if (!patient) return res.status(404).json({ message: "Patient not found" });
        res.json({ message: "Patient deleted successfully" });
    } catch (error) {
        console.error("Delete patient error:", error);
        res.status(500).json({ message: "Server error while deleting patient" });
    }
};
