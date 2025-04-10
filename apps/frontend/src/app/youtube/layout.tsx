import type React from "react";

export default function YouTubeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <main className="min-h-screen bg-background">{children}</main>;
}
