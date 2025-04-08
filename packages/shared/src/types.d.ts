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
	_id: string;
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
	_id: string;
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
	id: number;
	start: number;
	end: number;
	text: string;
}

export interface VideoPage {
	flashCard: FlashCardItem[];
	notes: UserNoteItem[];
	videoId: VideoId;
}
interface VideoId {
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

export interface QuizData {
	quiz: QuizOpenItem[] | QuizMultipleItem[];
	type: QuestionType;
}

export interface QuizOpenItem {
	answer: string;
	explanation: string;
	question: string;
}

export interface QuizMultipleItem {
	answer: string;
	explanation: string;
	question: string;
	options: string[];
	correct: string[];
}

type QuestionType = "open" | "multiple";
