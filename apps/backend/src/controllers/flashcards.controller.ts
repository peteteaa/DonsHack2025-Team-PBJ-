import { randomUUID } from "node:crypto";
import type { Response } from "express";
import { FlashcardSchema, flashcardPatchSchema } from "../config/zod.config";
import userModel from "../models/user.model";
import type { UserRequest } from "../types";
import StatusCodes from "../types/response-codes";
import { NotFoundError } from "../utils/errors";
import { validateUserAndVideo } from "../utils/validate_video_and_user";

class FlashcardsController {
	/**
	 * Get flashcards of a specific User and Video
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
				message: "Video not found",
			});
			return;
		}
		const flashcards = userVideo.flashCard;

		res.status(StatusCodes.SUCCESS.code).json(flashcards);
	}

	/**
	 * Create flashcard
	 */
	create(req: UserRequest, res: Response) {
		const videoId = req.params.videoID as string;
		const { flashcard } = req.body;
		const uuid = randomUUID();
		flashcard._id = uuid;

		const validation = FlashcardSchema.safeParse(flashcard);
		if (!validation.success) {
			res.status(StatusCodes.BAD_REQUEST.code).json({
				message: "Invalid flashcard data",
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
				message: "Video not found",
			});
			return;
		}
		if (!userVideo.flashCard) {
			userVideo.flashCard = [];
		}
		userVideo.flashCard.push(flashcard);

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
				res.status(StatusCodes.SUCCESS.code).json({
					flashcard: user.userVideos[videoIndex].flashCard,
				});
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
	 * Update flashcard
	 */
	patch(req: UserRequest, res: Response) {
		const videoId = req.params.videoID as string;
		const flashcardId = req.params.id as string;
		const { front, back } = req.body;

		const validation = flashcardPatchSchema.safeParse({ front, back });
		if (!validation.success) {
			res.status(StatusCodes.BAD_REQUEST.code).json({
				message: "Invalid flashcard data",
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
				message: "Video not found",
			});
			return;
		}
		const flashcardIndex = userVideo.flashCard.findIndex(
			(flashcard) => flashcard._id === flashcardId,
		);

		if (flashcardIndex === -1) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Flashcard not found",
			});
			return;
		}

		const flashcard = userVideo.flashCard[flashcardIndex];

		userVideo.flashCard[flashcardIndex] = {
			...flashcard,
			front: front || flashcard.front,
			back: back || flashcard.back,
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
				res.status(StatusCodes.SUCCESS.code).json({
					flashcard: user.userVideos[videoIndex].flashCard[flashcardIndex],
				});
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
	 * Update flashcard
	 */
	update(req: UserRequest, res: Response) {
		const videoId = req.params.videoID as string;
		const flashcardId = req.params.id as string;
		const { front, back } = req.body;

		const validation = FlashcardSchema.safeParse({
			front,
			back,
			_id: flashcardId,
		});
		if (!validation.success) {
			res.status(StatusCodes.BAD_REQUEST.code).json({
				message: "Invalid flashcard data",
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
				message: "Video not found",
			});
			return;
		}
		const flashcardIndex = userVideo.flashCard.findIndex(
			(flashcard) => flashcard._id === flashcardId,
		);

		if (flashcardIndex === -1) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Flashcard not found",
			});
			return;
		}

		const flashcard = userVideo.flashCard[flashcardIndex];

		userVideo.flashCard[flashcardIndex] = {
			...flashcard,
			front,
			back,
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
				res.status(StatusCodes.SUCCESS.code).json({
					flashcard: user.userVideos[videoIndex].flashCard[flashcardIndex],
				});
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
	 * Delete flashcard
	 */
	delete(req: UserRequest, res: Response) {
		const videoId = req.params.videoID as string;
		const flashcardId = req.params.id as string;

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
				message: "Video not found",
			});
			return;
		}
		const flashcardIndex = userVideo.flashCard.findIndex(
			(flashcard) => flashcard._id === flashcardId,
		);

		if (flashcardIndex === -1) {
			res
				.status(StatusCodes.SUCCESS.code)
				.json({ flashcard: userVideo.flashCard });
			return;
		}

		userVideo.flashCard.splice(flashcardIndex, 1);

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
				res.status(StatusCodes.SUCCESS.code).json({
					flashcard: user.userVideos[videoIndex].flashCard,
				});
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

export default new FlashcardsController();
