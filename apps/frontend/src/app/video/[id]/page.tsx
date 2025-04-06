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
import { Home as HomeIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VideoPage as VideoPageType } from "@shared/types";
import { Maximize2, Minimize2 } from "lucide-react";
import {useParams, useRouter} from "next/navigation";
import { useEffect, useState } from "react";

// YouTube IFrame API types
declare global {
	interface Window {
		onYouTubeIframeAPIReady: () => void;
		YT: {
			Player: new (
				elementId: string,
				config: {
					height: string;
					width: string;
					videoId: string;
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
			PlayerState: { ENDED: number; PLAYING: number };
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
	const router = useRouter();
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
	const [videoPageData, setVideoPageData] = useState<VideoPageType | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

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
		if (!videoPageData) return; // Load YouTube API
		const tag = document.createElement("script");
		tag.src = "https://www.youtube.com/iframe_api";
		const firstScriptTag = document.getElementsByTagName("script")[0];
		firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

		// Initialize player when API is ready
		window.onYouTubeIframeAPIReady = () => {
			if (!videoPageData?.videoId?.url) {
				return;
			}
			const videoId = videoPageData.videoId.url.split("v=")[1];

			try {
				const newPlayer = new window.YT.Player("youtube-player", {
					height: "100%",
					width: "100%",
					videoId: videoId,
					playerVars: {
						autoplay: 0,
						modestbranding: 1,
						rel: 0,
					},
					events: {
						onStateChange: (event: { data: number }) => {
							console.log("Player state changed:", event.data);
						},
					},
				});
				setPlayer(newPlayer);
			} catch (error) {
				console.error("Error creating YouTube player:", error);
			}
		};
	}, [videoPageData]);

	useEffect(() => {
		const fetchVideoPage = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const response = await fetch(`/api/video/${id}`);
				if (!response.ok) {
					throw new Error("Failed to fetch video page data");
				}
				const data = await response.json();
				setVideoPageData(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setIsLoading(false);
			}
		};

		if (id) {
			fetchVideoPage();
		}
	}, [id]);

	return (
		<div className="container mx-auto py-8 px-4">
			{isLoading && <div>Loading...</div>}
			{error && <div className="text-red-500">Error: {error}</div>}
			{videoPageData && (
				<>
					<div className="flex justify-between items-center mb-8">
						<h1 className="text-3xl font-bold">
							{videoPageData.videoId.title}
						</h1>
						<div className="flex gap-4">
							<ThemeToggle />
							<Button
								onClick={() => router.push('/')}
								size="icon"
								variant="outline"
							><HomeIcon />
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
																		questionType === "open"
																			? "default"
																			: "ghost"
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
																			selectedAnswer ===
																				currentQuestion.correct[0];
																		const isIncorrect =
																			isMultipleChoice(currentQuestion) &&
																			selectedAnswer === option &&
																			selectedAnswer !==
																				currentQuestion.correct[0];

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
																				onClick={() =>
																					handleAnswerSelect(option)
																				}
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
																quizData.Quiz[currentQuestionIndex]
																	.correct[0] && (
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
															<div className="font-semibold">
																{chapter.chapter}
															</div>
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
															{chapter.transcript.map(
																(item: TranscriptItem) => (
																	<div
																		className="flex gap-3 text-sm"
																		key={item.text}
																	>
																		<span className="text-muted-foreground whitespace-nowrap">
																			{formatTimestamp(item.start)} -{" "}
																			{formatTimestamp(item.end)}
																		</span>
																		<p>{item.text}</p>
																	</div>
																),
															)}
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
				</>
			)}
		</div>
	);
};

export default function Page() {
	const [videoPageData, setVideoPageData] = useState<VideoPageType | null>(
		null,
	);
	const params = useParams();
	const id = params?.id as string;

	useEffect(() => {
		const fetchVideoPage = async () => {
			try {
				const response = await fetch(`/api/video/${id}`);
				if (!response.ok) {
					throw new Error("Failed to fetch video page data");
				}
				const data = await response.json();
				setVideoPageData(data);
			} catch (error) {
				console.error("Error fetching video page:", error);
			}
		};

		fetchVideoPage();
	}, [id]);

	return <VideoPage contentTable={videoPageData?.videoId.contentTable ?? []} />;
}
