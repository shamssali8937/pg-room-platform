import { Router } from "express";
import * as ctrl from "../controllers/chat.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router: Router = Router();

router.use(authenticate);

router.get("/conversations", ctrl.getConversations);
router.post("/conversations", ctrl.createConversation);
router.get("/conversations/:id/messages", ctrl.getMessages);
router.post("/messages", ctrl.sendMessage);
router.post("/conversations/:id/block", ctrl.blockConversation);
// NOTE: /conversations/:id/report is handled by global report route targeting 'conversation' or 'user' type

export default router;
