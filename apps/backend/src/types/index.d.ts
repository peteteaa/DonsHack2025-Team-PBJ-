import type { User } from "@shared/types";
import type { Request } from "express";

export type InputToken = {
	email: string;
};

export interface GeminiResponse {
	chapter: string;
	summary: string;
	transcript_start_id: number;
	transcript_end_id: number;
}

export interface UserRequest extends Request {
	user?: User;
}
