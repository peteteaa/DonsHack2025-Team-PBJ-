import { Schema, model } from "mongoose";

const videoSchema = new Schema({
	url: {
		type: String,
		required: true,
		unique: true,
	},
	title: {
		type: String,
		required: true,
	},
	transcript: [
		{
			type: Object,
			required: true,
		},
	],
	contentTable: {
		type: Object,
		required: true,
	},
});

export default model("Video", videoSchema);
