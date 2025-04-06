"use client";

import ContentCard from "@/components/content-card";
import { ThemeToggle } from "@/components/theme-toggle";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Maximize2, Minimize2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// YouTube IFrame API types
declare global {
	interface Window {
		onYouTubeIframeAPIReady: () => void;
		YT: {
			Player: new (
				elementId: string,
				config: {
					videoId: string;
					height?: string | number;
					width?: string | number;
					playerVars?: {
						autoplay?: number;
						modestbranding?: number;
						rel?: number;
					};
					events?: {
						onStateChange?: (event: { data: number }) => void;
					};
				},
			) => YouTubePlayer;
			PlayerState: {
				PLAYING: number;
			};
		};
	}
}

interface YouTubePlayer {
	getCurrentTime: () => number;
	seekTo: (timestamp: number) => void;
}

interface TranscriptItem {
	start: number;
	end: number;
	text: string;
}

interface ChapterContent {
	chapter: string;
	summary: string;
	transcript: TranscriptItem[];
}

interface MultipleChoiceQuestion {
	question: string;
	options: string[];
	correct: string[];
	explanation: string;
}

interface OpenResponseQuestion {
	question: string;
	answer: string;
}

type QuizQuestion = MultipleChoiceQuestion | OpenResponseQuestion;

interface QuizData {
	type: "multiple" | "open";
	Quiz: QuizQuestion[];
}

interface VideoPageProps {
	contentTable: ChapterContent[];
}

type QuestionType = "open" | "multiple";

const VideoPage = ({ contentTable }: VideoPageProps) => {
	const params = useParams();
	const id = params?.id as string;
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [showQuiz, setShowQuiz] = useState(false);
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
	const [showAnswer, setShowAnswer] = useState(false);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [quizData, setQuizData] = useState<QuizData>({
		type: "multiple",
		Quiz: [],
	});

	const [questionType, setQuestionType] = useState<QuestionType>("multiple");

	const [player, setPlayer] = useState<YouTubePlayer | null>(null);

	const [currentTimestamp, setCurrentTimestamp] = useState<number | null>(null);

	const isMultipleChoice = (
		question: QuizQuestion,
	): question is MultipleChoiceQuestion => {
		return "options" in question && "correct" in question;
	};

	const isOpenResponse = (
		question: QuizQuestion,
	): question is OpenResponseQuestion => {
		return "answer" in question;
	};

	const handleGenerateQuestions = async () => {
		if (!player) return;
		const currentTime = Math.floor(player.getCurrentTime());
		setCurrentTimestamp(currentTime);

		setShowQuiz(true);
		setCurrentQuestionIndex(0);
		setSelectedAnswer(null);
		setShowAnswer(false);

		if (questionType === "multiple") {
			setQuizData({
				type: "multiple",
				Quiz: [
					{
						question:
							"What is the primary reason for using functions over classes in simple scenarios?",
						options: [
							"To reduce complexity and boilerplate",
							"To increase flexibility and reusability",
							"To handle multi-threading operations",
						],
						correct: ["To reduce complexity and boilerplate"],
						explanation:
							"Functions are preferred in simple scenarios because they help reduce unnecessary complexity and boilerplate that comes with using classes. Classes are best suited for situations that require multiple methods, data access, and multiple instances.",
					},
					{
						question:
							"What does the term 'polymorphism' mean in object-oriented programming?",
						options: [
							"The ability to use multiple data types in the same variable",
							"The ability to create classes from existing classes",
							"The ability for different classes to be treated as instances of the same class",
						],
						correct: [
							"The ability for different classes to be treated as instances of the same class",
						],
						explanation:
							"Polymorphism allows different classes to be treated as instances of the same class, enabling method overriding and enhancing flexibility in the code.",
					},
					{
						question:
							"Which of the following is a key benefit of encapsulation in object-oriented programming?",
						options: [
							"Improved performance",
							"Reduced complexity by hiding internal states",
							"Increased inheritance flexibility",
						],
						correct: ["Reduced complexity by hiding internal states"],
						explanation:
							"Encapsulation helps by hiding the internal state of an object and exposing only the necessary functionality, reducing complexity and improving maintainability.",
					},
					{
						question:
							"What does inheritance allow in object-oriented programming?",
						options: [
							"Reusing code from other classes",
							"Breaking the encapsulation principle",
							"Managing multi-threaded processes",
						],
						correct: ["Reusing code from other classes"],
						explanation:
							"Inheritance allows one class to inherit properties and methods from another class, promoting code reuse and reducing redundancy.",
					},
					{
						question:
							"Which of the following best describes the purpose of a constructor in a class?",
						options: [
							"It initializes the object's state when the class is instantiated",
							"It defines the behavior of the class's methods",
							"It manages the class's memory allocation",
						],
						correct: [
							"It initializes the object's state when the class is instantiated",
						],
						explanation:
							"The constructor is a special method in a class that is automatically invoked when an object is created. Its purpose is to initialize the object's state and set up initial values for its properties.",
					},
				],
			});
		} else {
			setQuizData({
				type: "open",
				Quiz: [
					{
						question:
							"Why should you avoid using classes with static methods for utility functions in Python?",
						answer:
							"Using classes with static methods for utility functions adds unnecessary complexity and boilerplate code. In Python, it's better to use modules instead, as they provide a cleaner way to organize code without the overhead of class instantiation or static method calls. This makes the code simpler to read and maintain.",
					},
					{
						question:
							"Explain the concept of composition over inheritance and its benefits.",
						answer:
							"Composition over inheritance means favoring object composition (combining simple objects to build more complex ones) rather than using inheritance hierarchies. This approach reduces coupling between classes, improves code maintainability, and provides more flexibility in design. It helps avoid problems like the fragile base class and deep inheritance chains.",
					},
					{
						question:
							"What are the main drawbacks of using complex inheritance structures in Python?",
						answer:
							"Complex inheritance structures can lead to several problems: they make code harder to understand and maintain, create tight coupling between classes, make changes more difficult due to the ripple effect through the inheritance chain, and can lead to the 'diamond problem' in multiple inheritance. It's often better to use composition or simpler inheritance structures.",
					},
				],
			});
		}
	};

	const handleAnswerSelect = (answer: string) => {
		setSelectedAnswer(answer);
		const currentQuestion = quizData.Quiz[currentQuestionIndex];
		if (
			isMultipleChoice(currentQuestion) &&
			answer === currentQuestion.correct[0]
		) {
			setTimeout(() => {
				if (currentQuestionIndex < quizData.Quiz.length - 1) {
					setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
					setSelectedAnswer(null);
					setShowAnswer(false);
				}
			}, 1500);
		}
	};

	const handleShortAnswerSubmit = () => {
		setShowAnswer(true);
		// Only move to next question if there is one
		if (currentQuestionIndex < quizData.Quiz.length - 1) {
			setTimeout(() => {
				setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
				setSelectedAnswer(null);
				setShowAnswer(false);
			}, 3000);
		}
	};

	const formatTimestamp = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	useEffect(() => {
		// Load YouTube API
		const tag = document.createElement("script");
		tag.src = "https://www.youtube.com/iframe_api";
		const firstScriptTag = document.getElementsByTagName("script")[0];
		firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

		// Initialize player when API is ready
		window.onYouTubeIframeAPIReady = () => {
			const newPlayer = new window.YT.Player("youtube-player", {
				height: "100%",
				width: "100%",
				videoId: id,
				playerVars: {
					autoplay: 0,
					modestbranding: 1,
					rel: 0,
				},
			});
			setPlayer(newPlayer);
		};
	}, [id]);

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-2xl font-bold text-primary">DonsFlow</h1>
				<div className="flex items-center gap-4">
					<ThemeToggle />
					<Button
						onClick={() => setIsFullscreen(!isFullscreen)}
						size="icon"
						variant="outline"
					>
						{isFullscreen ? (
							<Minimize2 className="h-4 w-4" />
						) : (
							<Maximize2 className="h-4 w-4" />
						)}
					</Button>
				</div>
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<Card className="transition-all duration-200 hover:-translate-y-1 hover:bg-background/40 group">
						<CardHeader className="pb-2">
							<CardTitle className="group-hover:text-primary group-hover:brightness-125">
								{currentTimestamp !== null && (
									<span className="text-sm font-normal text-muted-foreground">
										Current Time: {formatTimestamp(currentTimestamp)}
									</span>
								)}
							</CardTitle>
						</CardHeader>
						<CardContent className="p-0">
							<div className="relative pt-[56.25%]">
								<div
									className="absolute inset-0 w-full h-full"
									id="youtube-player"
								/>
							</div>
						</CardContent>
					</Card>

					{/* Transcript Dropdown */}
					<Card
						className={`mt-6 transition-all duration-200 ${
							isFullscreen
								? "fixed inset-0 z-50 m-0 max-h-none rounded-none"
								: "max-h-[400px] overflow-auto hover:-translate-y-1 hover:bg-background/40"
						}`}
					>
						<CardHeader className="pb-2 flex flex-row items-center justify-between">
							<CardTitle className="group-hover:text-primary group-hover:brightness-125">
								Video Transcript
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
									aria-label={
										isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
									}
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
								<div className="space-y-4">
									<div className="p-4 border rounded-lg">
										{quizData.Quiz.length === 0 ? (
											<div>
												<p className="mb-4">No questions available yet.</p>
												<div className="flex items-center gap-4">
													<div className="border rounded-lg p-1 flex gap-1">
														<Button
															className="text-xs"
															onClick={() => setQuestionType("multiple")}
															size="sm"
															variant={
																questionType === "multiple"
																	? "default"
																	: "ghost"
															}
														>
															Multiple Choice
														</Button>
														<Button
															className="text-xs"
															onClick={() => setQuestionType("open")}
															size="sm"
															variant={
																questionType === "open" ? "default" : "ghost"
															}
														>
															Short Response
														</Button>
													</div>
													<Button
														className="text-sm"
														onClick={() => handleGenerateQuestions()}
														variant="default"
													>
														Generate Questions
													</Button>
												</div>
											</div>
										) : (
											<>
												<div className="flex justify-between items-center mb-4">
													<div className="flex items-center gap-4">
														<Button
															className="text-sm"
															onClick={() => {
																setQuizData({ type: "multiple", Quiz: [] });
																setCurrentQuestionIndex(0);
																setSelectedAnswer(null);
																setShowAnswer(false);
															}}
															variant="default"
														>
															Reset Questions
														</Button>
														<h3 className="text-lg font-semibold ml-4">
															{quizData.Quiz[currentQuestionIndex].question}
														</h3>
													</div>
												</div>
												<div className="space-y-2">
													{questionType === "multiple" &&
													isMultipleChoice(
														quizData.Quiz[currentQuestionIndex],
													) ? (
														quizData.Quiz[currentQuestionIndex].options.map(
															(option: string) => {
																const currentQuestion =
																	quizData.Quiz[currentQuestionIndex];
																const isCorrect =
																	isMultipleChoice(currentQuestion) &&
																	selectedAnswer === option &&
																	selectedAnswer === currentQuestion.correct[0];
																const isIncorrect =
																	isMultipleChoice(currentQuestion) &&
																	selectedAnswer === option &&
																	selectedAnswer !== currentQuestion.correct[0];

																return (
																	<Button
																		className={`w-full justify-start ${
																			isCorrect
																				? "bg-green-500 hover:bg-green-600"
																				: isIncorrect
																					? "bg-red-500 hover:bg-red-600"
																					: ""
																		}`}
																		disabled={false}
																		key={option}
																		onClick={() => handleAnswerSelect(option)}
																		variant={
																			selectedAnswer === option
																				? "default"
																				: "outline"
																		}
																	>
																		{option}
																	</Button>
																);
															},
														)
													) : (
														<div className="space-y-2">
															<textarea
																className="w-full h-32 p-2 border rounded-md"
																onChange={(e) =>
																	setSelectedAnswer(e.target.value)
																}
																placeholder="Type your answer here..."
																value={selectedAnswer || ""}
															/>
															<div className="flex gap-2">
																<Button
																	className="w-full"
																	disabled={!selectedAnswer || showAnswer}
																	onClick={handleShortAnswerSubmit}
																	variant="outline"
																>
																	Check Answer
																</Button>
																{showAnswer &&
																	currentQuestionIndex <
																		quizData.Quiz.length - 1 && (
																		<Button
																			className="w-full"
																			onClick={() => {
																				setCurrentQuestionIndex(
																					(prevIndex) => prevIndex + 1,
																				);
																				setSelectedAnswer(null);
																				setShowAnswer(false);
																			}}
																			variant="default"
																		>
																			Next Question
																		</Button>
																	)}
															</div>
															{showAnswer &&
																isOpenResponse(
																	quizData.Quiz[currentQuestionIndex],
																) && (
																	<div className="mt-4 p-4 bg-muted rounded-lg">
																		<p className="font-semibold">
																			Sample Answer:
																		</p>
																		<p>
																			{
																				quizData.Quiz[currentQuestionIndex]
																					.answer
																			}
																		</p>
																	</div>
																)}
														</div>
													)}
												</div>
												{selectedAnswer &&
													questionType === "multiple" &&
													isMultipleChoice(
														quizData.Quiz[currentQuestionIndex],
													) &&
													selectedAnswer ===
														quizData.Quiz[currentQuestionIndex].correct[0] && (
														<div className="mt-4 p-4 bg-muted rounded-lg">
															<p className="font-semibold">Explanation:</p>
															<p>
																{
																	quizData.Quiz[currentQuestionIndex]
																		.explanation
																}
															</p>
														</div>
													)}
											</>
										)}
									</div>
								</div>
							) : (
								<Accordion className="w-full" collapsible type="single">
									{contentTable.map((chapter: ChapterContent) => (
										<AccordionItem
											key={chapter.chapter}
											value={chapter.chapter}
										>
											<AccordionTrigger>
												<div className="flex flex-col items-start text-left">
													<div className="font-semibold">{chapter.chapter}</div>
												</div>
											</AccordionTrigger>
											<AccordionContent
												className={
													isFullscreen
														? "max-h-none"
														: "max-h-60 overflow-y-auto"
												}
											>
												<div className="space-y-4">
													{chapter.transcript.map((item: TranscriptItem) => (
														<div className="flex gap-3 text-sm" key={item.text}>
															<span className="text-muted-foreground whitespace-nowrap">
																{formatTimestamp(item.start)} -{" "}
																{formatTimestamp(item.end)}
															</span>
															<p>{item.text}</p>
														</div>
													))}
												</div>
											</AccordionContent>
										</AccordionItem>
									))}
								</Accordion>
							)}
						</CardContent>
					</Card>
				</div>

				<div className="flex flex-col lg:flex-row gap-6">
					<div className={`w-full ${isFullscreen ? "hidden" : ""}`}>
						<ContentCard
							contentTable={contentTable}
							currentTimestamp={currentTimestamp}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default function Page() {
	// Use the provided content table
	const contentTable = [
		{
			chapter: "Function vs. Class for Simple Operations",
			summary:
				"Avoid using a class when a simple function will suffice. Classes should be reserved for situations with multiple methods, data access needs, and multiple instances. Using functions simplifies the code and reduces boilerplate.",
			transcript: [
				{
					end: 79.88,
					start: 0.12,
					text: "is your objectoriented python code turning into unmanageable spaghetti today I&amp;#39;ll cover bad practices to avoid at all costs and what to do instead ...",
				},
			],
		},
		{
			chapter: "Modules vs. Classes with Static Methods",
			summary:
				"Instead of using classes with static methods for utility functions, leverage Python modules. Modules provide a cleaner way to organize code without the overhead of class instantiation or static method calls.",
			transcript: [
				{
					end: 387.599,
					start: 79.92,
					text: "needs like so this has simplified the code a lot let me run this just to make sure it works and it does this is the data that it has loaded from the file if you&amp;#39;re using classes a lot in this way just containers for methods that often adds unnecessary complexity and boiler plate code because then you have to create an instance of the class to call that method ...",
				},
			],
		},
		{
			chapter: "Favor Composition over Inheritance",
			summary:
				"Avoid overly complex inheritance structures. Instead of using inheritance to define roles, consider using composition with role classes or enums to reduce coupling and improve code maintainability. Flattening hierarchies simplifies the code.",
			transcript: [
				{
					end: 563.68,
					start: 387.599,
					text: "the third bad practice is creating overly complex inheritance structures often people try to avoid or decouple code by using inheritance and this often just makes things worse ...",
				},
			],
		},
		{
			chapter: "Rely on Abstractions (Dependency Injection and Protocols)",
			summary:
				"Avoid directly instantiating concrete classes within methods. Instead, use dependency injection to pass instances and leverage abstractions like protocols or abstract base classes to decouple code, improve flexibility, and facilitate testing by enabling the use of mock objects.",
			transcript: [
				{
					end: 626.72,
					start: 563.68,
					text: "the fourth bad practice that you don&amp;#39;t rely on abstractions basically directly calling methods constructing objects from other classes Within a method or a function here you see an example of that I have an order class that has a customer email a product ID and a quantity very basic and they also have an SMTP email service which is used to connect to a server and then sending an email to a customer ...",
				},
			],
		},
		{
			chapter: "Importance of Encapsulation",
			summary:
				"Implement encapsulation to hide implementation details and maintain internal consistency. Use methods and properties to control access and modification of internal variables. However, for simple data-focused classes (data classes), direct attribute access can be more practical.",
			transcript: [
				{
					end: 1132.679,
					start: 1002.88,
					text: "the fifth bad practice is do not have encapsulation if you have a class in this case there&amp;#39;s a bank account class that has a balance and the way that we work with the bank account in this example is that we directly modify the balance we subtract 50 we add 100 encapsulation means that you hide implementation details from the outside world this is what methods properties allow you to do in a class ...",
				},
			],
		},
		{
			chapter: "Avoid Overusing Mixins (Favor Composition)",
			summary:
				"Overusing mixins leads to complicated and hard-to-trace class hierarchies. Consider using composition instead. If classes are simple, functions might be an even better alternative.",
			transcript: [
				{
					end: 1483.64,
					start: 1132.679,
					text: "and by the way if you enjoy these types of discussions make sure to join my Discord server at discord. iron. codes it&amp;#39;s a really awesome Community love for you to join the final bad practice I want to talk about is mixin yes overusing mixins to add functionality to existing classes can really lead to complicated and hard to trace class hierarchies for example here I have an order class I have a log mix in which has a log methods I have a save mix in which has a save method and then I&amp;#39;m mixing in those features into other classes like processing in order and counseling an order ...",
				},
			],
		},
	];

	return <VideoPage contentTable={contentTable} />;
}
