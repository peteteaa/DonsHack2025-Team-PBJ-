import type { User as UserType } from "@shared/types";

export function validateUserAndVideo(user: UserType, videoId: string) {
	if (!user.userVideos) return -1;
	return user.userVideos.findIndex((video) => video.videoId === videoId);
}
