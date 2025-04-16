// /components/NotesPanel.tsx
"use client";
import ContentCard from "@/components/notes/content-card";
const NotesPanel = () => {
	return (
		<div className="w-full h-full overflow-auto">
			<ContentCard />
		</div>
	);
};

export default NotesPanel;
