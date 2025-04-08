import type { GenerateContentResult } from "@google/generative-ai";
import type { ContentTable, VideoPage } from "@shared/types";
import type { Response } from "express";
import {
	generationConfig,
	model,
	transcriptPrompt,
} from "../config/gemini.config";
import { youtubeUrlSchema } from "../config/zod.config";
import userModel from "../models/user.model";
import UserModel from "../models/user.model";
import videoModel from "../models/video.model";
import type { GeminiResponse, UserRequest } from "../types";
import StatusCodes from "../types/response-codes";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { getVideoTitle } from "../utils/get_video_title";
import { fetchTranscript, formatTranscript } from "../utils/transcript";
import { validateUserAndVideo } from "../utils/validate_video_and_user";

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

			const finalPrompt = `${transcriptPrompt}

Here is the input transcript JSON:
${JSON.stringify(formattedTranscript, null, 2)}

Generate the ContentTable JSON based on this transcript.`;

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
			console.log("Chat session started");
			const result: GenerateContentResult = await chatSession.sendMessage("");
			console.log("Chat session completed");
			const responseText = result.response.text();

			// Remove any markdown formatting or extra text
			const jsonStr = responseText.replace(/```json\n|\n```|```/g, "").trim();
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
			});
		} catch (error) {
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
		const userVideo = req.user.userVideos?.[videoIndex];

		videoModel
			.findOne({ _id: videoId })
			.then((video) => {
				if (!video) {
					throw new NotFoundError("Video not found");
				}
				const videoData: VideoPage = {
					videoId: {
						_id: video._id.toString(),
						contentTable: video.contentTable,
						title: video.title,
						transcript: video.transcript,
						url: video.url,
					},
					flashCard: userVideo?.flashCard || [],
					notes: userVideo?.notes || [],
				};
				res.status(StatusCodes.SUCCESS.code).json(videoData);
			})
			.catch((error) => {
				if (error instanceof NotFoundError) {
					res.status(StatusCodes.NOT_FOUND.code).json({
						message: "Video not found",
					});
					return;
				}
				console.error(error);
				res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
					message: "Internal server error",
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
