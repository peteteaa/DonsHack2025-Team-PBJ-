import type { User } from "@shared/types";
import type { Request } from "express";

export type InputToken = {
	email: string;
};

export interface RequestUser extends Request {
	user?: User;
}
