import { Router } from "express";
import VideoController from "../controllers/video.controller";
const router = Router();

router.post("/process", VideoController.processVideo);

export default router;
