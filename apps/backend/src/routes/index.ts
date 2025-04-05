import { Router } from "express";
import auth from "./auth";

const router = Router();

router.get("/", (_req, res) => {
	res.json({ name: "DonsFlow" });
});

router.use("/auth", auth);

export default router;
