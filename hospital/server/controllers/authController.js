import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.js";
import Patient from "../models/patient.js";
import Doctor from "../models/Doctor.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "Name, email, password and role are required" });
        }
        if (typeof password !== "string" || password.length < 8 || password.length > 128) {
            return res.status(400).json({ message: "Password must be 8 to 128 characters" });
        }
        if (!["admin", "doctor", "patient"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }
        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email: normalizedEmail, password: hashedPassword, role, phone });

        if (role === "patient") {
            const existingPatient = await Patient.findOne({ email: normalizedEmail });
            if (!existingPatient) await Patient.create({ name, email: normalizedEmail, phone: phone || "Not provided" });
        }
        if (role === "doctor") {
            const existingDoctor = await Doctor.findOne({ email: normalizedEmail });
            if (!existingDoctor) await Doctor.create({ name, email: normalizedEmail, phone: phone || "Not provided", specialization: "General Medicine" });
        }
        return res.status(201).json({
            message: "User registered successfully",
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Server error during registration" });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
        const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
        if (!user || !user.password) return res.status(401).json({ message: "Invalid email or password" });
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid email or password" });
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        return res.json({ message: "Login successful", token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error during login" });
    }
};


export const forgotPassword = async (req, res) => {
  const genericMessage =
    "If an account exists for this email, a verification code has been sent.";

  let user;

  try {
    const email = req.body.email?.toLowerCase().trim();

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    user = await User.findOne({ email }).select(
      "+passwordResetOtpHash +passwordResetOtpExpires"
    );

    // Do not reveal whether an account exists.
    if (!user) {
      return res.json({ message: genericMessage });
    }

    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
      console.error("Resend environment variables are missing.");

      return res.status(503).json({
        message: "Email service is temporarily unavailable.",
      });
    }

    // Generate a six-digit OTP valid for 10 minutes.
    const otp = String(
      crypto.randomInt(0, 1000000)
    ).padStart(6, "0");

    user.passwordResetOtpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    user.passwordResetOtpExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    user.passwordResetOtpAttempts = 0;

    await user.save();

    // Send the OTP using Resend's HTTPS API.
    const response = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM,
          to: [user.email],
          subject: "Mauli Hospital - Password Verification Code",
          text: `Your Mauli Hospital password reset verification code is: ${otp}

This code expires in 10 minutes.

If you did not request a password reset, please ignore this email.`,
        }),
      }
    );

    if (!response.ok) {
      const errorDetails = await response.text();

      console.error(
        "Resend email failed:",
        response.status,
        errorDetails
      );

      // Invalidate the OTP if the email could not be sent.
      user.passwordResetOtpHash = undefined;
      user.passwordResetOtpExpires = undefined;
      user.passwordResetOtpAttempts = 0;
      await user.save();

      return res.status(502).json({
        message: "Unable to send the verification email. Please try again later.",
      });
    }

    console.log("Password reset email accepted by Resend.");

    return res.json({ message: genericMessage });
  } catch (error) {
    console.error("Forgot password error:", {
      message: error.message,
      code: error.code,
    });

    // Avoid leaving a usable OTP after an unexpected sending error.
    if (user) {
      try {
        user.passwordResetOtpHash = undefined;
        user.passwordResetOtpExpires = undefined;
        user.passwordResetOtpAttempts = 0;
        await user.save();
      } catch (cleanupError) {
        console.error(
          "OTP cleanup failed:",
          cleanupError.message
        );
      }
    }

    return res.status(500).json({
      message: "Something went wrong. Please try again later.",
    });
  }
};


export const resetPassword = async (req, res) => {
    try {
        const email = req.body.email?.toLowerCase().trim();
        const otp = String(req.body.otp || "").trim();
        const { newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: "Email, verification code and new password are required" });
        }
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({ message: "Enter the 6-digit verification code." });
        }
        if (typeof newPassword !== "string" || newPassword.length < 8 || newPassword.length > 128) {
            return res.status(400).json({ message: "Password must be 8 to 128 characters" });
        }

        const user = await User.findOne({ email })
            .select("+password +passwordResetOtpHash +passwordResetOtpExpires +passwordResetOtpAttempts");
        if (!user || !user.passwordResetOtpHash || !user.passwordResetOtpExpires ||
            user.passwordResetOtpExpires <= new Date()) {
            return res.status(400).json({ message: "Verification code is invalid or expired. Request a new code." });
        }
        if ((user.passwordResetOtpAttempts || 0) >= 5) {
            return res.status(429).json({ message: "Too many incorrect attempts. Request a new verification code." });
        }

        const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
        if (hashedOtp !== user.passwordResetOtpHash) {
            user.passwordResetOtpAttempts = (user.passwordResetOtpAttempts || 0) + 1;
            await user.save();
            return res.status(400).json({ message: "Verification code is invalid or expired. Request a new code." });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.passwordResetOtpHash = undefined;
        user.passwordResetOtpExpires = undefined;
        user.passwordResetOtpAttempts = 0;
        await user.save();
        return res.json({ message: "Password updated successfully. Please log in with your new password." });
    } catch (error) {
        console.error("Reset password error:", error.message);
        return res.status(500).json({ message: "Unable to reset password" });
    }
};

export const googleLogin = async (req, res) => {
    try {
        const { credential, role } = req.body;
        if (!credential) return res.status(400).json({ message: "Google credential is required" });
        if (!["patient", "doctor"].includes(role)) return res.status(400).json({ message: "Choose a valid patient or doctor role" });
        if (!process.env.GOOGLE_CLIENT_ID) return res.status(500).json({ message: "Google sign-in is not configured" });
        const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
        const payload = ticket.getPayload();
        if (!payload?.email || payload.email_verified !== true || !payload.sub) {
            return res.status(401).json({ message: "Google account could not be verified" });
        }
        const email = payload.email.toLowerCase().trim();
        let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email }] });
        if (user) {
            if (user.role === "admin" || user.role !== role) {
                return res.status(403).json({ message: "This Google account is not registered for the selected role" });
            }
            if (user.googleId && user.googleId !== payload.sub) {
                return res.status(409).json({ message: "This email is linked to another Google account" });
            }
            if (!user.googleId) {
                user.googleId = payload.sub;
                await user.save();
            }
        } else {
            user = await User.create({ name: payload.name || email.split("@")[0], email, googleId: payload.sub, role });
            if (role === "patient") {
                if (!(await Patient.findOne({ email }))) await Patient.create({ name: user.name, email, phone: "Not provided" });
            } else {
                if (!(await Doctor.findOne({ email }))) await Doctor.create({ name: user.name, email, phone: "Not provided", specialization: "General Medicine" });
            }
        }
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        return res.json({ message: "Google sign-in successful", token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error("Google sign-in error:", error.message);
        return res.status(401).json({ message: "Google sign-in failed" });
    }
};
