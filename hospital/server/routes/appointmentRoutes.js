import express from "express";
import {
    getAppointments,
    getTodayAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment
} from "../controllers/appointmentController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();
router.use(authenticate);

router.get("/", authorize("admin", "doctor", "patient"), getAppointments);
router.get("/today", authorize("admin", "doctor", "patient"), getTodayAppointments);
router.post("/", authorize("admin"), createAppointment);
router.put("/:id", authorize("admin", "doctor"), updateAppointment);
router.delete("/:id", authorize("admin"), deleteAppointment);

export default router;
