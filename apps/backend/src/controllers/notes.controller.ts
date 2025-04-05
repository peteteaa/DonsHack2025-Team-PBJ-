import type {Request, Response} from "express";
import StatusCodes from "../types/response-codes";

class NotesController {


    /**
     * Save notes
     */
    read(req: Request, res: Response) {
        console.log("read notes");
        res.status(StatusCodes.SUCCESS.code).json();
    }

    /**
     * Save notes
     */
    save(req: Request, res: Response) {
        console.log("save notes");

        res.status(StatusCodes.SUCCESS.code).json();
    }

    /**
     * Update notes
     */
    patch(req: Request, res: Response) {
        console.log("update notes");
    }
}


export default new NotesController();