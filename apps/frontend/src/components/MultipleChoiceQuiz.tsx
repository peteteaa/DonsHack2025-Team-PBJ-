// /components/MultipleChoiceQuiz.tsx
"use client";
import { Button } from "@/components/ui/button";

interface MultipleChoiceQuizProps {
	currentQuestion: {
		question: string;
		options: string[];
		answer: string | string[]; // Either a string or an array
		explanation?: string;
	};
	selectedAnswer: string | null;
	showAnswer: boolean;
	onSelectAnswer: (option: string) => void;
}

const MultipleChoiceQuiz: React.FC<MultipleChoiceQuizProps> = ({
	currentQuestion,
	selectedAnswer,
	showAnswer,
	onSelectAnswer,
}) => {
	return (
		<div className="space-y-2 flex flex-col">
			{currentQuestion.options.map((option: string) => {
				// Determine if the option is correct
				const isCorrect =
					typeof currentQuestion.answer === "string"
						? currentQuestion.answer === option
						: currentQuestion.answer.includes(option);
				return (
					<Button
						key={option}
						className={
							selectedAnswer === option
								? isCorrect
									? "bg-green-500 hover:bg-green-600 w-full"
									: "bg-red-500 hover:bg-red-600 w-full"
								: "w-full"
						}
						onClick={() => onSelectAnswer(option)}
						variant={selectedAnswer === option ? "default" : "outline"}
					>
						{option}
					</Button>
				);
			})}
			{showAnswer && currentQuestion.explanation && (
				<div className="mt-4 p-4 bg-muted rounded-lg flex flex-col">
					<p className="font-semibold">Explanation:</p>
					<p>{currentQuestion.explanation}</p>
				</div>
			)}
		</div>
	);
};

export default MultipleChoiceQuiz;
