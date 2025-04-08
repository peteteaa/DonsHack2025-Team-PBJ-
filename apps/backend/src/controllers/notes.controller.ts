import { randomUUID } from "node:crypto";
import type { Response } from "express";
import { NoteSchema, notePatchSchema } from "../config/zod.config";
import userModel from "../models/user.model";
import type { UserRequest } from "../types";
import StatusCodes from "../types/response-codes";
import { NotFoundError } from "../utils/errors";
import { validateUserAndVideo } from "../utils/validate_video_and_user";

class NotesController {
	/**
	 * Get notes of a specific User and Video
	 * @param {UserRequest} req
	 * @param {Response} res
	 */
	read(req: UserRequest, res: Response) {
		const videoId = req.params.videoID as string;

		if (!req.user) {
			res.status(StatusCodes.UNAUTHORIZED.code).json({
				message: "User not found",
			});
			return;
		}
		const videoIndex = validateUserAndVideo(req.user, videoId);
		if (videoIndex === -1) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Video not found",
			});
			return;
		}
		const userVideo = req.user?.userVideos?.[videoIndex];
		if (!userVideo) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "User video not found",
			});
			return;
		}
		const notes = userVideo.notes;

		res.status(StatusCodes.SUCCESS.code).json(notes);
	}

	/**
	 * Create note
	 */
	create(req: UserRequest, res: Response) {
		const videoId = req.params.videoID as string;
		const { note } = req.body;
		const uuid = randomUUID();
		note._id = uuid;

		const validation = NoteSchema.safeParse(note);
		if (!validation.success) {
			res.status(StatusCodes.BAD_REQUEST.code).json({
				message: "Invalid note data",
				errors: validation.error.errors,
			});
			return;
		}

		if (!req.user) {
			res.status(StatusCodes.UNAUTHORIZED.code).json({
				message: "User not found",
			});
			return;
		}

		const videoIndex = validateUserAndVideo(req.user, videoId);
		if (videoIndex === -1) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Video not found",
			});
			return;
		}

		const userVideo = req.user?.userVideos?.[videoIndex];
		if (!userVideo) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "User video not found",
			});
			return;
		}
		if (!userVideo.notes) {
			userVideo.notes = [];
		}
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
	 * Patch notes
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
				message: "User not found",
			});
			return;
		}

		const videoIndex = validateUserAndVideo(req.user, videoId);
		if (videoIndex === -1) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Video not found",
			});
			return;
		}

		const userVideo = req.user?.userVideos?.[videoIndex];
		if (!userVideo) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "User video not found",
			});
			return;
		}
		if (!userVideo.notes) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Notes not found",
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

		if (!note) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Note not found",
			});
			return;
		}
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
	 * Update note
	 */
	update(req: UserRequest, res: Response) {
		const videoId = req.params.videoID as string;
		const noteId = req.params.id as string;
		const { moment, text } = req.body;

		if (!req.user) {
			res.status(StatusCodes.UNAUTHORIZED.code).json({
				message: "User not found",
			});
			return;
		}

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

		const videoIndex = validateUserAndVideo(req.user, videoId);
		if (videoIndex === -1) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Video not found",
			});
			return;
		}

		const userVideo = req.user?.userVideos?.[videoIndex];
		if (!userVideo) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "User video not found",
			});
			return;
		}
		if (!userVideo.notes) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Notes not found",
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

		userVideo.notes[noteIndex] = {
			...userVideo.notes[noteIndex],
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
	 * Delete note
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

		const videoIndex = validateUserAndVideo(req.user, videoId);
		if (videoIndex === -1) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Video not found",
			});
			return;
		}

		const userVideo = req.user?.userVideos?.[videoIndex];
		if (!userVideo) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "User video not found",
			});
			return;
		}
		if (!userVideo.notes) {
			res.status(StatusCodes.SUCCESS.code).json({
				notes: [],
			});
			return;
		}

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
