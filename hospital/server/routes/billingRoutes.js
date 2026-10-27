import express from "express";
import {
    getBills,
    getBillById,
    createBill,
    updateBill,
    deleteBill
} from "../controllers/billingController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();
router.use(authenticate);

router.get("/", authorize("admin", "patient"), getBills);
router.get("/:id", authorize("admin", "patient"), getBillById);
router.post("/", authorize("admin"), createBill);
router.put("/:id", authorize("admin"), updateBill);
router.delete("/:id", authorize("admin"), deleteBill);

export default router;
