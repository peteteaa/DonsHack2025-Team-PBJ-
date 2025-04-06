import type { TranscriptItem } from "@shared/types";
import type { RawTranscriptItem } from "../types";

export function formatTranscript(
	transcript: RawTranscriptItem[],
): TranscriptItem[] {
	return transcript.map((item) => ({
		start: Number.parseInt(item.offset.toFixed(3)),
		end: Number.parseInt((item.offset + item.duration).toFixed(3)),
		text: item.text,
	}));
}

export function mergeSegments(segments: TranscriptItem[]): TranscriptItem[] {
	if (segments.length === 0) return [];
	// Start with the first segment
	const merged = [segments[0]];

	for (let i = 1; i < segments.length; i++) {
		const last = merged[merged.length - 1];
		const current = segments[i];

		// Check if current segment overlaps with the last one
		if (current.start < last.end) {
			// Merge by extending the end time and concatenating the texts
			merged[merged.length - 1] = {
				start: last.start,
				end: Math.max(last.end, current.end),
				text: `${last.text} ${current.text}`,
			};
		} else {
			merged.push(current);
		}
	}

	return merged;
}
