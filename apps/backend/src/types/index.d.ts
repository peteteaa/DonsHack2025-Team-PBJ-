export type InputToken = {
	email: string;
};

export interface GeminiResponse {
	chapter: string;
	summary: string;
	transcript_start_id: number;
	transcript_end_id: number;
}
