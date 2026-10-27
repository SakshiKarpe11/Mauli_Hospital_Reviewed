import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },

        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true
        },

        appointmentDate: {
            type: Date,
            required: true
        },

        appointmentTime: {
            type: String,
            required: true
        },

        reason: {
            type: String,
            trim: true
        },

        status: {
            type: String,
            enum: ["Scheduled", "Completed", "Cancelled"],
            default: "Scheduled"
        }
    },
    {
        timestamps: true
    }
);

const Appointment = mongoose.model(
    "Appointment",
    appointmentSchema
);

export default Appointment;