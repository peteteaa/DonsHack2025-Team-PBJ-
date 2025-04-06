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
    "answer": string
  }
]

Requirements:
1. Generate 3-5 questions
2. Each question should require a short answer
3. The answer should be a concise model response
4. Return ONLY valid JSON, no markdown or additional text`;

const createQuizSchema = z.object({
	start: z.number().nonnegative(),
	end: z.number().nonnegative(),
	type: z.enum(["multiple", "open"]),
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
}

export default new QuizController();
