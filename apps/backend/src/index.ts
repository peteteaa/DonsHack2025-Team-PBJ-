import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import next from "next";

// Your config / DB
import { EnvConfig } from "./config/env.config";
import connectDB from "./config/mongoose";
import routes from "./routes";

const dev = process.env.NODE_ENV !== "production";
const port = EnvConfig().port;

// 1) Create a Next.js instance pointing to the frontend folder
//    This tells Next where to find pages/.next, etc.
const nextApp = next({
	dev,
	// Adjust this path if needed. The idea is to point to `frontend/`.
	// If this file is compiled to `apps/dist/server.js`,
	// then you might need "../../frontend" or similar.
	dir: path.join(__dirname, "../../", "frontend"),
});
const handle = nextApp.getRequestHandler();

async function startServer() {
	try {
		// 2) Connect to DB, etc.
		await connectDB();

		// 3) Prepare Next.js (loads .next, etc.)
		await nextApp.prepare();

		const app = express();

		// 4) Apply your middlewares
		app.use(cors());
		app.use(express.json());
		app.use(cookieParser());

		// 5) API routes
		app.use("/api", routes);


		// 6) All other routes go to Next.js
		app.all(/^(?!\/api).*/, (req, res) => {
			return handle(req, res);
		});

		// 7) Start the server
		app.listen(port, () => {
			console.log(`> Server is running on http://localhost:${port}`);
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
}

startServer();
