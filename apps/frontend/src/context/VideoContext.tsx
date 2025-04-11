// /context/VideoContext.tsx
"use client";

import { createContext, useContext, useState } from "react";
import type {
	VideoPage as VideoPageType,
	QuizData,
	UserNoteItem,
} from "@shared/types";
import type { YouTubePlayer } from "@/types";

interface VideoContextProps {
	videoPageData: VideoPageType | null;
	setVideoPageData: React.Dispatch<React.SetStateAction<VideoPageType | null>>;
	notes: UserNoteItem[];
	setNotes: React.Dispatch<React.SetStateAction<UserNoteItem[]>>;
	note: string;
	setNote: React.Dispatch<React.SetStateAction<string>>;
	quizData: QuizData;
	setQuizData: React.Dispatch<React.SetStateAction<QuizData>>;
	showQuiz: boolean;
	setShowQuiz: React.Dispatch<React.SetStateAction<boolean>>;
	currentQuestionIndex: number;
	setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
	selectedAnswer: string | null;
	setSelectedAnswer: React.Dispatch<React.SetStateAction<string | null>>;
	showAnswer: boolean;
	setShowAnswer: React.Dispatch<React.SetStateAction<boolean>>;
	questionType: "multiple" | "open";
	setQuestionType: React.Dispatch<React.SetStateAction<"multiple" | "open">>;
	player: YouTubePlayer | null;
	setPlayer: React.Dispatch<React.SetStateAction<YouTubePlayer | null>>;
	isFullscreen: boolean;
	setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
	isGeneratingQuiz: boolean;
	setIsGeneratingQuiz: React.Dispatch<React.SetStateAction<boolean>>;
}

const VideoContext = createContext<VideoContextProps | undefined>(undefined);

export const useVideoContext = () => {
	const context = useContext(VideoContext);
	if (!context)
		throw new Error("useVideoContext must be used within a VideoProvider");
	return context;
};

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [videoPageData, setVideoPageData] = useState<VideoPageType | null>(
		null
	);
	const [notes, setNotes] = useState<Array<UserNoteItem & { _id: string }>>([]);
	const [note, setNote] = useState("");
	const [quizData, setQuizData] = useState<QuizData>({
		type: "multiple",
		quiz: [],
	});
	const [showQuiz, setShowQuiz] = useState(false);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
	const [showAnswer, setShowAnswer] = useState(false);
	const [questionType, setQuestionType] = useState<"multiple" | "open">(
		"multiple"
	);
	const [player, setPlayer] = useState<YouTubePlayer | null>(null);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

	return (
		<VideoContext.Provider
			value={{
				videoPageData,
				setVideoPageData,
				notes,
				setNotes,
				note,
				setNote,
				quizData,
				setQuizData,
				showQuiz,
				setShowQuiz,
				currentQuestionIndex,
				setCurrentQuestionIndex,
				selectedAnswer,
				setSelectedAnswer,
				showAnswer,
				setShowAnswer,
				questionType,
				setQuestionType,
				player,
				setPlayer,
				isFullscreen,
				setIsFullscreen,
				isGeneratingQuiz,
				setIsGeneratingQuiz,
			}}
		>
			{children}
		</VideoContext.Provider>
	);
};
