import express from "express";
import * as ctrl from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/me", ctrl.getMe);
router.patch("/me", upload.single("image"), ctrl.updateMe);
router.get("/me/notifications", ctrl.getMyNotifications);
router.patch("/me/notifications/:id/read", ctrl.markNotificationRead);

// Identity documents
router.get("/me/documents", ctrl.getMyDocuments);
router.post("/me/documents", upload.single("file"), ctrl.uploadDocument);
router.post("/me/documents/:docType", upload.single("file"), ctrl.uploadDocument);

export default router;