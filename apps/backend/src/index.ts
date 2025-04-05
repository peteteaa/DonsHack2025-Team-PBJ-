import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { EnvConfig } from "./config/env.config";
import connectDB from "./config/mongoose";
import routes from "./routes";

const app = express();
const PORT = EnvConfig().port;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api", routes);

const startServer = async () => {
	try {
		await connectDB();
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
};

startServer();
