export interface User {
	id: string;
	email: string;
	userVideos?: UserVideosItem[];
}

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

export interface Video {
	id: string;
	url: string;
	title: string;
	transcript: TranscriptItem[];
	contentTable: ContentTableItem[];
}

export interface UserNoteItem {
	_id: string;
	moment: number;
	text: string;
}

export interface UserVideosItem {
	flashCard: FlashCardItem[];
	notes: UserNoteItem[];
	videoId: string | Video;
}

interface FlashCardItem {
	_id: string;
	back: string;
	front: string;
}

export interface VideoPage {
	flashCard: FlashCardItem[];
	notes: UserNoteItem[];
	video: Video;
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
