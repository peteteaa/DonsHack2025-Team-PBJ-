import { Router } from "express";
import VideoController from "../controllers/video.controller";
import notes from "./notes";
const router = Router();

// Routes for the notes of a specific video
router.use("/:videoID/notes", notes)

router.post("/process", VideoController.processVideo);

export default router;
