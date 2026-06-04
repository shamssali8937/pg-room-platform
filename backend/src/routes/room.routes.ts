import express, { Router } from "express";
import * as ctrl from "../controllers/room.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createRoomSchema, updateRoomSchema, reportRoomSchema } from "../validators/room.schema.js";

const router: Router = express.Router();

// PUBLIC
router.get("/", ctrl.getRooms);
router.get("/:id", ctrl.getRoomById);

// OWNER ONLY — must be authenticated AND have role "owner"
router.post("/", authenticate, authorize("owner"), upload.array("images", 10), validate(createRoomSchema), ctrl.createRoom);
router.patch("/:id", authenticate, authorize("owner"), validate(updateRoomSchema), ctrl.updateRoom);
router.delete("/:id", authenticate, authorize("owner"), ctrl.deleteRoom);

// SAVE
router.post("/:id/save", authenticate, ctrl.saveRoom);
router.delete("/:id/save", authenticate, ctrl.unsaveRoom);
router.get("/saved/list", authenticate, ctrl.getSavedRooms);

// REPORT
router.post("/:id/report", authenticate, validate(reportRoomSchema), ctrl.reportRoom);

// SUBMIT
router.post("/:id/submit", authenticate, ctrl.submitRoom);

export default router;