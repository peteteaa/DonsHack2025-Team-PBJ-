import type { User } from "@shared/types";
import cors from "cors";
import express from "express";

const app = express();
app.use(cors());

app.get("/api/health", (_req, res) => {
	const user: User = {
		id: "1",
		name: "John",
		email: "john@example.com",
	};
	res.json({ status: "ok", user });
});

app.listen(4000, () => {
	console.log("Backend running at http://localhost:4000");
});
