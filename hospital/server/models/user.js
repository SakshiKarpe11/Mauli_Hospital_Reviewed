import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        // Password is absent for Google-only accounts. Explicitly select it for password login.
        password: { type: String, required: false, select: false },
        role: { type: String, enum: ["admin", "doctor", "patient"], required: true },
        phone: { type: String, trim: true },
        googleId: { type: String, sparse: true },
        passwordResetOtpHash: { type: String, select: false },
        passwordResetOtpExpires: { type: Date, select: false },
        passwordResetOtpAttempts: { type: Number, default: 0, select: false }
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
