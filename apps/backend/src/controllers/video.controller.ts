// cspell: words youtu
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GenerateContentResult } from "@google/generative-ai";
import type { ContentTable, UserVideosItem, Video } from "@shared/types";
import type { Response } from "express";
import { z } from "zod";
import { EnvConfig } from "../config/env.config";
import userModel from "../models/user.model";
import UserModel from "../models/user.model";
import videoModel from "../models/video.model";
import type { GeminiResponse, UserRequest } from "../types";
import StatusCodes from "../types/response-codes";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { getVideoTitle } from "../utils/get_video_title";
import { fetchTranscript, formatTranscript } from "../utils/transcript";
import { validateUserAndVideo } from "../utils/validate_video_and_user";

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

const youtubeUrlSchema = z.string().refine((url) => {
	const pattern =
		/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;
	return pattern.test(url);
}, "Invalid YouTube video URL");

const transcriptPrompt = `Here is a transcript JSON where each item contains "id", "start", "end", and "text" fields. Your task is to analyze this transcript and transform it into a structured ContentTable format.

The expected structure is:

[
  {
    "chapter": string,
    "summary": string,
    "transcript_start_id": number,
    "transcript_end_id": number
  }
]

Your task is to:
1. Analyze the transcript and divide it into logical chapters based on topic changes
2. For each chapter:
   - Create a concise, descriptive title
   - Write a brief summary of the main points
   - Include the transcript_start_id (id of first transcript in chapter) and transcript_end_id (id of last transcript in chapter)
3. Structure the response exactly as shown above

IMPORTANT: Return ONLY a valid JSON object with the structure shown. Do not include any markdown formatting, code blocks, or additional text in your response.`;

class VideoController {
	async processVideo(req: UserRequest, res: Response) {
		const { videoUrl } = req.body;

		try {
			const validatedUrl = youtubeUrlSchema.parse(videoUrl);
			if (!validatedUrl) {
				throw new BadRequestError("Invalid YouTube video URL");
			}
			const video = await videoModel.findOne({ url: validatedUrl });
			if (video) {
				const videoOnUser = req.user?.userVideos?.find(
					(userVideo) => userVideo.videoId === video._id.toString(),
				);
				if (!videoOnUser) {
					await userModel.findOneAndUpdate(
						{ email: req.user?.email },
						{ $push: { userVideos: { videoId: video._id } } },
					);
				}
				res.status(StatusCodes.SUCCESS.code).json({
					videoId: video._id,
					url: video.url,
					title: video.title,
					transcript: video.transcript,
					contentTable: video.contentTable,
				});
				return;
			}

			const transcript = await fetchTranscript(
				new URL(validatedUrl).searchParams.get("v") as string,
			);
			console.log("Transcript fetched successfully");
			const formattedTranscript = formatTranscript(transcript);
			console.log("Transcript formatted successfully");

			const chatSession = model.startChat({
				generationConfig,
				history: [
					{
						role: "user",
						parts: [
							{
								text: `${transcriptPrompt}

Here is the input transcript JSON:
${JSON.stringify(formattedTranscript, null, 2)}

Generate the ContentTable JSON based on this transcript.`,
							},
						],
					},
				],
			});
			console.log("Chat session started");
			const result: GenerateContentResult =
				await chatSession.sendMessage("INSERT_INPUT_HERE");
			console.log("Chat session completed");
			console.log({ result });
			const responseText = result.response.text();
			console.log(
				"-------------------------------------------------------------------------",
			);
			console.log(responseText);
			// Remove any markdown formatting or extra text
			const jsonStr = responseText.replace(/```json\n|\n```|```/g, "").trim();
			console.log(
				"-------------------------------------------------------------------------",
			);
			console.log(jsonStr);
			const geminiContentTable: GeminiResponse[] = JSON.parse(jsonStr);

			const contentTable: ContentTable = geminiContentTable.map(
				(geminiItem) => ({
					chapter: geminiItem.chapter,
					summary: geminiItem.summary,
					transcript: formattedTranscript.slice(
						geminiItem.transcript_start_id,
						geminiItem.transcript_end_id + 1,
					),
				}),
			);

			const title = await getVideoTitle(videoUrl);

			const createdVideo = await videoModel.create({
				url: validatedUrl,
				title: title,
				transcript: formattedTranscript,
				contentTable,
			});

			await userModel.findOneAndUpdate(
				{ email: req.user?.email },
				{ $push: { userVideos: { videoId: createdVideo._id } } },
			);

			res.status(StatusCodes.SUCCESS.code).json({
				videoId: createdVideo._id,
				url: createdVideo.url,
				title: createdVideo.title,
				transcript: createdVideo.transcript,
				contentTable: createdVideo.contentTable,
			});
		} catch (error: unknown) {
			console.error("Error in video processing:", error);
			if (
				error instanceof Error &&
				error.message === "Failed to parse Gemini response as JSON"
			) {
				res
					.status(StatusCodes.INTERNAL_SERVER_ERROR.code)
					.send("Failed to parse AI response");
			} else {
				res
					.status(StatusCodes.INTERNAL_SERVER_ERROR.code)
					.send(StatusCodes.INTERNAL_SERVER_ERROR.message);
			}
		}
	}

	getVideo(req: UserRequest, res: Response) {
		console.log("getVideo");
		const videoId = req.params.videoID as string;

		validateUserAndVideo(req, res, videoId).then((result) => {
			if (!result) throw new NotFoundError("Video not found");

			const { user } = result;
			console.log("user:", user);
			user
				.populate({
					path: "userVideos.videoId",
					model: "Video",
				})
				.then((populatedUser) => {
					console.log("populatedUser:", populatedUser);
					const userVideo = populatedUser.userVideos.find(
						(userVideo: UserVideosItem) =>
							(userVideo.videoId as Video).id.toString() === videoId,
					);
					console.log("userVideo:", userVideo);
					if (!userVideo) {
						res.status(StatusCodes.NOT_FOUND.code).json({
							message: "Video not found",
						});
						return null;
					}
					console.log("userVideo:", userVideo);
					res.status(StatusCodes.SUCCESS.code).json(userVideo);
				})
				.catch((error) => {
					if (error instanceof NotFoundError) {
						res.status(StatusCodes.NOT_FOUND.code).json({
							message: "Video not found",
						});
						return null;
					}
					console.error(error);
					res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
						message: "Internal server error",
					});
				});
		});
	}

	getAllUserVideos(req: UserRequest, res: Response) {
		UserModel.findOne({ email: req.user?.email }).then((user) => {
			if (!user) {
				throw new NotFoundError("User not found");
			}

			// populate the userVideos
			user
				.populate({
					path: "userVideos.videoId",
					model: "Video",
				})
				.then((populatedUser) => {
					res.status(StatusCodes.SUCCESS.code).json(populatedUser.userVideos);
				})
				.catch((error) => {
					if (error instanceof NotFoundError) {
						res.status(StatusCodes.NOT_FOUND.code).json({
							message: "User not found",
						});
						return;
					}
					console.error(error);
					res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
						message: "Internal server error",
					});
				});
		});
	}
}

export default new VideoController();
