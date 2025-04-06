import axios from "axios";

/**
 * Fetches the title of a video from a given URL using the noembed API.
 * @param videoUrl
 */
export async function getVideoTitle(videoUrl: string): Promise<string | null> {
	try {
		const response = await axios.get(
			`https://noembed.com/embed?url=${videoUrl}`,
		);

		if (response.status === 200 && response.data && response.data.title) {
			return response.data.title;
		}
		console.error("Response does not contain a title or was not successful");
		return null;
	} catch (error) {
		console.error("Error fetching video title:", error);
		return null;
	}
}
