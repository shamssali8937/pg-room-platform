import { Router } from "express";
import * as ctrl from "../controllers/booking.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router: Router = Router();

router.use(authenticate);

// Tenant routes
router.post("/room/:roomId", authorize("tenant"), ctrl.createBooking);
router.get("/tenant", authorize("tenant"), ctrl.getTenantBookings);
router.patch("/:id/cancel", authorize("tenant"), ctrl.cancelBooking);

// Owner routes
router.get("/owner", authorize("owner"), ctrl.getOwnerBookings);
router.patch("/:id/status", authorize("owner"), ctrl.updateBookingStatus);

export default router;
