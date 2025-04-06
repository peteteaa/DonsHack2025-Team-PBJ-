export interface User {
	id: string;
	email: string;
	userVideos?: UserVideos;
}

export interface Video {
	id: string;
	url: string;
	transcript: TranscriptItem[];
	contentTable: ContentTable;
}

type UserNotes = UserNoteItem[];
export interface UserNoteItem {
	moment: number;
	text: string;
}

type UserVideos = UserVideosItem[];
interface UserVideosItem {
	flashCard: FlashCardItem[];
	notes?: UserNotes;
	videoId: string | Video;
}
interface FlashCardItem {
	back: string;
	front: string;
}

export type ContentTable = ContentTableItem[];
interface ContentTableItem {
	chapter: string;
	summary: string;
	transcript: TranscriptItem[];
}

export interface TranscriptItem {
	start: number;
	end: number;
	text: string;
}
