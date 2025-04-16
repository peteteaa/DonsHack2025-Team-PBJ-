import { useVideoContext } from "@/hooks/useVideoContext";
import type { QuizData } from "@shared/types";
import { useState } from "react";

export function useQuiz() {
	const [quizData, setQuizData] = useState<QuizData>({
		type: "multiple",
		quiz: [],
	});
	const [showQuiz, setShowQuiz] = useState(false);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
	const [showAnswer, setShowAnswer] = useState(false);
	const [questionType, setQuestionType] = useState<"multiple" | "open">(
		"multiple",
	);
	const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isAnswer, setIsAnswer] = useState(false);
	// UseVideoContext hook
	const { player, videoPageData } = useVideoContext();

	// Handler to generate quiz questions
	const handleGenerateQuestions = async () => {
		if (!(player && videoPageData)) {
			setErrorMessage(
				"Cannot generate quiz: Video player or video data not available",
			);
			return;
		}
		const currentTime = Math.floor(player.getCurrentTime?.() ?? 0);
		setQuizData({ type: questionType, quiz: [] });
		setCurrentQuestionIndex(0);
		setSelectedAnswer(null);
		setShowAnswer(false);
		setIsGeneratingQuiz(true);
		setErrorMessage(null);

		try {
			const response = await fetch(
				`/api/video/${videoPageData.video.id}/quiz`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						start: 0,
						end: currentTime,
						type: questionType,
					}),
				},
			);
			if (!response) {
				setErrorMessage("Failed to generate quiz: No response from server");
				return;
			}
			if (!response.ok) {
				if (response.status === 400) {
					const errorData = await response.json();
					throw new Error(errorData.message || "Bad request error");
				}
				const errorText = await response.text();
				throw new Error(`Failed to generate quiz: ${errorText}`);
			}
			const data = await response.json();
			setQuizData(data);
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "Unknown error occurred",
			);
			// Hide quiz on error
			setQuizData({ type: questionType, quiz: [] });
		} finally {
			setIsGeneratingQuiz(false);
		}
	};

	// Handler for selecting an answer (used for multiple choice)
	const handleAnswerSelect = (answer: string) => {
		setSelectedAnswer(answer);
		const currentQuestion = quizData.quiz[currentQuestionIndex];
		if (
			"options" in currentQuestion &&
			currentQuestion.answer.includes(answer)
		) {
			setShowAnswer(true);
			setIsAnswer(true);
		}
	};

	// Handler for short answer submission
	const handleShortAnswerSubmit = async () => {
		if (!(videoPageData && selectedAnswer)) return;
		try {
			const response = await fetch(
				`/api/video/${videoPageData.video.id}/quiz/validate`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						answer: quizData.quiz[currentQuestionIndex].answer,
						userAnswer: selectedAnswer,
						question: quizData.quiz[currentQuestionIndex].question,
					}),
				},
			);
			if (!response.ok) throw new Error("Failed to validate answer");
			const data = await response.json();
			setShowAnswer(true);
			if (!data.correct) {
				const updatedQuiz = [...quizData.quiz];
				updatedQuiz[currentQuestionIndex] = {
					...updatedQuiz[currentQuestionIndex],
					explanation: data.explanation,
				};
				setQuizData({ ...quizData, quiz: updatedQuiz });
			}
			setIsAnswer(true);
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "Unknown error occurred",
			);
		}
	};

	// Handler to move to the next question
	const handleNextQuestion = () => {
		if (currentQuestionIndex < quizData.quiz.length - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
			setSelectedAnswer(null);
			setShowAnswer(false);
			setIsAnswer(false);
		}
	};

	// Handler to change question type
	const handleQuestionTypeChange = (type: "multiple" | "open") => {
		setQuestionType(type);
	};

	// Handler to reset the quiz
	const handleResetQuiz = () => {
		setQuizData({ type: "multiple", quiz: [] });
		setCurrentQuestionIndex(0);
		setSelectedAnswer(null);
		setShowAnswer(false);
		setIsAnswer(false);
	};

	return {
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
		isGeneratingQuiz,
		setIsGeneratingQuiz,
		errorMessage,
		setErrorMessage,
		isAnswer,
		setIsAnswer,
		handleGenerateQuestions,
		handleAnswerSelect,
		handleShortAnswerSubmit,
		handleNextQuestion,
		handleQuestionTypeChange,
		handleResetQuiz,
	};
}
