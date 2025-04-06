import type { Response } from "express";
import type { UserRequest } from "../types";
import StatusCodes from "../types/response-codes";
import { validateUserAndVideo } from "../utils/validate_video_and_user";

class FlashcardsController {
	/**
	 * Get flashcards of a specific User and Video
	 * @param {UserRequest} req
	 * @param {Response} res
	 */
	read(req: UserRequest, res: Response) {
		const videoId = req.params.videoID as string;
		validateUserAndVideo(req, res, videoId).then((result) => {
			if (!result) return;

			const { userVideo } = result;
			console.log(userVideo);
			const flashcards = userVideo.flashCard;

			res.status(StatusCodes.SUCCESS.code).json(flashcards);
		});
	}

	/**
	 * Create flashcard
	 */
	create(req: UserRequest, res: Response) {
		const videoId = req.params.videoID as string;
		const { flashcard } = req.body;

		validateUserAndVideo(req, res, videoId)
			.then((result) => {
				if (!result) {
					return; // Early return if validation fails
				}

				const { user, userVideo } = result;
				userVideo.flashCard.push(flashcard);

				user
					.save()
					.then(() => {
						res.status(StatusCodes.SUCCESS.code).json({
							message: "Flashcard saved successfully",
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
	 * Update flashcard
	 */
	patch(req: UserRequest, res: Response) {
		const videoId = req.params.videoID as string;
		const flashcardId = req.params.id as string;
		const { front, back } = req.body;

		validateUserAndVideo(req, res, videoId).then((result) => {
			if (!result) return;

			const { user, userVideo } = result;
			const flashcard = userVideo.flashCard.id(flashcardId);

			if (!flashcard) {
				res.status(StatusCodes.NOT_FOUND.code).json({
					message: "Flashcard not found",
				});
				return;
			}

			if (front !== undefined) {
				flashcard.front = front;
			}
			if (back !== undefined) {
				flashcard.back = back;
			}

			user
				.save()
				.then(() => {
					res.status(StatusCodes.SUCCESS.code).json(flashcard);
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

export default new FlashcardsController();
