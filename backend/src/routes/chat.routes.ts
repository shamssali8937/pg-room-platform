import { Router } from "express";
import * as ctrl from "../controllers/chat.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router: Router = Router();

router.use(authenticate);

// Conversations Management
router.get("/conversations", ctrl.getConversations);
router.post("/conversations", ctrl.createConversation);
router.get("/conversations/:id/messages", ctrl.getMessages);
router.get("/conversations/:id/media", ctrl.getConversationMedia);

// Pin/Archive/Mute/Clear
router.post("/conversations/:id/pin", ctrl.pinConversation);
router.post("/conversations/:id/archive", ctrl.archiveConversation);
router.post("/conversations/:id/mute", ctrl.muteConversation);
router.delete("/conversations/:id/clear", ctrl.clearChat);

// Block / Unblock Contact
router.post("/conversations/:id/block", ctrl.blockConversation);
router.post("/conversations/:id/unblock", ctrl.unblockConversation);

// Messages Management
router.post("/messages", upload.array("files", 10), ctrl.sendMessage); // supports multiple files attachment
router.put("/messages/:messageId", ctrl.editMessage); // edit text message
router.delete("/messages/:messageId", ctrl.deleteMessage); // delete message

// Message Reactions
router.post("/messages/:messageId/reactions", ctrl.addReaction);
router.delete("/messages/:messageId/reactions", ctrl.removeReaction);

// Booking Offers Special Negotiation Feature
router.post("/offers", ctrl.createBookingOffer);
router.post("/offers/:offerId/respond", ctrl.respondToBookingOffer);

export default router;
