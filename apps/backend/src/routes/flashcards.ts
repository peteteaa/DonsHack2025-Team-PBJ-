import { Router } from "express";
import FlashcardsController from "../controllers/flashcards.controller";

// Merge params allows us to access the videoID from the parent route
const router = Router({ mergeParams: true });

router.get("/", FlashcardsController.read);
router.post("/", FlashcardsController.create);
router.patch("/update/:id", FlashcardsController.patch);

export default router;
