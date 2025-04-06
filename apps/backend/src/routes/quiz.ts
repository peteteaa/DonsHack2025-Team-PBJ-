import { Router } from "express";
import QuizController from "../controllers/quiz.controller";

// Merge params allows us to access the videoID from the parent route
const router = Router({ mergeParams: true });

router.post("/", QuizController.create);

export default router;
