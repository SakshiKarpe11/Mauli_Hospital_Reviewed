import MedicalRecord from "../models/MedicalRecord.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/patient.js";
import User from "../models/user.js";

const getOwnRelation = async (req) => {
    const user = await User.findById(req.user.userId);
    if (!user) return null;

    if (req.user.role === "doctor") {
        return Doctor.findOne({ email: user.email });
    }

    if (req.user.role === "patient") {
        return Patient.findOne({ email: user.email });
    }

    return null;
};

export const getMedicalRecords = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === "doctor") {
            const doctor = await getOwnRelation(req);
            query = { doctor: doctor?._id || null };
        } else if (req.user.role === "patient") {
            const patient = await getOwnRelation(req);
            query = { patient: patient?._id || null };
        }

        const records = await MedicalRecord.find(query)
            .populate("patient", "name phone email")
            .populate("doctor", "name specialization email")
            .sort({ recordDate: -1 });

        res.status(200).json(records);
    } catch (error) {
        console.error("Get medical records error:", error);
        res.status(500).json({ message: "Server error while fetching medical records" });
    }
};

export const getMedicalRecordById = async (req, res) => {
    try {
        const record = await MedicalRecord.findById(req.params.id)
            .populate("patient", "name phone email")
            .populate("doctor", "name specialization email");

        if (!record) {
            return res.status(404).json({ message: "Medical record not found" });
        }

        if (req.user.role === "doctor") {
            const doctor = await getOwnRelation(req);
            if (!doctor || record.doctor._id.toString() !== doctor._id.toString()) {
                return res.status(403).json({ message: "You are not authorized to view this record" });
            }
        }

        if (req.user.role === "patient") {
            const patient = await getOwnRelation(req);
            if (!patient || record.patient._id.toString() !== patient._id.toString()) {
                return res.status(403).json({ message: "You are not authorized to view this record" });
            }
        }

        res.status(200).json(record);
    } catch (error) {
        console.error("Get medical record error:", error);
        res.status(500).json({ message: "Server error while fetching medical record" });
    }
};

export const createMedicalRecord = async (req, res) => {
    try {
        const { patient, doctor, diagnosis, symptoms, medicines, notes, recordDate } = req.body;

        if (!patient || !doctor || !diagnosis) {
            return res.status(400).json({ message: "Patient, doctor and diagnosis are required" });
        }

        if (req.user.role === "doctor") {
            const ownDoctor = await getOwnRelation(req);
            if (!ownDoctor || ownDoctor._id.toString() !== doctor.toString()) {
                return res.status(403).json({ message: "You can create records only for yourself as doctor" });
            }
        }

        const record = await MedicalRecord.create({
            patient,
            doctor,
            diagnosis,
            symptoms,
            medicines,
            notes,
            recordDate
        });

        const populatedRecord = await MedicalRecord.findById(record._id)
            .populate("patient", "name phone email")
            .populate("doctor", "name specialization email");

        res.status(201).json({
            message: "Medical record created successfully",
            record: populatedRecord
        });
    } catch (error) {
        console.error("Create medical record error:", error);
        res.status(500).json({ message: "Server error while creating medical record" });
    }
};

export const updateMedicalRecord = async (req, res) => {
    try {
        const record = await MedicalRecord.findById(req.params.id);
        if (!record) return res.status(404).json({ message: "Medical record not found" });

        if (req.user.role === "doctor") {
            const doctor = await getOwnRelation(req);
            if (!doctor || record.doctor.toString() !== doctor._id.toString()) {
                return res.status(403).json({ message: "You can update only your own records" });
            }
            delete req.body.doctor;
            delete req.body.patient;
        } else if (req.user.role !== "admin") {
            return res.status(403).json({ message: "You are not authorized to update medical records" });
        }

        Object.assign(record, req.body);
        await record.save();

        const populated = await MedicalRecord.findById(record._id)
            .populate("patient", "name phone email")
            .populate("doctor", "name specialization email");

        res.status(200).json({
            message: "Medical record updated successfully",
            record: populated
        });
    } catch (error) {
        console.error("Update medical record error:", error);
        res.status(500).json({ message: "Server error while updating medical record" });
    }
};

export const deleteMedicalRecord = async (req, res) => {
    try {
        const record = await MedicalRecord.findById(req.params.id);
        if (!record) return res.status(404).json({ message: "Medical record not found" });

        if (req.user.role === "doctor") {
            const doctor = await getOwnRelation(req);
            if (!doctor || record.doctor.toString() !== doctor._id.toString()) {
                return res.status(403).json({ message: "You can delete only your own records" });
            }
        } else if (req.user.role !== "admin") {
            return res.status(403).json({ message: "You are not authorized to delete medical records" });
        }

        await record.deleteOne();
        res.status(200).json({ message: "Medical record deleted successfully" });
    } catch (error) {
        console.error("Delete medical record error:", error);
        res.status(500).json({ message: "Server error while deleting medical record" });
    }
};
