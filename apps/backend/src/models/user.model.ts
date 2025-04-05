import { Schema, model } from "mongoose";

const userSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true,
	},
	userVideos: [
		{
			videoId: {
				type: String,
				required: true,
			},
			flashCard: [
				{
					front: {
						type: String,
						required: true,
					},
					back: {
						type: String,
						required: true,
					},
				},
			],
			notes: [
				{
					type: String,
				},
			],
		},
	],
});

export default model("User", userSchema);
