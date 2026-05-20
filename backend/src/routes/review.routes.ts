import { Router } from "express";
import * as ctrl from "../controllers/review.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router: Router = Router();

router.get("/rooms/:roomId/reviews", ctrl.getRoomReviews);

router.use(authenticate);

router.post("/reviews", ctrl.createReview);
router.patch("/reviews/:id", ctrl.updateReview);

export default router;
