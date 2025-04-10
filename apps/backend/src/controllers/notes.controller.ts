import type { Response } from "express";
import { Types } from "mongoose";
import { NoteSchema, notePatchSchema } from "../config/zod.config";
import userModel from "../models/user.model";
import type { UserRequest } from "../types";
import StatusCodes from "../types/response-codes";
import { NotFoundError } from "../utils/errors";
import { validateUserAndVideo } from "../utils/validate_video_and_user";

/**
 * Controller for notes
 */
class NotesController {
	/**
	 * Get notes of a specific User and Video
	 * @param {UserRequest} req
	 * @param {Response} res
	 */
	readAll(req: UserRequest, res: Response) {
		const videoId = req.params.videoID as string;
		if (!req.user) {
			res.status(StatusCodes.UNAUTHORIZED.code).json({
				message: "Unauthorized",
			});
			return;
		}

		const result = validateUserAndVideo(req.user, videoId);
		if (!result) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Video not found",
			});
			return;
		}
		const { userVideo } = result;
		const notes = userVideo.notes;

		res.status(StatusCodes.SUCCESS.code).json(notes);
	}

	/**
	 * Get note of a specific User and Video
	 * @param {UserRequest} req
	 * @param {Response} res
	 */
	readOne(req: UserRequest, res: Response) {
		const videoId = req.params.videoID as string;
		const noteId = req.params.id as string;

		if (!req.user) {
			res.status(StatusCodes.UNAUTHORIZED.code).json({
				message: "Unauthorized",
			});
			return;
		}

		const result = validateUserAndVideo(req.user, videoId);
		if (!result) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Video not found",
			});
			return;
		}

		const { userVideo } = result;

		const noteIndex = userVideo.notes.findIndex((note) => note._id === noteId);
		if (noteIndex === -1) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Note not found",
			});
			return;
		}
		const note = userVideo.notes[noteIndex];
		res.status(StatusCodes.SUCCESS.code).json(note);
	}

	/**
	 * Create note of a specific User and Video
	 * @param {UserRequest} req
	 * @param {Response} res
	 */
	create(req: UserRequest, res: Response) {
		const videoId = req.params.videoID as string;
		const { note } = req.body;

		const validation = NoteSchema.safeParse(note);
		if (!validation.success) {
			res.status(StatusCodes.BAD_REQUEST.code).json({
				message: "Invalid note data",
				errors: validation.error.errors,
			});
			return;
		}
		const uuid = new Types.ObjectId();
		note._id = uuid;

		if (!req.user) {
			res.status(StatusCodes.UNAUTHORIZED.code).json({
				message: "Unauthorized",
			});
			return;
		}

		const result = validateUserAndVideo(req.user, videoId);
		if (!result) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Video not found",
			});
			return;
		}

		const { userVideo, index: videoIndex } = result;
		userVideo.notes.push(note);

		userModel
			.findOneAndUpdate(
				{ _id: req.user.id },
				{ userVideos: req.user.userVideos },
				{ new: true },
			)
			.then((user) => {
				if (!user) {
					throw new NotFoundError("User not found");
				}
				res
					.status(StatusCodes.SUCCESS.code)
					.json(user.userVideos[videoIndex].notes);
			})
			.catch((error) => {
				if (error instanceof NotFoundError) {
					res.status(StatusCodes.NOT_FOUND.code).json({
						message: error.message,
					});
					return;
				}
				console.error(error);
				res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
					message: "Internal server error",
				});
			});
	}

	/**
	 * Patch note of a specific User and Video
	 * @param {UserRequest} req
	 * @param {Response} res
	 */
	patch(req: UserRequest, res: Response) {
		const videoId = req.params.videoID as string;
		const noteId = req.params.id as string;
		const { moment, text } = req.body;

		const validation = notePatchSchema.safeParse({ moment, text });
		if (!validation.success) {
			res.status(StatusCodes.BAD_REQUEST.code).json({
				message: "Invalid note data",
				errors: validation.error.errors,
			});
			return;
		}

		if (!req.user) {
			res.status(StatusCodes.UNAUTHORIZED.code).json({
				message: "Unauthorized",
			});
			return;
		}

		const result = validateUserAndVideo(req.user, videoId);
		if (!result) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Video not found",
			});
			return;
		}

		const { userVideo, index: videoIndex } = result;
		const noteIndex = userVideo.notes.findIndex((note) => note._id === noteId);

		if (noteIndex === -1) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Note not found",
			});
			return;
		}
		const note = userVideo.notes[noteIndex];

		userVideo.notes[noteIndex] = {
			...note,
			moment: moment ?? note.moment,
			text: text ?? note.text,
		};

		userModel
			.findOneAndUpdate(
				{ _id: req.user.id },
				{ userVideos: req.user.userVideos },
				{ new: true },
			)
			.then((user) => {
				if (!user) {
					throw new NotFoundError("User not found");
				}
				const updatedNote = user.userVideos[videoIndex].notes[noteIndex];
				res.status(StatusCodes.SUCCESS.code).json({ note: updatedNote });
			})
			.catch((error) => {
				if (error instanceof NotFoundError) {
					res.status(StatusCodes.NOT_FOUND.code).json({
						message: error.message,
					});
					return;
				}
				console.error(error);
				res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
					message: "Internal server error",
				});
			});
	}

	/**
	 * Update note of a specific User and Video
	 * @param {UserRequest} req
	 * @param {Response} res
	 */
	update(req: UserRequest, res: Response) {
		const videoId = req.params.videoID as string;
		const noteId = req.params.id as string;
		const { moment, text } = req.body;

		if (!req.user) {
			res.status(StatusCodes.UNAUTHORIZED.code).json({
				message: "Unauthorized",
			});
			return;
		}

		const result = validateUserAndVideo(req.user, videoId);
		if (!result) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Video not found",
			});
			return;
		}

		const { userVideo, index: videoIndex } = result;

		const validation = NoteSchema.safeParse({
			moment,
			text,
			_id: noteId,
		});
		if (!validation.success) {
			res.status(StatusCodes.BAD_REQUEST.code).json({
				message: "Invalid note data",
				errors: validation.error.errors,
			});
			return;
		}

		const noteIndex = userVideo.notes.findIndex((note) => note._id === noteId);
		if (noteIndex === -1) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Note not found",
			});
			return;
		}

		const note = userVideo.notes[noteIndex];
		userVideo.notes[noteIndex] = {
			...note,
			moment,
			text,
		};

		userModel
			.findOneAndUpdate(
				{ _id: req.user.id },
				{ userVideos: req.user.userVideos },
				{ new: true },
			)
			.then((user) => {
				if (!user) {
					throw new NotFoundError("User not found");
				}
				const updatedNote = user.userVideos[videoIndex].notes[noteIndex];
				res.status(StatusCodes.SUCCESS.code).json({ note: updatedNote });
			})
			.catch((error) => {
				if (error instanceof NotFoundError) {
					res.status(StatusCodes.NOT_FOUND.code).json({
						message: error.message,
					});
					return;
				}
				console.error(error);
				res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
					message: "Internal server error",
				});
			});
	}

	/**
	 * Delete note of a specific User and Video
	 * @param {UserRequest} req
	 * @param {Response} res
	 */
	delete(req: UserRequest, res: Response) {
		const videoId = req.params.videoID as string;
		const noteId = req.params.id as string;

		if (!req.user) {
			res.status(StatusCodes.UNAUTHORIZED.code).json({
				message: "User not found",
			});
			return;
		}

		const result = validateUserAndVideo(req.user, videoId);
		if (!result) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Video not found",
			});
			return;
		}

		const { userVideo, index: videoIndex } = result;

		const noteIndex = userVideo.notes.findIndex((note) => note._id === noteId);
		if (noteIndex === -1) {
			res.status(StatusCodes.SUCCESS.code).json({
				notes: userVideo.notes,
			});
			return;
		}

		userVideo.notes.splice(noteIndex, 1);

		userModel
			.findOneAndUpdate(
				{ _id: req.user.id },
				{ userVideos: req.user.userVideos },
				{ new: true },
			)
			.then((user) => {
				if (!user) {
					throw new NotFoundError("User not found");
				}
				res
					.status(StatusCodes.SUCCESS.code)
					.json(user.userVideos[videoIndex].notes);
			})
			.catch((error) => {
				if (error instanceof NotFoundError) {
					res.status(StatusCodes.NOT_FOUND.code).json({
						message: error.message,
					});
					return;
				}
				console.error(error);
				res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
					message: "Internal server error",
				});
			});
	}
}

export default new NotesController();
