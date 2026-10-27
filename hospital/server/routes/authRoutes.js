import express from "express";
import { registerUser, loginUser, forgotPassword, resetPassword, googleLogin } from "../controllers/authController.js";

const router = express.Router();
router.get("/test", (req, res) => res.json({ message: "Authentication route is working" }));
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/google", googleLogin);
export default router;
