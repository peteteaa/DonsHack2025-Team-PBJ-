import type { Response } from "express";
import type { UserRequest } from "../types";
import StatusCodes from "../types/response-codes";
import {validateUserAndVideo} from "../utils/validate_video_and_user";

class NotesController {

	/**
	 * Get notes of a specific User and Video
	 * @param {UserRequest} req
	 * @param {Response} res
	 */
	read(req: UserRequest, res: Response) {
		const videoId = req.params.videoID as string;

		validateUserAndVideo(req, res, videoId).then((result) => {
			if (!result) return;

			const { userVideo } = result;
			const notes = userVideo.notes;

			res.status(StatusCodes.SUCCESS.code).json(notes);
		});
	}

	/**
	 * Create note
	 */
	create(req: UserRequest, res: Response) {
		const videoId = req.params.videoID as string;
		const { note } = req.body;

		validateUserAndVideo(req, res, videoId).then((result) => {
			if (!result) {
				return; // Early return if validation fails
			}

			const {user, userVideo} = result
			userVideo.notes.push(note);

				user.save()
					.then(() => {
						res.status(StatusCodes.SUCCESS.code).json({
							message: "Note saved successfully",
						});
					})
					.catch((error) => {
						console.error(error);
						res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
							message: "Internal server error",
						});
					});
			})
			.catch((error) => {
				console.error(error);
				res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
					message: "Internal server error",
				});
			});
	}

	/**
	 * Update notes
	 */
	patch(req: UserRequest, res: Response) {
		const videoId = req.params.videoID as string;
		const noteId = req.params.id as string;
		const { moment, text } = req.body;

		validateUserAndVideo(req, res, videoId).then((result) => {
			if (!result) return;

			const { user, userVideo } = result;
			const note = userVideo.notes.id(noteId);

			if (!note) {
				res.status(StatusCodes.NOT_FOUND.code).json({
					message: "Note not found",
				});
				return;
			}

			if (moment !== undefined) {
				note.moment = moment;
			}
			if (text !== undefined) {
				note.text = text;
			}

			user.save()
				.then(() => {
					res.status(StatusCodes.SUCCESS.code).json(note);
				})
				.catch((error) => {
					console.error(error);
					res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
						message: "Internal server error",
					});
				});
		});
	}
}



export default new NotesController();
