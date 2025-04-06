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
					moment: {
						type: Number,
						required: true,
					},
					text: {
						type: String,
						required: true,
					},
				},
			],
		},
	],
});

export default model("User", userSchema);
