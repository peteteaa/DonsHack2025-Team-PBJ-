import { Router } from "express";
import authMiddleware from "../middlewares/auth";
import auth from "./auth";
import video from "./video";

const router = Router();

router.get("/", (_req, res) => {
	res.json({ name: "DonsFlow" });
});

router.use("/auth", auth);
router.use("/video", authMiddleware, video);

export default router;
