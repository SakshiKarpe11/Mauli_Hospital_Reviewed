import express from "express";
import {
    getPatients,
    getMyPatient,
    updateMyPatient,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient
} from "../controllers/patientController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.get("/me", authorize("patient"), getMyPatient);
router.put("/me", authorize("patient"), updateMyPatient);
router.get("/", authorize("admin"), getPatients);
router.get("/:id", authorize("admin"), getPatientById);
router.post("/", authorize("admin"), createPatient);
router.put("/:id", authorize("admin"), updatePatient);
router.delete("/:id", authorize("admin"), deletePatient);

export default router;
