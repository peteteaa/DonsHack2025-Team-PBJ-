import type { TranscriptItem, User } from "@shared/types";
import type { Request } from "express";

export type InputToken = {
	email: string;
};

export interface UserRequest extends Request {
	user?: User;
}


interface RawTranscriptItem {
	duration: number;
	offset: number;
	text: string;
}
