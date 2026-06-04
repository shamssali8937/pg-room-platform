import { Router } from "express";
import * as ctrl from "../controllers/booking.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createBookingSchema, updateBookingStatusSchema } from "../validators/booking.schema.js";

const router: Router = Router();

router.use(authenticate);

// Tenant routes
router.post("/room/:roomId", authorize("tenant"), validate(createBookingSchema), ctrl.createBooking);
router.get("/tenant", authorize("tenant"), ctrl.getTenantBookings);
router.patch("/:id/cancel", authorize("tenant"), ctrl.cancelBooking);

// Owner routes
router.get("/owner", authorize("owner"), ctrl.getOwnerBookings);
router.patch("/:id/status", authorize("owner"), validate(updateBookingStatusSchema), ctrl.updateBookingStatus);

export default router;
