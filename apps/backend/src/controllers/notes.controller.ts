import type { Response } from "express";
import UserModel from "../models/user.model";
import type { UserRequest } from "../types";
import StatusCodes from "../types/response-codes";

class NotesController {
	/**
	 * Save notes
	 */
	read(req: UserRequest, res: Response) {
		const videoId = req.params.videoID as string;
		UserModel.findOne({ email: req.user?.email })
			.then((user) => {
				if (!user) {
					res.status(StatusCodes.NOT_FOUND.code).json({
						message: "User not found",
					});
					return;
				}
				const userVideo = user.userVideos?.find(
					(video) => video.videoId.toString() === videoId,
				);

				if (!userVideo) {
					res.status(StatusCodes.NOT_FOUND.code).json({
						message: "Video not found",
					});
					return;
				}
				const notes = userVideo.notes;

				// success send the notes
				res.status(StatusCodes.SUCCESS.code).json(notes);
			})
			.catch((error) => {
				console.error(error);
				res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
					message: "Internal server error",
				});
			});
	}

	/**
	 * Save notes
	 */
	save(_req: UserRequest, res: Response) {
		console.log("save notes");

		res.status(StatusCodes.SUCCESS.code).json();
	}

	/**
	 * Update notes
	 */
	patch(_req: UserRequest, res: Response) {
		console.log("update notes");
		res.status(StatusCodes.SUCCESS.code).json();
	}
}

export default new NotesController();
