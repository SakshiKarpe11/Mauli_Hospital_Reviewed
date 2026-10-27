import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/patient.js";
import User from "../models/user.js";

const getRoleQuery = async (req) => {
    if (req.user.role === "admin") return {};

    if (req.user.role === "doctor") {
        const user = await User.findById(req.user.userId);
        const fallbackDoctor = user?.email
            ? await Doctor.findOne({ email: user.email })
            : null;

        return fallbackDoctor ? { doctor: fallbackDoctor._id } : { doctor: null };
    }

    if (req.user.role === "patient") {
        const user = await User.findById(req.user.userId);
        const patient = user?.email
            ? await Patient.findOne({ email: user.email })
            : null;

        return patient ? { patient: patient._id } : { patient: null };
    }

    return { _id: null };
};

export const getAppointments = async (req, res) => {
    try {
        const query = await getRoleQuery(req);

        const appointments = await Appointment.find(query)
            .populate("patient", "name phone email")
            .populate("doctor", "name specialization email")
            .sort({ appointmentDate: 1, appointmentTime: 1 });

        res.status(200).json(appointments);
    } catch (error) {
        console.error("Get appointments error:", error);
        res.status(500).json({ message: "Server error while fetching appointments" });
    }
};

export const getTodayAppointments = async (req, res) => {
    try {
        const roleQuery = await getRoleQuery(req);
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const appointments = await Appointment.find({
            ...roleQuery,
            appointmentDate: { $gte: startOfDay, $lte: endOfDay }
        })
            .populate("patient", "name phone email")
            .populate("doctor", "name specialization email")
            .sort({ appointmentTime: 1 });

        res.status(200).json(appointments);
    } catch (error) {
        console.error("Get today's appointments error:", error);
        res.status(500).json({ message: "Server error while fetching today's appointments" });
    }
};

export const createAppointment = async (req, res) => {
    try {
        const { patient, doctor, appointmentDate, appointmentTime, reason } = req.body;

        if (!patient || !doctor || !appointmentDate || !appointmentTime) {
            return res.status(400).json({
                message: "Patient, doctor, date and time are required"
            });
        }

        const appointment = await Appointment.create({
            patient,
            doctor,
            appointmentDate,
            appointmentTime,
            reason
        });

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate("patient", "name phone email")
            .populate("doctor", "name specialization email");

        res.status(201).json({
            message: "Appointment created successfully",
            appointment: populatedAppointment
        });
    } catch (error) {
        console.error("Create appointment error:", error);
        res.status(500).json({ message: "Server error while creating appointment" });
    }
};

export const updateAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (req.user.role === "doctor") {
            const roleQuery = await getRoleQuery(req);
            const ownDoctorId = roleQuery.doctor;

            if (!ownDoctorId || appointment.doctor.toString() !== ownDoctorId.toString()) {
                return res.status(403).json({ message: "You can update only your appointments" });
            }

            // Doctors may update status or reschedule their own appointments.
            if (req.body.status !== undefined) {
                if (!["Scheduled", "Completed", "Cancelled"].includes(req.body.status)) {
                    return res.status(400).json({ message: "Invalid appointment status" });
                }
                appointment.status = req.body.status;
            }

            const isRescheduling =
                req.body.appointmentDate !== undefined ||
                req.body.appointmentTime !== undefined;

            if (isRescheduling) {
                if (!req.body.appointmentDate || !req.body.appointmentTime) {
                    return res.status(400).json({
                        message: "A new appointment date and time are both required"
                    });
                }

                const newDate = new Date(req.body.appointmentDate);
                if (Number.isNaN(newDate.getTime())) {
                    return res.status(400).json({ message: "Please provide a valid appointment date" });
                }

                const newDateOnly = new Date(newDate);
                newDateOnly.setHours(0, 0, 0, 0);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (newDateOnly < today) {
                    return res.status(400).json({ message: "The new appointment date must be today or later" });
                }

                const conflictingAppointment = await Appointment.findOne({
                    _id: { $ne: appointment._id },
                    doctor: appointment.doctor,
                    appointmentDate: {
                        $gte: new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate()),
                        $lt: new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate() + 1)
                    },
                    appointmentTime: req.body.appointmentTime,
                    status: "Scheduled"
                });

                if (conflictingAppointment) {
                    return res.status(409).json({
                        message: "This doctor already has a scheduled appointment at that date and time. Please choose another slot."
                    });
                }

                appointment.appointmentDate = newDate;
                appointment.appointmentTime = req.body.appointmentTime;
                // Keep the appointment scheduled after a successful reschedule.
                appointment.status = "Scheduled";
            }
        } else if (req.user.role === "admin") {
            Object.assign(appointment, req.body);
        } else {
            return res.status(403).json({ message: "You are not authorized to update appointments" });
        }

        await appointment.save();

        const populated = await Appointment.findById(appointment._id)
            .populate("patient", "name phone email")
            .populate("doctor", "name specialization email");

        res.status(200).json({
            message: "Appointment updated successfully",
            appointment: populated
        });
    } catch (error) {
        console.error("Update appointment error:", error);
        res.status(500).json({ message: "Server error while updating appointment" });
    }
};

export const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        res.status(200).json({ message: "Appointment deleted successfully" });
    } catch (error) {
        console.error("Delete appointment error:", error);
        res.status(500).json({ message: "Server error while deleting appointment" });
    }
};
