import { Router } from "express";
import AuthController from "../controllers/auth.controller";
const router = Router();

router.post("/login", AuthController.login);
router.get("/auth", AuthController.authenticate);
router.post("/logout", AuthController.logout);
router.get("/status", AuthController.status);

export default router;
