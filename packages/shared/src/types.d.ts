export interface User {
	id: string;
	email: string;
	userVideos?: UserVideos;
}

export interface Video {
	id: string;
}

type UserVideos = UserVideosItem[];
interface UserVideosItem {
	flashCard: FlashCardItem[];
	notes: string[];
	videoId: string;
}
interface FlashCardItem {
	back: string;
	front: string;
}
