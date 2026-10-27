import express from "express";
import {
    getDoctors,
    getMyDoctor,
    getMyPatients,
    getDoctorById,
    createDoctor,
    updateDoctor,
    deleteDoctor
} from "../controllers/doctorController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.get("/me", authorize("doctor"), getMyDoctor);
router.get("/me/patients", authorize("doctor"), getMyPatients);
router.get("/", authorize("admin"), getDoctors);
router.get("/:id", authorize("admin"), getDoctorById);
router.post("/", authorize("admin"), createDoctor);
router.put("/:id", authorize("admin"), updateDoctor);
router.delete("/:id", authorize("admin"), deleteDoctor);

export default router;
