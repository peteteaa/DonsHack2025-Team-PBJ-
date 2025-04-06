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
import type {
	VideoPage as VideoPageType,
	QuizData,
	QuizMultipleItem,
	QuizOpenItem,
} from "@shared/types";

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
				}
			) => YouTubePlayer;
			PlayerState: {
				ENDED: number;
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

type QuestionType = "open" | "multiple";

const VideoPage = ({ contentTable }: { contentTable: ChapterContent[] }) => {
	const params = useParams();
	const id = params?.id as string;
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [showQuiz, setShowQuiz] = useState(false);
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
	const [showAnswer, setShowAnswer] = useState(false);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [quizData, setQuizData] = useState<QuizData>({
		type: "multiple",
		quiz: [],
	});
	const [videoPageData, setVideoPageData] = useState<VideoPageType | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [questionType, setQuestionType] = useState<QuestionType>("multiple");

	const [player, setPlayer] = useState<YouTubePlayer | null>(null);

	const [currentTimestamp, setCurrentTimestamp] = useState<number | null>(null);

	const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

	const isMultipleChoice = (
		question: QuizMultipleItem | QuizOpenItem
	): question is QuizMultipleItem => {
		return "options" in question && "answer" in question;
	};

	const isOpenResponse = (
		question: QuizMultipleItem | QuizOpenItem
	): question is QuizOpenItem => {
		return "answer" in question;
	};

	const handleGenerateQuestions = async () => {
		if (!(player && videoPageData)) return;
		const currentTime = Math.floor(player.getCurrentTime());
		setCurrentTimestamp(currentTime);

		setShowQuiz(true);
		setCurrentQuestionIndex(0);
		setSelectedAnswer(null);
		setShowAnswer(false);
		setIsGeneratingQuiz(true);

		try {
			const response = await fetch(
				`/api/video/${videoPageData.videoId._id}/quiz`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						start: 0,
						end: currentTime,
						type: questionType,
					}),
				}
			);

			if (!response.ok) {
				throw new Error(await response.text());
			}
			const data: QuizData = await response.json();
			setQuizData(data);
		} catch (error) {
			if (error instanceof Error) {
				const errorJson = JSON.parse(error.message);
				if (errorJson.message === "Segment must be at least 5 minutes long") {
					alert(errorJson.message);
				} else {
					console.error("Error generating quiz:", errorJson.message);
				}
			} else {
				console.error("Error generating quiz:", error);
			}
			// Reset quiz state on error
			setShowQuiz(false);
		} finally {
			setIsGeneratingQuiz(false);
		}
	};

	const handleAnswerSelect = (answer: string) => {
		setSelectedAnswer(answer);
		const currentQuestion = quizData.quiz[currentQuestionIndex];
		if (
			isMultipleChoice(currentQuestion) &&
			currentQuestion.answer.includes(answer)
		) {
			setTimeout(() => {
				if (currentQuestionIndex < quizData.quiz.length - 1) {
					setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
					setSelectedAnswer(null);
					setShowAnswer(false);
				}
			}, 1500);
		}
	};

	const handleNextQuestion = () => {
		if (currentQuestionIndex < quizData.quiz.length - 1) {
			setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
			setSelectedAnswer(null);
			setShowAnswer(false);
		}
	};

	const handleShortAnswerSubmit = async () => {
		if (!videoPageData) return;
		if (!selectedAnswer) return;

		try {
			const response = await fetch(
				`/api/video/${videoPageData.videoId._id}/quiz/validate`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						answer: quizData.quiz[currentQuestionIndex].answer,
						userAnswer: selectedAnswer,
						question: quizData.quiz[currentQuestionIndex].question,
					}),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to validate answer");
			}

			const data = await response.json();
			setShowAnswer(true);

			// Update the current question's explanation based on the API response
			const updatedQuiz = [...quizData.quiz];
			if (!data.correct) {
				updatedQuiz[currentQuestionIndex] = {
					...updatedQuiz[currentQuestionIndex],
					explanation: data.explanation,
				};
				setQuizData({ ...quizData, quiz: updatedQuiz });
			}
		} catch (error) {
			console.error("Error validating answer:", error);
		}
	};

	const formatTimestamp = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	useEffect(() => {
		if (!videoPageData) return;

		// Load YouTube API
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
								variant="outline"
								size="icon"
								onClick={() => setIsFullscreen(!isFullscreen)}
							>
								{isFullscreen ? <Minimize2 /> : <Maximize2 />}
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
												{quizData.quiz.length === 0 ? (
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
																onClick={handleGenerateQuestions}
																disabled={isGeneratingQuiz}
																variant="outline"
															>
																{isGeneratingQuiz
																	? "Generating Quiz..."
																	: "Generate Quiz"}
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
																		setQuizData({ type: "multiple", quiz: [] });
																		setCurrentQuestionIndex(0);
																		setSelectedAnswer(null);
																		setShowAnswer(false);
																	}}
																	variant="default"
																>
																	Reset Questions
																</Button>
																<h3 className="text-lg font-semibold ml-4">
																	{quizData.quiz[currentQuestionIndex].question}
																</h3>
															</div>
														</div>
														<div className="space-y-2">
															{questionType === "multiple" &&
															isMultipleChoice(
																quizData.quiz[currentQuestionIndex]
															) ? (
																quizData.quiz[currentQuestionIndex].options.map(
																	(option: string) => {
																		const currentQuestion =
																			quizData.quiz[currentQuestionIndex];
																		const isCorrect =
																			isMultipleChoice(currentQuestion) &&
																			currentQuestion.answer.includes(option);

																		return (
																			<Button
																				className={`w-full justify-start ${
																					isCorrect
																						? "bg-green-500 hover:bg-green-600"
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
																	}
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
																		{!showAnswer ? (
																			<Button
																				className="w-full"
																				disabled={!selectedAnswer}
																				onClick={handleShortAnswerSubmit}
																				variant="outline"
																			>
																				Check Answer
																			</Button>
																		) : (
																			<Button
																				className="w-full"
																				onClick={handleNextQuestion}
																				variant="default"
																				disabled={currentQuestionIndex >= quizData.quiz.length - 1}
																			>
																				Next Question
																			</Button>
																		)}
																	</div>
																	{showAnswer &&
																		isOpenResponse(
																			quizData.quiz[currentQuestionIndex]
																		) && (
																			<div className="mt-4 p-4 bg-muted rounded-lg">
																				<p className="font-semibold">
																					Sample Answer:
																				</p>
																				<p>
																					{
																						quizData.quiz[currentQuestionIndex]
																							.answer
																					}
																				</p>
																				<p className="font-semibold">
																					Explanation:
																				</p>
																				<p>
																					{
																						quizData.quiz[currentQuestionIndex]
																							.explanation
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
																quizData.quiz[currentQuestionIndex]
															) &&
															quizData.quiz[
																currentQuestionIndex
															].answer.includes(selectedAnswer) && (
																<div className="mt-4 p-4 bg-muted rounded-lg">
																	<p className="font-semibold">Explanation:</p>
																	<p>
																		{
																			quizData.quiz[currentQuestionIndex]
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
																)
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
		null
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
