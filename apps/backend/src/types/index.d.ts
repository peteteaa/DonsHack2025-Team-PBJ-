import type { TranscriptItem, User } from "@shared/types";
import type { Request } from "express";

export type InputToken = {
	email: string;
};

export interface UserRequest extends Request {
	user?: User;
}

export interface RawTranscript {
	transcript: RawTranscriptItem[];
}
interface RawTranscriptItem {
	duration: number;
	offset: number;
	text: string;
}

export interface Transcript {
	transcript: TranscriptItem[];
}
