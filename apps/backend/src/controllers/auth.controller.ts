import type { CookieOptions, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import { z } from "zod";
import { EnvConfig } from "../config/env.config";
import { stytchClient } from "../config/stytch.config";
import User from "../models/user.model";
import StatusCodes from "../types/response-codes";
import {
	code as createToken,
	decode as decodeToken,
} from "../utils/create-token";

const cookieOptions: CookieOptions = {
	httpOnly: true,
	secure: EnvConfig().environment === "production",
	sameSite: "strict" as const,
	maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
};

const emailSchema = z.object({
	email: z.string().email("Invalid email format"),
});

class AuthController {
	login(req: Request, res: Response) {
		const result = emailSchema.safeParse(req.body);
		if (!result.success) {
			res
				.status(StatusCodes.BAD_REQUEST.code)
				.send(result.error.errors[0].message);
			return;
		}
		const { email } = result.data;

		stytchClient.magicLinks.email
			.loginOrCreate({
				email: email,
			})
			.then(() => {
				res.json({
					message: "Magic link sent successfully",
				});
			})
			.catch((err) => {
				console.error(err);
				res
					.status(StatusCodes.INTERNAL_SERVER_ERROR.code)
					.send(StatusCodes.INTERNAL_SERVER_ERROR.message);
			});
	}

	authenticate(req: Request, res: Response) {
		const token = req.query.token as string;
		const tokenType = req.query.stytch_token_type as string;
		if (tokenType !== "magic_links") {
			console.error(`Unsupported token type: '${tokenType}'`);
			res.status(StatusCodes.BAD_REQUEST.code).send("Unsupported token type");
			return;
		}

		if (!token) {
			res.status(StatusCodes.BAD_REQUEST.code).send("Token is required");
			return;
		}

		stytchClient.magicLinks
			.authenticate({
				token: token,
				session_duration_minutes: 60,
			})
			.then((response) => {
				const email = response.user.emails[0].email;
				User.findOne({ email })
					.then((user) => {
						if (!user) {
							return User.create({
								email: email,
							});
						}
						return Promise.resolve(user);
					})
					.then((user) => {
						res
							.cookie("session_token", createToken({ email }), cookieOptions)
							.json({
								authenticated: true,
								email: user.email,
							});
					})
					.catch((err) => {
						console.error(err);
						res
							.status(StatusCodes.INTERNAL_SERVER_ERROR.code)
							.send(StatusCodes.INTERNAL_SERVER_ERROR.message);
					});
			})
			.catch((err) => {
				console.error(err);
				res
					.status(StatusCodes.UNAUTHORIZED.code)
					.send(StatusCodes.UNAUTHORIZED.message);
			});
	}

	logout(_req: Request, res: Response) {
		res.clearCookie("session_token").send({
			message: "Logged out successfully",
		});
	}

	status(req: Request, res: Response) {
		const token = req.cookies.session_token;

		if (!token) {
			res.status(StatusCodes.UNAUTHORIZED.code).json({
				authenticated: false,
				email: undefined,
			});
			return;
		}

		try {
			const decoded = decodeToken(token);
			if (!decoded) {
				res.status(StatusCodes.UNAUTHORIZED.code).json({
					authenticated: false,
					email: undefined,
				});
				return;
			}
			res.json({
				authenticated: true,
				email: (decoded as JwtPayload).email,
			});
		} catch (err) {
			console.error("Error verifying token:", err);
			res.status(StatusCodes.UNAUTHORIZED.code).json({
				authenticated: false,
				email: undefined,
			});
		}
	}
}

export default new AuthController();
