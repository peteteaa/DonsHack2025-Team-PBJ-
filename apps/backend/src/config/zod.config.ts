import { z } from "zod";

export const emailSchema = z.object({
	email: z.string().email("Invalid email format"),
});

export const createQuizSchema = z.object({
	start: z.number().nonnegative(),
	end: z.number().nonnegative(),
	type: z.enum(["multiple", "open"]),
});

export const validateAnswerSchema = z.object({
	question: z.string(),
	answer: z.string(),
	userAnswer: z.string(),
});

export const FlashcardSchema = z.object({
	front: z.string().min(1, "Front is required"),
	back: z.string().min(1, "Back is required"),
});

export const flashcardPatchSchema = FlashcardSchema.partial().refine(
	(data) => data.front !== undefined || data.back !== undefined,
	{
		message: "At least one field (front or back) must be provided",
	},
);

export const NoteSchema = z.object({
	moment: z.number().int(),
	text: z.string().min(1, "Text is required"),
});

export const notePatchSchema = NoteSchema.partial().refine(
	(data) => data.moment !== undefined || data.text !== undefined,
	{
		message: "At least one field (moment or text) must be provided",
	},
);

export const youtubeUrlSchema = z.string().refine((url) => {
	const pattern =
		/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;
	return pattern.test(url);
}, "Invalid YouTube video URL");
