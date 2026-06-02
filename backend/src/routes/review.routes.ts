import { Router } from "express";
import * as ctrl from "../controllers/review.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createReviewSchema, updateReviewSchema, reportReviewSchema } from "../validators/review.schema.js";

const router: Router = Router();

router.get("/rooms/:roomId/reviews", ctrl.getRoomReviews);

router.use(authenticate);

router.post("/reviews", validate(createReviewSchema), ctrl.createReview);
router.patch("/reviews/:id", validate(updateReviewSchema), ctrl.updateReview);
router.post("/reviews/:id/report", validate(reportReviewSchema), ctrl.reportReview);

export default router;
