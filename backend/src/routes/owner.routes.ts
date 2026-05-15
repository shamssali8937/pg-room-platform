import { Router } from "express";
import * as ctrl from "../controllers/owner.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router: Router = Router();

router.use(authenticate, authorize("owner"));

router.get("/rooms", ctrl.getOwnerRooms);
router.get("/rooms/:id/stats", ctrl.getOwnerRoomStats);
router.post("/rooms/:id/boost", ctrl.boostRoom);
router.post("/rooms/:id/feature", ctrl.featureRoom);
router.get("/points", ctrl.getOwnerPoints);
router.get("/points/transactions", ctrl.getOwnerPointTransactions);

export default router;
