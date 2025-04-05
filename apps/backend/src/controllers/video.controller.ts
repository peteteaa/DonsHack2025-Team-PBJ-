// cspell: words youtu
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GenerateContentResult } from "@google/generative-ai";
import type { ContentTable, TranscriptItem } from "@shared/types";
import type { Response } from "express";
import { YoutubeTranscript } from "youtube-transcript";
import { z } from "zod";
import { EnvConfig } from "../config/env.config";
import userModel from "../models/user.model";
import videoModel from "../models/video.model";
import type { UserRequest } from "../types";
import StatusCodes from "../types/response-codes";
import { BadRequestError } from "../utils/errors";
import { formatTranscript, mergeSegments } from "../utils/transcript";

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

const transcriptPrompt = `Here is a transcript JSON where each item contains "start", "end", and "text" fields. Your task is to analyze this transcript and transform it into a structured ContentTable format.

The expected structure is:

[
  {
    "chapter": string,
    "summary": string,
    "transcript": [
      {
        "start": number,
        "end": number,
        "text": string
      }
    ]
  }
]


Your task is to:
1. Analyze the transcript and divide it into logical chapters based on topic changes
2. For each chapter:
   - Create a concise, descriptive title
   - Write a brief summary of the main points
   - Include the relevant transcript segments with their original timing
3. Structure the response exactly as shown above

IMPORTANT: Return ONLY a valid JSON object with the structure shown. Do not include any markdown formatting, code blocks, or additional text in your response.`;

class VideoController {
	async processVideo(req: UserRequest, res: Response) {
		const { videoUrl } = req.body;
		let mergedTranscript: TranscriptItem[] = [];

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
					url: video.url,
					transcript: video.transcript,
					contentTable: video.contentTable,
				});
				return;
			}

			const transcript = await YoutubeTranscript.fetchTranscript(validatedUrl, {
				lang: "en",
			});
			console.log("Transcript fetched successfully");
			const formattedTranscript = formatTranscript(transcript);
			console.log("Transcript formatted successfully");
			mergedTranscript = mergeSegments(formattedTranscript);
			console.log("Transcript merged successfully");

			const chatSession = model.startChat({
				generationConfig,
				history: [
					{
						role: "user",
						parts: [
							{
								text: `${transcriptPrompt}

Here is the input transcript JSON:
${JSON.stringify(mergedTranscript, null, 2)}

Generate the ContentTable JSON based on this transcript.`,
							},
						],
					},
				],
			});
			const result: GenerateContentResult =
				await chatSession.sendMessage("INSERT_INPUT_HERE");
			const responseText = result.response.text();
			// Remove any markdown formatting or extra text
			const jsonStr = responseText.replace(/```json\n|\n```|```/g, "").trim();
			const contentTable: ContentTable = JSON.parse(jsonStr);
			const createdVideo = await videoModel.create({
				url: validatedUrl,
				transcript: mergedTranscript,
				contentTable,
			});

			await userModel.findOneAndUpdate(
				{ email: req.user?.email },
				{ $push: { userVideos: { videoId: createdVideo._id } } },
			);

			res.status(StatusCodes.SUCCESS.code).json({
				url: createdVideo.url,
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
}

export default new VideoController();
