import mongoose from "mongoose";

const billingSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },

        billNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        billDate: {
            type: Date,
            default: Date.now
        },

        consultationFee: {
            type: Number,
            default: 0,
            min: 0
        },

        medicineCharges: {
            type: Number,
            default: 0,
            min: 0
        },

        labCharges: {
            type: Number,
            default: 0,
            min: 0
        },

        otherCharges: {
            type: Number,
            default: 0,
            min: 0
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        paymentStatus: {
            type: String,
            enum: ["Paid", "Pending", "Partial"],
            default: "Pending"
        },

        paymentMethod: {
            type: String,
            enum: ["Cash", "UPI", "Card", "Online", ""],
            default: ""
        },

        notes: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Billing = mongoose.model(
    "Billing",
    billingSchema
);

export default Billing;