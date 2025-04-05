import { Router } from "express";
import authMiddleware from "../middlewares/auth";
import authRoutes from "./auth";
import videoRoutes from "./video";

const router = Router();

router.get("/", (_req, res) => {
	res.json({ name: "DonsFlow" });
});

router.use("/auth", authRoutes);
router.use("/video", authMiddleware, videoRoutes);

export default router;
