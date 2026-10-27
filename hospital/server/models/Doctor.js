import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        specialization: {
            type: String,
            required: true,
            trim: true
        },

        qualification: {
            type: String,
            trim: true
        },

        experience: {
            type: Number,
            min: 0
        },

        consultationFee: {
            type: Number,
            min: 0
        },

        availableDays: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;