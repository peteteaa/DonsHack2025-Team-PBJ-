import { Router } from "express";
import FlashcardsController from "../controllers/flashcards.controller";

// Merge params allows us to access the videoID from the parent route
const router = Router({ mergeParams: true });

router.get("/", FlashcardsController.readAll);
router.post("/", FlashcardsController.create);
router.get("/:id", FlashcardsController.readOne);
router.patch("/:id", FlashcardsController.patch);
router.put("/:id", FlashcardsController.update);
router.delete("/:id", FlashcardsController.delete);

export default router;
