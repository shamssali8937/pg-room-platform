import { Router } from "express";
import { getOwnerDashboard, getAdminDashboard, getTenantDashboard } from "../controllers/dashboard.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router: Router = Router();

router.use(authenticate);

router.get("/owner", authorize("owner"), getOwnerDashboard);
router.get("/admin", authorize("admin"), getAdminDashboard);
router.get("/tenant", authorize("tenant"), getTenantDashboard);

export default router;
