// /components/TranscriptQuizContainer.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import { useVideoContext } from "@/context/VideoContext";
import QuizSection from "@/components/QuizSection";
import TranscriptSection from "@/components/TranscriptSection";
import type { ContentTableItem } from "@shared/types";
import { useState } from "react";

interface TranscriptQuizContainerProps {
	contentTable: ContentTableItem[];
}

const TranscriptQuizContainer: React.FC<TranscriptQuizContainerProps> = ({
	contentTable,
}) => {
	const {
		isFullscreen,
		setIsFullscreen,
		showQuiz,
		setShowQuiz,
		setSelectedAnswer,
	} = useVideoContext();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	return (
		<Card
			className={`mt-6 transition-all duration-200 ${
				isFullscreen
					? "fixed inset-0 z-50 m-0 max-h-none rounded-none"
					: "max-h-[400px] overflow-auto hover:-translate-y-1 hover:bg-background/40"
			}`}
		>
			{/* Global error display */}
			{errorMessage && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
					{errorMessage}
				</div>
			)}

			<CardHeader className="pb-2 flex flex-row items-center justify-between">
				<CardTitle className="group-hover:text-primary group-hover:brightness-125">
					{showQuiz ? "Quiz" : "Video Transcript"}
				</CardTitle>
				<div className="flex items-center gap-2">
					<Button
						className="text-sm"
						onClick={() => {
							setShowQuiz(!showQuiz);
							setSelectedAnswer(null);
						}}
						variant="ghost"
					>
						{showQuiz ? "View Transcript" : "Take Quiz"}
					</Button>
					<button
						aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
						className="p-1 rounded-md hover:bg-muted"
						onClick={() => setIsFullscreen(!isFullscreen)}
						type="button"
					>
						{isFullscreen ? (
							<Minimize2 className="h-5 w-5" />
						) : (
							<Maximize2 className="h-5 w-5" />
						)}
					</button>
				</div>
			</CardHeader>

			<CardContent>
				{showQuiz ? (
					<QuizSection setErrorMessage={setErrorMessage} />
				) : (
					<TranscriptSection contentTable={contentTable} />
				)}
			</CardContent>
		</Card>
	);
};

export default TranscriptQuizContainer;
