import type { Request, Response } from "express";
import { Types } from "mongoose";
import { FlashcardSchema, flashcardPatchSchema } from "../config/zod.config";
import userModel from "../models/user.model";
import StatusCodes from "../types/response-codes";
import { NotFoundError } from "../utils/errors";
import { validateUserAndVideo } from "../utils/validate_video_and_user";

/**
 * Controller for flashcards
 */
class FlashcardsController {
	/**
	 * Get flashcards of a specific User and Video
	 * @param {Request} req
	 * @param {Response} res
	 */
	readAll(req: Request, res: Response) {
		const videoId = req.params.videoID as string;

		const result = validateUserAndVideo(req.user, videoId);
		if (!result) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Video not found",
			});
			return;
		}

		const { userVideo } = result;
		const flashcards = userVideo.flashCard;

		res.status(StatusCodes.SUCCESS.code).json(flashcards);
	}

	/**
	 * Get flashcard of a specific User and Video
	 * @param {Request} req
	 * @param {Response} res
	 */
	readOne(req: Request, res: Response) {
		const videoId = req.params.videoID as string;
		const flashcardId = req.params.id as string;

		const result = validateUserAndVideo(req.user, videoId);
		if (!result) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Video not found",
			});
			return;
		}

		const { userVideo } = result;

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
		res.status(StatusCodes.SUCCESS.code).json(flashcard);
	}

	/**
	 * Create flashcard of a specific User and Video
	 * @param {Request} req
	 * @param {Response} res
	 */
	create(req: Request, res: Response) {
		const videoId = req.params.videoID as string;
		const { flashcard } = req.body;
		const uuid = new Types.ObjectId();
		flashcard._id = uuid;

		const validation = FlashcardSchema.safeParse(flashcard);
		if (!validation.success) {
			res.status(StatusCodes.BAD_REQUEST.code).json({
				message: "Invalid flashcard data",
				errors: validation.error.errors,
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

		userVideo.flashCard.push(flashcard);

		userModel
			.findOneAndUpdate(
				{ _id: req.user.id },
				{ userVideos: req.user.userVideos },
				{ new: true },
			)
			.orFail(new NotFoundError("User not found"))
			.then((user) => {
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
	 * Update flashcard of a specific User and Video
	 * @param {Request} req
	 * @param {Response} res
	 */
	patch(req: Request, res: Response) {
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

		const result = validateUserAndVideo(req.user, videoId);
		if (!result) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Video not found",
			});
			return;
		}

		const { userVideo, index: videoIndex } = result;
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
			.orFail(new NotFoundError("User not found"))
			.then((user) => {
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
	 * Update flashcard of a specific User and Video
	 * @param {Request} req
	 * @param {Response} res
	 */
	update(req: Request, res: Response) {
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

		const result = validateUserAndVideo(req.user, videoId);
		if (!result) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Video not found",
			});
			return;
		}

		const { userVideo, index: videoIndex } = result;

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
			.orFail(new NotFoundError("User not found"))
			.then((user) => {
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
	 * Delete flashcard of a specific User and Video
	 * @param {Request} req
	 * @param {Response} res
	 */
	delete(req: Request, res: Response) {
		const videoId = req.params.videoID as string;
		const flashcardId = req.params.id as string;

		const result = validateUserAndVideo(req.user, videoId);
		if (!result) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Video not found",
			});
			return;
		}

		const { userVideo, index: videoIndex } = result;

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
			.orFail(new NotFoundError("User not found"))
			.then((user) => {
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
