// /components/QuizSection.tsx
"use client";
import { Button } from "@/components/ui/button";
import { useVideoContext } from "@/context/VideoContext";
import MultipleChoiceQuiz from "./MultipleChoiceQuiz";
import ShortAnswerQuiz from "./ShortAnswerQuiz";
import type { QuizMultipleItem, QuizOpenItem } from "@shared/types";
import { useState } from "react";

interface QuizSectionProps {
	setErrorMessage: (msg: string | null) => void;
}

const QuizSection: React.FC<QuizSectionProps> = ({ setErrorMessage }) => {
	const {
		player,
		videoPageData,
		quizData,
		setQuizData,
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
	} = useVideoContext();

	const [isAnswer, setIsAnswer] = useState(false);

	// Handler to generate quiz questions
	const handleGenerateQuestions = async () => {
		if (!(player && videoPageData)) {
			setErrorMessage(
				"Cannot generate quiz: Video player or video data not available"
			);
			return;
		}
		const currentTime = Math.floor(player.getCurrentTime());
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
				}
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
				error instanceof Error ? error.message : "Unknown error occurred"
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
				}
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
				error instanceof Error ? error.message : "Unknown error occurred"
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

	// Render quiz controls when no questions have been generated
	const renderQuizControls = () => (
		<div>
			<p className="mb-4">No questions available yet.</p>
			<div className="flex items-center gap-4">
				<div className="border rounded-lg p-1 flex gap-1">
					<Button
						className="text-xs"
						onClick={() => setQuestionType("multiple")}
						size="sm"
						variant={questionType === "multiple" ? "default" : "ghost"}
					>
						Multiple Choice
					</Button>
					<Button
						className="text-xs"
						onClick={() => setQuestionType("open")}
						size="sm"
						variant={questionType === "open" ? "default" : "ghost"}
					>
						Short Response
					</Button>
				</div>
				<Button
					className="text-sm"
					onClick={handleGenerateQuestions}
					disabled={isGeneratingQuiz}
					variant="outline"
				>
					{isGeneratingQuiz ? "Generating Quiz..." : "Generate Quiz"}
				</Button>
			</div>
		</div>
	);

	// Render the quiz content once questions are available, choosing the proper component
	const renderQuizContent = () => {
		const currentQuestion = quizData.quiz[currentQuestionIndex];
		return (
			<>
				<div className="flex justify-between items-center mb-4">
					<div className="flex items-center gap-4">
						<Button
							className="text-sm"
							onClick={() => {
								setQuizData({ type: "multiple", quiz: [] });
								setCurrentQuestionIndex(0);
								setSelectedAnswer(null);
								setShowAnswer(false);
								setIsAnswer(false);
							}}
							variant="default"
						>
							Reset Questions
						</Button>
						<h3 className="text-lg font-semibold ml-4">
							{currentQuestion.question}
						</h3>
					</div>
				</div>

				{questionType === "multiple" ? (
					<MultipleChoiceQuiz
						currentQuestion={currentQuestion as QuizMultipleItem}
						selectedAnswer={selectedAnswer}
						showAnswer={showAnswer}
						onSelectAnswer={handleAnswerSelect}
					/>
				) : (
					<ShortAnswerQuiz
						currentQuestion={currentQuestion as QuizOpenItem}
						selectedAnswer={selectedAnswer}
						showAnswer={showAnswer}
						onSubmitAnswer={handleShortAnswerSubmit}
						onChangeAnswer={setSelectedAnswer}
					/>
				)}
			</>
		);
	};
	console.log(isAnswer);
	return (
		<div className="space-y-4">
			{quizData.quiz.length === 0 ? renderQuizControls() : renderQuizContent()}
			{quizData.quiz.length !== 0 && (
				<div className="flex justify-end">
					<Button
						className="text-sm"
						onClick={handleNextQuestion}
						variant="default"
						disabled={
							!isAnswer || currentQuestionIndex >= quizData.quiz.length - 1
						}
					>
						Next Question
					</Button>
				</div>
			)}
		</div>
	);
};

export default QuizSection;
