import { Router } from "express";
import VideoController from "../controllers/video.controller";
import flashcardRoutes from "./flashcards";
import noteRoutes from "./notes";
import quizRoutes from "./quiz";
const router = Router();

// Routes for the notes of a specific video

router.post("/process", VideoController.processVideo);
router.use("/:videoID/notes/", noteRoutes);
router.use("/:videoID/flashcards/", flashcardRoutes);
router.use("/:videoID/quiz/", quizRoutes);
router.get("/:videoID", VideoController.getVideo);
router.get("/", VideoController.getAllUserVideos);

export default router;
