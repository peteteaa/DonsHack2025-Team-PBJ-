// cspell: words youtu
import type { Response } from "express";
import { YoutubeTranscript } from "youtube-transcript";
import { z } from "zod";
import type { UserRequest } from "../types";
import StatusCodes from "../types/response-codes";
import { BadRequestError } from "../utils/errors";

const youtubeUrlSchema = z.string().refine((url) => {
	const pattern =
		/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;
	return pattern.test(url);
}, "Invalid YouTube video URL");

class VideoController {
	processVideo(req: UserRequest, res: Response) {
		const { videoUrl } = req.body;

		try {
			const validatedUrl = youtubeUrlSchema.parse(videoUrl);
			if (!validatedUrl) {
				throw new BadRequestError("Invalid YouTube video URL");
			}

			YoutubeTranscript.fetchTranscript(validatedUrl, { lang: "en" })
				.then(
					(
						transcript: Array<{
							text: string;
							duration: number;
							offset: number;
						}>,
					) => {
						console.log(transcript);
						res.status(StatusCodes.SUCCESS.code).json({ transcript });
					},
				)
				.catch(() => {
					res
						.status(StatusCodes.INTERNAL_SERVER_ERROR.code)
						.send(StatusCodes.INTERNAL_SERVER_ERROR.message);
				});
		} catch (error) {
			if (error instanceof z.ZodError) {
				res.status(StatusCodes.BAD_REQUEST.code).send(error.errors[0].message);
				return;
			}
			res
				.status(StatusCodes.INTERNAL_SERVER_ERROR.code)
				.send(StatusCodes.INTERNAL_SERVER_ERROR.message);
			return;
		}
	}
}

export default new VideoController();
