import { Router } from "express";
import NotesController from "../controllers/notes.controller";

// Merge params allows us to access the videoID from the parent route
const router = Router({ mergeParams: true });

router.get("/", NotesController.read);
router.post("/", NotesController.save);
router.patch("/update/:id", NotesController.patch);

export default router;
