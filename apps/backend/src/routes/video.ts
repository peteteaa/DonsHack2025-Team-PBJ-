import { Router } from "express";
import VideoController from "../controllers/video.controller";
import notesRoutes from "./notes";
const router = Router();

// Routes for the notes of a specific video

router.post("/process", VideoController.processVideo);
router.use("/notes/:videoID", notesRoutes);
router.get("/:videoID", VideoController.getVideo);

export default router;
