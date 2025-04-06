export interface User {
	id: string;
	email: string;
	userVideos?: UserVideos;
}

export interface Video {
	id: string;
	url: string;
	title: string;
	transcript: TranscriptItem[];
	contentTable: ContentTable;
}

type UserNotes = UserNoteItem[];
export interface UserNoteItem {
	moment: number;
	text: string;
}

export type UserVideos = UserVideosItem[];
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

export interface VideoPage {
	_id: string;
	flashCard: FlashCardItem[];
	notes: UserNoteItem[];
	videoId: VideoId;
}
interface VideoId {
	__v: number;
	_id: string;
	contentTable: ContentTableItem[];
	title: string;
	transcript: TranscriptItem[];
	url: string;
}
interface ContentTableItem {
	chapter: string;
	summary: string;
	transcript: TranscriptItem[];
}
interface TranscriptItem {
	end: number;
	start: number;
	text: string;
}
