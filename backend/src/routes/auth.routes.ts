// import express from "express";
import { Router } from "express";
import { signup, login } from "../controllers/auth.controller.js";

// const router = express.Router();
const router: Router = Router();

router.post("/signup", signup);
router.post("/login", login);

export default router;