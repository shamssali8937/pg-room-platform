import express from "express";
import * as ctrl from "../controllers/room.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

// PUBLIC
router.get("/", ctrl.getRooms);
router.get("/:id", ctrl.getRoomById);

// OWNER
router.post("/", authenticate, upload.array("images", 10), ctrl.createRoom);
router.patch("/:id", authenticate, ctrl.updateRoom);
router.delete("/:id", authenticate, ctrl.deleteRoom);

// SAVE
router.post("/:id/save", authenticate, ctrl.saveRoom);
router.delete("/:id/save", authenticate, ctrl.unsaveRoom);
router.get("/saved/list", authenticate, ctrl.getSavedRooms);

// REPORT
router.post("/:id/report", authenticate, ctrl.reportRoom);

// SUBMIT
router.post("/:id/submit", authenticate, ctrl.submitRoom);

export default router;