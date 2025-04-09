import { Router } from "express";
import NotesController from "../controllers/notes.controller";

// Merge params allows us to access the videoID from the parent route
const router = Router({ mergeParams: true });

router.get("/", NotesController.readAll);
router.post("/", NotesController.create);
router.get("/:id", NotesController.readOne);
router.patch("/:id", NotesController.patch);
router.put("/:id", NotesController.update);
router.delete("/:id", NotesController.delete);

export default router;
