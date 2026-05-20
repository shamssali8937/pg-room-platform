import { Router } from "express";
import { healthCheck, detailedHealthCheck } from "../controllers/health.controller.js";

const router: Router = Router();

/** GET /health — lightweight k8s readiness probe */
router.get("/", healthCheck);

/** GET /health/detailed — rich system & DB metrics */
router.get("/detailed", detailedHealthCheck);

export default router;
