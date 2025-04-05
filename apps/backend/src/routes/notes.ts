import { Router } from "express";
import NotesController from "../controllers/notes.controller";
const router = Router();

router.get("/get", NotesController.read);
router.post("/create", NotesController.save);
router.patch("/update/:id", NotesController.patch);


export default router;
