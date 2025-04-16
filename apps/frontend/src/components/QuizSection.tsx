// /components/QuizSection.tsx
"use client";
import { Button } from "@/components/ui/button";
import { useQuiz } from "@/hooks/useQuiz";
import MultipleChoiceQuiz from "./MultipleChoiceQuiz";
import ShortAnswerQuiz from "./ShortAnswerQuiz";
import type { QuizMultipleItem, QuizOpenItem } from "@shared/types";

const QuizSection: React.FC = () => {
	const {
		quizData,
		currentQuestionIndex,
		selectedAnswer,
		showAnswer,
		questionType,
		isGeneratingQuiz,
		isAnswer,
		handleGenerateQuestions,
		handleAnswerSelect,
		handleShortAnswerSubmit,
		handleNextQuestion,
		handleQuestionTypeChange,
		handleResetQuiz,
	} = useQuiz();

	// Render quiz controls when no questions have been generated
	const renderQuizControls = () => (
		<div>
			<p className="mb-4">No questions available yet.</p>
			<div className="flex items-center gap-4">
				<div className="border rounded-lg p-1 flex gap-1">
					<Button
						className="text-xs"
						onClick={() => handleQuestionTypeChange("multiple")}
						size="sm"
						variant={questionType === "multiple" ? "default" : "ghost"}
					>
						Multiple Choice
					</Button>
					<Button
						className="text-xs"
						onClick={() => handleQuestionTypeChange("open")}
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
							onClick={handleResetQuiz}
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
						onChangeAnswer={handleAnswerSelect}
					/>
				)}
			</>
		);
	};

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
