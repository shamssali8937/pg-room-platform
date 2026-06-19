import express, { Router } from "express";
import * as ctrl from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router: Router = express.Router();

router.use(authenticate);

router.get("/me", ctrl.getMe);
router.patch("/me", upload.single("image"), ctrl.updateMe);
router.patch("/me/card", ctrl.saveCard);
router.get("/me/notifications", ctrl.getMyNotifications);
router.patch("/me/notifications/:id/read", ctrl.markNotificationRead);
router.get("/me/contacted-owners", ctrl.getContactedOwners);
router.get("/me/points", ctrl.getMyPoints);
router.get("/me/points/transactions", ctrl.getMyPointTransactions);

// Identity documents
router.get("/me/documents", ctrl.getMyDocuments);
router.post("/me/documents", upload.single("file"), ctrl.uploadDocument);
router.post("/me/documents/:docType", upload.single("file"), ctrl.uploadDocument);

export default router;