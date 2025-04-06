import { Router } from "express";
import VideoController from "../controllers/video.controller";
import noteRoutes from "./notes";
import flashcardRoutes from "./flashcards";
const router = Router();

// Routes for the notes of a specific video

router.post("/process", VideoController.processVideo);
router.use("/:videoID/notes/", noteRoutes);
router.use("/:videoID/flashcards/", flashcardRoutes);
router.get("/:videoID", VideoController.getVideo);
router.get("/", VideoController.getAllUserVideos);

export default router;
