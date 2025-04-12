// /components/ShortAnswerQuiz.tsx
"use client";
import { Button } from "@/components/ui/button";

interface ShortAnswerQuizProps {
	currentQuestion: {
		question: string;
		answer: string;
		explanation?: string;
	};
	selectedAnswer: string | null;
	showAnswer: boolean;
	onSubmitAnswer: () => void;
	onChangeAnswer: (value: string) => void;
}

const ShortAnswerQuiz: React.FC<ShortAnswerQuizProps> = ({
	currentQuestion,
	selectedAnswer,
	showAnswer,
	onSubmitAnswer,
	onChangeAnswer,
}) => {
	return (
		<div className="space-y-2">
			<textarea
				className="w-full h-32 p-2 border rounded-md"
				onChange={(e) => onChangeAnswer(e.target.value)}
				placeholder="Type your answer here..."
				value={selectedAnswer || ""}
			/>
			<div className="flex gap-2">
				{!showAnswer ? (
					<Button
						className="w-full bg-gray-500 text-white hover:bg-gray-600 hover:text-white"
						disabled={!selectedAnswer}
						onClick={onSubmitAnswer}
						variant="outline"
					>
						Check Answer
					</Button>
				) : null}
			</div>
			{showAnswer && currentQuestion.explanation && (
				<div className="mt-4 p-4 bg-muted rounded-lg">
					<p className="font-semibold">Sample Answer:</p>
					<p>{currentQuestion.answer}</p>
					<p className="font-semibold">Explanation:</p>
					<p>{currentQuestion.explanation}</p>
				</div>
			)}
		</div>
	);
};

export default ShortAnswerQuiz;
