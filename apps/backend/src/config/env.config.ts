import dotenv from "dotenv";
import { z } from "zod";
import { EnvError } from "../utils/errors";

dotenv.config();

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "local"])
		.default("development"),
	PORT: z.string().default("4000"),
	STYTCH_PROJECT_ID: z.string().min(1, "STYTCH_PROJECT_ID is required"),
	STYTCH_SECRET: z.string().min(1, "STYTCH_SECRET is required"),
	DB_URL: z.string().min(1, "DB_URL is required"),
	TOKEN_KEY: z.string().min(1, "TOKEN_KEY is required"),
	GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
});

let env: z.infer<typeof envSchema>;

try {
	env = envSchema.parse(process.env);
} catch (error) {
	if (error instanceof z.ZodError) {
		throw new EnvError(error);
	}
	throw error;
}

export const EnvConfig = () => {
	const config = {
		environment: env.NODE_ENV,
		port: Number.parseInt(env.PORT, 10),
		stytch: {
			projectId: env.STYTCH_PROJECT_ID,
			secret: env.STYTCH_SECRET,
		},
		dbUrl: env.DB_URL,
		tokenKey: env.TOKEN_KEY,
		gemini: {
			apiKey: env.GEMINI_API_KEY,
		},
	} as const;

	return config;
};
