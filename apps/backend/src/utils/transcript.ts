import type { TranscriptItem } from "@shared/types";
import { Innertube } from "youtubei.js";
import type TranscriptSegment from "youtubei.js/dist/src/parser/classes/TranscriptSegment";

export const fetchTranscript = async (youTubeId: string) => {
	const youtube = await Innertube.create({
		lang: "en",
		location: "US",
		retrieve_player: false,
	});

	try {
		const info = await youtube.getInfo(youTubeId);
		const transcriptData = await info.getTranscript();
		return transcriptData.transcript.content?.body?.initial_segments;
	} catch (error) {
		console.error("Error fetching transcript:", error);
		throw error;
	}
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function formatTranscript(segments: any): TranscriptItem[] {
	/**
	 * Example Segment
	 * TranscriptSegment {
	 *     type: 'TranscriptSegment',
	 *     start_ms: '1469',
	 *     end_ms: '3720',
	 *     snippet: Text {
	 *       runs: [Array],
	 *       text: 'learn as much Python as we can in five'
	 *     },
	 *     start_time_text: Text { text: '0:01' },
	 *     target_id: 'I2wURDqiXdM.CgNhc3ISAmVuGgA%3D.1469.3720'
	 *   },
	 */

	return segments.map(
		(item: TranscriptSegment, index: number): TranscriptItem => ({
			id: index,
			start: Math.floor(Number.parseInt(item.start_ms) / 1000),
			end: Math.floor(Number.parseInt(item.end_ms) / 1000),
			text: item.snippet.text || "",
		}),
	);
}
