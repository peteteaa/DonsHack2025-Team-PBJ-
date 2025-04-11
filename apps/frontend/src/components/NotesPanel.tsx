// /components/NotesPanel.tsx
"use client";
import ContentCard from "@/components/content-card";
import { useVideoContext } from "@/context/VideoContext";

const NotesPanel = () => {
	const { notes, note, setNote, setNotes, videoPageData, player } =
		useVideoContext();

	const handleSaveNotes = async (noteText: string) => {
		if (!(videoPageData && noteText && player)) return;
		const newNote = {
			text: noteText,
			moment: Math.floor(player.getCurrentTime()),
		};

		try {
			const response = await fetch(
				`/api/video/${videoPageData.video.id}/notes`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ note: newNote }),
				}
			);
			if (!response.ok) throw new Error("Failed to save note");
			const updatedNotes = await response.json();
			setNotes(updatedNotes);
			setNote("");
		} catch (error) {
			console.error("Error saving note:", error);
		}
	};

	return (
		<div className="w-full">
			<ContentCard
				contentTable={videoPageData?.video.contentTable || []}
				savedNotes={notes}
				note={note}
				onSetNote={setNote}
				onSaveNotes={handleSaveNotes}
			/>
		</div>
	);
};

export default NotesPanel;
