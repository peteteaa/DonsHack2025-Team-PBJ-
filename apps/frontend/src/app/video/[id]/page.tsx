"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ThemeToggle } from "@/components/theme-toggle"
import { Maximize2, Minimize2 } from "lucide-react"
import ContentCard from "@/components/content-card"
import { Button } from "@/components/ui/button"

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
        }
      ) => YouTubePlayer;
      PlayerState: {
        PLAYING: number;
      };
    }
  }
}

interface YouTubePlayer {
  getCurrentTime: () => number;
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

const VideoPage = ({ contentTable }: VideoPageProps) => {
  const params = useParams()
  const id = params?.id as string
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [showAnswer, setShowAnswer] = useState(false)

  const [quizData, setQuizData] = useState<QuizData>({
    type: "multiple",
    Quiz: []
  })

  const [quizType, setQuizType] = useState("multiple")

  const isMultipleChoice = (question: QuizQuestion): question is MultipleChoiceQuestion => {
    return 'options' in question && 'correct' in question
  }

  const isOpenResponse = (question: QuizQuestion): question is OpenResponseQuestion => {
    return 'answer' in question
  }

  const handleGenerateQuestions = () => {
    if (quizType === "multiple") {
      setQuizData({
        type: "multiple",
        Quiz: [
          {
            question: "What is the primary reason for using functions over classes in simple scenarios?",
            options: [
              "To reduce complexity and boilerplate",
              "To increase flexibility and reusability",
              "To handle multi-threading operations"
            ],
            correct: ["To reduce complexity and boilerplate"],
            explanation: "Functions are preferred in simple scenarios because they help reduce unnecessary complexity and boilerplate."
          },
          {
            question: "Which concept in OOP allows code reuse through hierarchical relationships?",
            options: [
              "Inheritance",
              "Polymorphism",
              "Encapsulation"
            ],
            correct: ["Inheritance"],
            explanation: "Inheritance enables code reuse by allowing classes to inherit properties and methods from other classes."
          },
          {
            question: "What is the main purpose of encapsulation?",
            options: [
              "To hide internal state and implementation details",
              "To create multiple instances of a class",
              "To enable method overriding"
            ],
            correct: ["To hide internal state and implementation details"],
            explanation: "Encapsulation helps maintain code by hiding internal details and exposing only necessary functionality."
          }
        ]
      })
    } else {
      setQuizData({
        type: "open",
        Quiz: [
          {
            question: "What is the main difference between a function and a class in programming?",
            answer: "A function is used for simple tasks, while a class is used for more complex scenarios involving multiple methods, data access, and instances."
          },
          {
            question: "Explain the concept of inheritance in object-oriented programming.",
            answer: "Inheritance allows one class to inherit properties and methods from another class, enabling code reuse and the creation of hierarchical relationships between classes."
          },
          {
            question: "What is polymorphism in object-oriented programming?",
            answer: "Polymorphism is the ability of different classes to be treated as instances of the same class through a common interface, allowing for method overriding or overloading."
          }
        ]
      })
    }
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setUserAnswer("")
    setShowAnswer(false)
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
    const currentQuestion = quizData.Quiz[currentQuestionIndex]
    if (isMultipleChoice(currentQuestion) && answer === currentQuestion.correct[0]) {
      setTimeout(() => {
        if (currentQuestionIndex < quizData.Quiz.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
          setSelectedAnswer(null)
        }
      }, 2000)
    }
  }

  const handleShortAnswerSubmit = () => {
    setShowAnswer(true)
    setTimeout(() => {
      if (currentQuestionIndex < quizData.Quiz.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setUserAnswer("")
        setShowAnswer(false)
      }
    }, 2000)
  }

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const [player, setPlayer] = useState<YouTubePlayer | null>(null)

  useEffect(() => {
    // Load YouTube API
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    let interval: NodeJS.Timeout | undefined

    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      const newPlayer = new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: id,
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onStateChange: (event: { data: number }) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              // Update time every second while playing
              interval = setInterval(() => {
                // We'll use this for future features
                newPlayer.getCurrentTime()
              }, 1000)
            } else {
              // Clear interval when not playing
              if (interval) {
                clearInterval(interval)
                interval = undefined
              }
            }
          }
        }
      })
      setPlayer(newPlayer)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [id])

  const handleGetTimestamp = () => {
    if (player) {
      const time = Math.floor(player.getCurrentTime())
      navigator.clipboard.writeText(time.toString())
      alert(`Current timestamp (${time}s) copied to clipboard!`)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-4">
        <ThemeToggle />
        <Button
          variant="ghost"
          onClick={handleGetTimestamp}
          className="text-sm"
        >
          Get Current Timestamp
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="transition-all duration-200 hover:-translate-y-1 hover:bg-background/40 group">
            <CardHeader className="pb-2">
              <CardTitle className="group-hover:text-primary group-hover:brightness-125">INSERT TITLE HERE!!!!!!</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative pt-[56.25%]">
                <div
                  id="youtube-player"
                  className="absolute inset-0 w-full h-full"
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
              <CardTitle className="group-hover:text-primary group-hover:brightness-125">Video Transcript</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowQuiz(!showQuiz);
                    setSelectedAnswer(null);
                  }}
                  className="text-sm"
                >
                  {showQuiz ? "View Transcript" : "Take Quiz"}
                </Button>
                <button
                  className="p-1 rounded-md hover:bg-muted"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {showQuiz ? (
                <div className="space-y-4">
                  {quizData.Quiz.length === 0 ? (
                    <div className="p-4 border rounded-lg text-center">
                      <p className="mb-4">No questions available yet.</p>
                      <Button 
                        onClick={handleGenerateQuestions}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Generate Questions
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">{quizData.Quiz[currentQuestionIndex].question}</h3>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleGenerateQuestions}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            Generate Questions
                          </Button>
                          <div className="border rounded-lg p-1 flex gap-1">
                            <Button
                              onClick={() => setQuizType("multiple")}
                              variant={quizType === "multiple" ? "default" : "ghost"}
                              size="sm"
                              className="text-xs"
                            >
                              Multiple Choice
                            </Button>
                            <Button
                              onClick={() => setQuizType("open")}
                              variant={quizType === "open" ? "default" : "ghost"}
                              size="sm"
                              className="text-xs"
                            >
                              Short Response
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {quizType === "multiple" && isMultipleChoice(quizData.Quiz[currentQuestionIndex]) ? (
                          quizData.Quiz[currentQuestionIndex].options.map((option: string, index: number) => {
                            const currentQuestion = quizData.Quiz[currentQuestionIndex];
                            const isCorrect = isMultipleChoice(currentQuestion) && selectedAnswer === option && selectedAnswer === currentQuestion.correct[0];
                            
                            return (
                              <div
                                key={index}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                  selectedAnswer === option
                                    ? isCorrect
                                      ? "bg-green-100 border-green-500 dark:bg-green-900/30"
                                      : "bg-red-100 border-red-500 dark:bg-red-900/30"
                                    : "hover:bg-muted"
                                }`}
                                onClick={() => handleAnswerSelect(option)}
                              >
                                {option}
                              </div>
                            );
                          })
                        ) : (
                          <div>
                            <textarea
                              value={userAnswer}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUserAnswer(e.target.value)}
                              placeholder="Enter your answer here..."
                              className="w-full p-4 border rounded-lg"
                            />
                            <div className="flex justify-end mt-4">
                              <Button
                                onClick={handleShortAnswerSubmit}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                                disabled={!userAnswer.trim()}
                              >
                                Submit Answer
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      {showAnswer && quizType === "open" && isOpenResponse(quizData.Quiz[currentQuestionIndex]) && (
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                          <p className="font-semibold">Sample Answer:</p>
                          <p>{quizData.Quiz[currentQuestionIndex].answer}</p>
                        </div>
                      )}
                      {selectedAnswer && quizType === "multiple" && isMultipleChoice(quizData.Quiz[currentQuestionIndex]) && (
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                          <p className="font-semibold">Explanation:</p>
                          <p>{quizData.Quiz[currentQuestionIndex].explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {contentTable.map((chapter: ChapterContent, index: number) => (
                    <AccordionItem key={index} value={`chapter-${index}`}>
                      <AccordionTrigger>
                        <div className="flex flex-col items-start text-left">
                          <div className="font-semibold">{chapter.chapter}</div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className={isFullscreen ? "max-h-none" : "max-h-60 overflow-y-auto"}>
                        <div className="space-y-4">
                          {chapter.transcript.map((item: TranscriptItem, idx: number) => (
                            <div key={idx} className="flex gap-3 text-sm">
                              <span className="text-muted-foreground whitespace-nowrap">
                                {formatTimestamp(item.start)} - {formatTimestamp(item.end)}
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

        <div>
          <ContentCard contentTable={contentTable} /> 
          {/* Notes functionality will be implemented in ContentCard component */}
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  // Initialize with empty content table, will be populated later
  const [contentTable] = useState<ChapterContent[]>([])
  return <VideoPage contentTable={contentTable} />
}
