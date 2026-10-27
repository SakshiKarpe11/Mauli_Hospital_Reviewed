import express from "express";
import {
    getMedicalRecords,
    getMedicalRecordById,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord
} from "../controllers/medicalRecordController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();
router.use(authenticate);

router.get("/", authorize("admin", "doctor", "patient"), getMedicalRecords);
router.get("/:id", authorize("admin", "doctor", "patient"), getMedicalRecordById);
router.post("/", authorize("admin", "doctor"), createMedicalRecord);
router.put("/:id", authorize("admin", "doctor"), updateMedicalRecord);
router.delete("/:id", authorize("admin", "doctor"), deleteMedicalRecord);

export default router;
