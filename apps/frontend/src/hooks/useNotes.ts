import { useVideoContext } from "@/hooks/useVideoContext";
import type { UserNoteItem } from "@shared/types";
import { useCallback, useEffect, useState } from "react";

export function useNotes() {
	const [notes, setNotes] = useState<UserNoteItem[]>([]);
	const [note, setNote] = useState("");

	const { videoPageData, player } = useVideoContext();

	// Keep notes sorted and up-to-date with videoPageData
	useEffect(() => {
		if (videoPageData) {
			setNotes([...videoPageData.notes].sort((a, b) => a.moment - b.moment));
		}
	}, [videoPageData]);

	// Save note to backend and update notes state
	const handleSaveNotes = useCallback(
		async (noteText: string) => {
			if (!(videoPageData && noteText && player)) return;
			const newNote = {
				text: noteText,
				moment: Math.floor(player.getCurrentTime() ?? 0),
			};
			try {
				const response = await fetch(
					`/api/video/${videoPageData.video.id}/notes`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ note: newNote }),
					},
				);
				if (!response.ok) throw new Error("Failed to save note");
				const updatedNotes: UserNoteItem[] = await response.json();
				setNotes(updatedNotes.sort((a, b) => a.moment - b.moment));
				setNote("");
			} catch (error) {
				// You may want to expose this error to the UI
				console.error("Error saving note:", error);
			}
		},
		[videoPageData, player],
	);

	return {
		notes,
		setNotes,
		note,
		setNote,
		handleSaveNotes,
	};
}
