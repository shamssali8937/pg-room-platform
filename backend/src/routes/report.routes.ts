import { Router } from "express";
import * as ctrl from "../controllers/report.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router: Router = Router();

router.use(authenticate);

router.post("/reports", ctrl.createReport);
router.get("/users/me/reports", ctrl.getMyReports);
// NOTE: /rooms/:id/report is already handled in room.routes.ts, 
// and /reviews/:id/report and /chat/conversations/:id/report 
// can either reuse this general POST /reports endpoint by passing targetType and targetId in body, 
// or have specific routes. The generalized /reports is the most RESTful based on the schema.

export default router;
