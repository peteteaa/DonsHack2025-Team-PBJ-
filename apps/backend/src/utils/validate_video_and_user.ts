import type { User as UserType, UserVideosItem } from "@shared/types";

export function validateUserAndVideo(
	user: UserType,
	videoId: string,
): { userVideo: UserVideosItem; index: number } | null {
	if (!user.userVideos) return null;
	const index = user.userVideos.findIndex((video) => video.videoId === videoId);
	if (index === -1) return null;
	return { userVideo: user.userVideos[index], index };
}
