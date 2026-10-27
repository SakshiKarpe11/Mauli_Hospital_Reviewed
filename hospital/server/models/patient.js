import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            trim: true,
            lowercase: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        dateOfBirth: {
            type: Date
        },

        age: {
            type: Number,
            min: 0,
            max: 120
        },

        gender: {
            type: String,
            enum: ["Male", "Female", "Other", ""]
        },

        bloodGroup: {
            type: String,
            enum: [
                "",
                "A+",
                "A-",
                "B+",
                "B-",
                "AB+",
                "AB-",
                "O+",
                "O-"
            ]
        },

        address: {
            type: String,
            trim: true
        },

        emergencyContact: {
            type: String,
            trim: true
        },

        medicalHistory: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;