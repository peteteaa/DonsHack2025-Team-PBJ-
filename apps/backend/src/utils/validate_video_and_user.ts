import type { Response } from "express";
import UserModel from "../models/user.model";
import type { UserRequest } from "../types";
import StatusCodes from "../types/response-codes";

export async function validateUserAndVideo(
	req: UserRequest,
	res: Response,
	videoId: string,
) {
	try {
		const user = await UserModel.findOne({ email: req.user?.email });
		if (!user) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "User not found",
			});
			return null;
		}

		const userVideo = user.userVideos?.find(
			(video) => video.videoId.toString() === videoId,
		);

		if (!userVideo) {
			res.status(StatusCodes.NOT_FOUND.code).json({
				message: "Video not found",
			});
			return null;
		}

		return { user, userVideo };
	} catch (error) {
		console.error(error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
			message: "Internal server error",
		});
		return null;
	}
}
