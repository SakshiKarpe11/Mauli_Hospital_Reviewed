import Doctor from "../models/Doctor.js";
import User from "../models/user.js";
import Appointment from "../models/Appointment.js";

export const getDoctors = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Only admin can view all doctors" });
        }
        const doctors = await Doctor.find().sort({ createdAt: -1 });
        res.status(200).json(doctors);
    } catch (error) {
        console.error("Get doctors error:", error);
        res.status(500).json({ message: "Server error while fetching doctors" });
    }
};

export const getMyDoctor = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const doctor = user?.email ? await Doctor.findOne({ email: user.email }) : null;
        if (!doctor) return res.status(404).json({ message: "Doctor profile not found for this account" });
        res.json(doctor);
    } catch (error) {
        console.error("Get my doctor error:", error);
        res.status(500).json({ message: "Server error while fetching doctor profile" });
    }
};

export const getMyPatients = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const doctor = user?.email ? await Doctor.findOne({ email: user.email }) : null;
        if (!doctor) return res.status(404).json({ message: "Doctor profile not found for this account" });

        const appointments = await Appointment.find({ doctor: doctor._id })
            .populate("patient", "name email phone dateOfBirth gender bloodGroup address emergencyContact medicalHistory")
            .sort({ appointmentDate: -1 });

        const patients = [];
        const seen = new Set();
        for (const appointment of appointments) {
            const patient = appointment.patient;
            if (patient && !seen.has(patient._id.toString())) {
                seen.add(patient._id.toString());
                patients.push(patient);
            }
        }

        res.json(patients);
    } catch (error) {
        console.error("Get doctor patients error:", error);
        res.status(500).json({ message: "Server error while fetching doctor patients" });
    }
};

export const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });
        if (req.user.role !== "admin") return res.status(403).json({ message: "You are not authorized to view this doctor" });
        res.status(200).json(doctor);
    } catch (error) {
        console.error("Get doctor error:", error);
        res.status(500).json({ message: "Server error while fetching doctor" });
    }
};

export const createDoctor = async (req, res) => {
    try {
        const { name, email, phone, specialization, qualification, experience, consultationFee, availableDays } = req.body;
        if (!name || !email || !phone || !specialization) {
            return res.status(400).json({ message: "Name, email, phone and specialization are required" });
        }
        const existingDoctor = await Doctor.findOne({ email });
        if (existingDoctor) return res.status(400).json({ message: "Doctor with this email already exists" });

        const doctor = await Doctor.create({ name, email, phone, specialization, qualification, experience, consultationFee, availableDays });
        res.status(201).json({ message: "Doctor created successfully", doctor });
    } catch (error) {
        console.error("Create doctor error:", error);
        res.status(500).json({ message: "Server error while creating doctor" });
    }
};

export const updateDoctor = async (req, res) => {
    try {
        const existingDoctor = await Doctor.findById(req.params.id);
        if (!existingDoctor) return res.status(404).json({ message: "Doctor not found" });
        const oldEmail = existingDoctor.email;

        const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        if (oldEmail && doctor.email && oldEmail !== doctor.email) {
            await User.updateOne({ email: oldEmail, role: "doctor" }, { $set: { email: doctor.email } });
        }

        res.status(200).json({ message: "Doctor updated successfully", doctor });
    } catch (error) {
        console.error("Update doctor error:", error);
        res.status(500).json({ message: "Server error while updating doctor" });
    }
};

export const deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });
        res.status(200).json({ message: "Doctor deleted successfully" });
    } catch (error) {
        console.error("Delete doctor error:", error);
        res.status(500).json({ message: "Server error while deleting doctor" });
    }
};
