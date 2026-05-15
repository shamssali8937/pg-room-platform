import { Router } from "express";
import * as ctrl from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router: Router = Router();

router.use(authenticate, authorize("admin"));

router.get("/listings", ctrl.getAllListings);
router.get("/listings/pending", ctrl.getPendingListings);
router.post("/listings/:id/moderate", ctrl.moderateListing);

router.get("/users", ctrl.getUsers);
router.patch("/users/:id/status", ctrl.updateUserStatus);

router.get("/reports", ctrl.getReports);
router.post("/reports/:id/resolve", ctrl.resolveReport);

router.get("/points/transactions", ctrl.getPointsTransactions);
router.post("/points/:ownerId/adjust", ctrl.adjustPoints);

router.get("/audit-actions", ctrl.getAuditActions);

export default router;
