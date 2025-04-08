import type { Response } from "express";
import {
	answerValidationPrompt,
	generationConfig,
	model,
	multipleChoicePrompt,
	openEndedPrompt,
} from "../config/gemini.config";
import { createQuizSchema, validateAnswerSchema } from "../config/zod.config";
import videoModel from "../models/video.model";
import type { UserRequest } from "../types";
import StatusCodes from "../types/response-codes";
import { BadRequestError } from "../utils/errors";

const MIN_SEGMENT_LENGTH = 60 * 5; // Minimum segment length in seconds

class QuizController {
	async create(req: UserRequest, res: Response) {
		const videoId = req.params.videoID as string;

		try {
			const validation = createQuizSchema.safeParse(req.body);
			if (!validation.success) {
				const error = validation.error.errors[0];
				let errorMessage = "Invalid request: ";

				if (error.path.includes("type")) {
					errorMessage += "Type must be 'multiple' or 'open'";
				} else if (error.path.includes("start") || error.path.includes("end")) {
					errorMessage += `${error.path[0]} must be a non-negative number`;
				} else {
					errorMessage += error.message;
				}

				throw new BadRequestError(errorMessage);
			}
			const { start, end, type } = validation.data;

			if (end - start < MIN_SEGMENT_LENGTH) {
				throw new BadRequestError("Segment must be at least 5 minutes long");
			}

			const video = await videoModel.findById(videoId);
			if (!video) {
				throw new BadRequestError("Invalid video");
			}

			const transcriptSegment = video.transcript.filter(
				(segment) => segment.start <= end && segment.end >= start,
			);

			const prompt =
				type === "multiple" ? multipleChoicePrompt : openEndedPrompt;

			const finalPrompt = `${prompt}

Here is the transcript segment to generate questions from:
${JSON.stringify(transcriptSegment, null, 2)}

Generate the quiz questions JSON based on this transcript segment.`;
			const chatSession = model.startChat({
				generationConfig,
				history: [
					{
						role: "user",
						parts: [
							{
								text: finalPrompt,
							},
						],
					},
				],
			});

			const geminiResponse = await chatSession.sendMessage("");
			const responseText = geminiResponse.response.text();
			const jsonStr = responseText.replace(/```json\n|\n```|```/g, "").trim();
			const quiz = JSON.parse(jsonStr);

			res.status(StatusCodes.SUCCESS.code).json({ type, quiz });
		} catch (error) {
			if (error instanceof BadRequestError) {
				res.status(StatusCodes.BAD_REQUEST.code).json({
					message: error.message,
				});
				return;
			}
			console.error("Error generating quiz:", error);
			res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
				message: "Internal server error",
			});
		}
	}

	async validateAnswer(req: UserRequest, res: Response) {
		try {
			const validation = validateAnswerSchema.safeParse({
				question: req.body.question,
				answer: req.body.answer,
				userAnswer: req.body.userAnswer,
			});

			if (!validation.success) {
				const error = validation.error.errors[0];
				let errorMessage = "Invalid request: ";

				if (error.path.includes("question")) {
					errorMessage += "Question must be a string";
				} else if (error.path.includes("answer")) {
					errorMessage += "Answer must be a string";
				} else if (error.path.includes("userAnswer")) {
					errorMessage += "User answer must be a string";
				} else {
					errorMessage += error.message;
				}

				throw new BadRequestError(errorMessage);
			}
			console.log(validation);
			const { question, answer, userAnswer } = validation.data;

			const finalPrompt = answerValidationPrompt
				.replace("{question}", question)
				.replace("{answer}", answer)
				.replace("{userAnswer}", userAnswer);

			const chatSession = model.startChat({
				generationConfig,
				history: [
					{
						role: "user",
						parts: [
							{
								text: finalPrompt,
							},
						],
					},
				],
			});

			const geminiResponse = await chatSession.sendMessage("INSERT_INPUT_HERE");
			const responseText = geminiResponse.response.text().trim();
			const jsonStr = responseText.replace(/```json\n|\n```|```/g, "").trim();
			const result = JSON.parse(jsonStr);

			res.status(StatusCodes.SUCCESS.code).json(result);
		} catch (error) {
			if (error instanceof BadRequestError) {
				res.status(StatusCodes.BAD_REQUEST.code).json({
					message: error.message,
				});
				return;
			}
			console.error("Error validating answer:", error);
			res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
				message: "Internal server error",
			});
		}
	}
}

export default new QuizController();
