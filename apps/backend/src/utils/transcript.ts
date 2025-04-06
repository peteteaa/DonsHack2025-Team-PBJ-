import type { TranscriptItem } from "@shared/types";
import type { RawTranscriptItem } from "../types";
import { Innertube } from 'youtubei.js';


export const fetchTranscript = async (youTubeId: string): Promise<string[] | undefined> => {

    const youtube = await Innertube.create({
        lang: 'en',
        location: 'US',
        retrieve_player: false,
    });


    try {
        const info = await youtube.getInfo(youTubeId);
        const transcriptData = await info.getTranscript();
        console.log(transcriptData)
        const mergedSegments = transcriptData.transcript.content?.body?.initial_segments

		console.log(mergedSegments)

		return [];

    } catch (error) {
        console.error('Error fetching transcript:', error);
        throw error;
    }
};

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
