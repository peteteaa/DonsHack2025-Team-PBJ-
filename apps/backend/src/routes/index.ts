import { Router } from "express";
import auth from "./auth";
import video from "./video";

const router = Router();

router.get("/", (_req, res) => {
	res.json({ name: "DonsFlow" });
});

router.use("/auth", auth);
router.use("/video", video);

export default router;
