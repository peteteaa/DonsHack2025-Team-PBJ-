import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Response } from "express";
import { z } from "zod";
import { EnvConfig } from "../config/env.config";
import videoModel from "../models/video.model";
import type { UserRequest } from "../types";
import StatusCodes from "../types/response-codes";
import { BadRequestError } from "../utils/errors";

const MIN_SEGMENT_LENGTH = 60 * 5; // Minimum segment length in seconds

const apiKey = EnvConfig().gemini.apiKey;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
	model: "gemini-2.0-flash",
});

const generationConfig = {
	temperature: 1,
	topP: 0.95,
	topK: 40,
	maxOutputTokens: 8192,
	responseModalities: [],
	responseMimeType: "text/plain",
};

const multipleChoicePrompt = `Generate a multiple choice quiz based on the given transcript. Each question should test understanding of the content.

The response should be a JSON array of questions in this exact format:
[
  {
    "question": string,
    "options": string[],
    "answer": string,
    "explanation": string
  }
]

Requirements:
1. Generate 3-5 questions
2. Each question should have 4 options
3. The answer must be one of the options
4. Include a brief explanation for the correct answer
5. Return ONLY valid JSON, no markdown or additional text`;

const openEndedPrompt = `Generate open-ended questions based on the given transcript. Each question should test understanding of the content.

The response should be a JSON array of questions in this exact format:
[
  {
    "question": string,
    "answer": string,
    "explanation": string
  }
]

Requirements:
1. Generate 3-5 questions
2. Each question should require a short answer
3. The answer should be a concise model response
4. Return ONLY valid JSON, no markdown or additional text`;

const answerValidationPrompt = `Compare if the user's answer makes sense with the correct answer and return a JSON response in this exact format:

{
  "correct": boolean,
  "explanation": string
}

Rules:
1. If the answer is correct:
   - Set "correct" to true
   - Set "explanation" to "make sense"
2. If the answer is incorrect:
   - Set "correct" to false
   - Set "explanation" to a brief reason why it's wrong

Question: {question}
Correct answer: {answer}
User's answer: {userAnswer}

Return ONLY the JSON object, no additional text or markdown.`;

const createQuizSchema = z.object({
	start: z.number().nonnegative(),
	end: z.number().nonnegative(),
	type: z.enum(["multiple", "open"]),
});

const validateAnswerSchema = z.object({
	question: z.string(),
	answer: z.string(),
	userAnswer: z.string(),
});

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

			const chatSession = model.startChat({
				generationConfig,
				history: [
					{
						role: "user",
						parts: [
							{
								text: `${prompt}

Here is the transcript segment to generate questions from:
${JSON.stringify(transcriptSegment, null, 2)}

Generate the quiz questions JSON based on this transcript segment.`,
							},
						],
					},
				],
			});

			const geminiResponse = await chatSession.sendMessage("INSERT_INPUT_HERE");
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

			const chatSession = model.startChat({
				generationConfig,
				history: [
					{
						role: "user",
						parts: [
							{
								text: answerValidationPrompt
									.replace("{question}", question)
									.replace("{answer}", answer)
									.replace("{userAnswer}", userAnswer),
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
