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

type QuestionType = 'open' | 'multiple';

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

  const [questionType, setQuestionType] = useState<QuestionType>('open')

  const isMultipleChoice = (question: QuizQuestion): question is MultipleChoiceQuestion => {
    return 'options' in question && 'correct' in question
  }

  const isOpenResponse = (question: QuizQuestion): question is OpenResponseQuestion => {
    return 'answer' in question
  }

  const handleGenerateQuestions = () => {
    if (questionType === "multiple") {
      setQuizData({
        type: "multiple",
        Quiz: [
          {
            question: "What is the first bad practice mentioned in object-oriented Python code?",
            options: [
              "Using inheritance",
              "Having a function masquerading as a class",
              "Not using encapsulation",
              "Using static methods"
            ],
            correct: ["Having a function masquerading as a class"],
            explanation: "The first bad practice discussed is using a class when a simple function would suffice. The example shows a data loader class that only has one method, which could be simplified into a function."
          }
        ]
      });
    } else {
      setQuizData({
        type: "open",
        Quiz: [
          {
            question: "Why should you avoid using classes with static methods for utility functions in Python?",
            answer: "Using classes with static methods for utility functions adds unnecessary complexity and boilerplate code. In Python, it's better to use modules instead, as they provide a cleaner way to organize code without the overhead of class instantiation or static method calls. This makes the code simpler to read and maintain."
          }
        ]
      });
    }
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
  }

  const handleAnswerSelect = (option: string) => {
    setSelectedAnswer(option);
    const currentQuestion = quizData.Quiz[currentQuestionIndex];
    
    if (isMultipleChoice(currentQuestion) && option === currentQuestion.correct[0]) {
      // Wait a bit to show the correct answer before moving to next question
      setTimeout(() => {
        if (currentQuestionIndex < quizData.Quiz.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
        }
      }, 1500);
    }
  }

  const handleShortAnswerSubmit = () => {
    setShowAnswer(true);
    // Wait for user to read the answer before moving to next question
    setTimeout(() => {
      if (currentQuestionIndex < quizData.Quiz.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowAnswer(false);
      }
    }, 3000);
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
                  <div className="p-4 border rounded-lg">
                    {quizData.Quiz.length === 0 ? (
                      <div>
                        <p className="mb-4">No questions available yet.</p>
                        <div className="flex items-center gap-4">
                          <div className="border rounded-lg p-1 flex gap-1">
                            <Button
                              onClick={() => setQuestionType("multiple")}
                              variant={questionType === "multiple" ? "default" : "ghost"}
                              size="sm"
                              className="text-xs"
                            >
                              Multiple Choice
                            </Button>
                            <Button
                              onClick={() => setQuestionType("open")}
                              variant={questionType === "open" ? "default" : "ghost"}
                              size="sm"
                              className="text-xs"
                            >
                              Short Response
                            </Button>
                          </div>
                          <Button
                            onClick={() => handleGenerateQuestions()}
                            variant="default"
                            className="text-sm"
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
                              onClick={() => {
                                setQuizData({ type: "multiple", Quiz: [] });
                                setCurrentQuestionIndex(0);
                                setSelectedAnswer(null);
                                setShowAnswer(false);
                              }}
                              variant="default"
                              className="text-sm"
                            >
                              Reset Questions
                            </Button>
                            <h3 className="text-lg font-semibold ml-4">
                              {quizData.Quiz[currentQuestionIndex].question}
                            </h3>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {questionType === "multiple" && isMultipleChoice(quizData.Quiz[currentQuestionIndex]) ? (
                            quizData.Quiz[currentQuestionIndex].options.map((option: string, index: number) => {
                              const currentQuestion = quizData.Quiz[currentQuestionIndex];
                              const isCorrect = isMultipleChoice(currentQuestion) && selectedAnswer === option && selectedAnswer === currentQuestion.correct[0];
                              const isIncorrect = isMultipleChoice(currentQuestion) && selectedAnswer === option && selectedAnswer !== currentQuestion.correct[0];
                              
                              return (
                                <Button
                                  key={index}
                                  onClick={() => handleAnswerSelect(option)}
                                  variant={selectedAnswer === option ? "default" : "outline"}
                                  className={`w-full justify-start ${
                                    isCorrect ? "bg-green-500 hover:bg-green-600" : 
                                    isIncorrect ? "bg-red-500 hover:bg-red-600" : ""
                                  }`}
                                >
                                  {option}
                                </Button>
                              );
                            })
                          ) : (
                            <div className="space-y-2">
                              <textarea
                                value={selectedAnswer || ""}
                                onChange={(e) => setSelectedAnswer(e.target.value)}
                                placeholder="Type your answer here..."
                                className="w-full h-32 p-2 border rounded-md"
                              />
                              <Button
                                onClick={handleShortAnswerSubmit}
                                variant="outline"
                                className="w-full"
                              >
                                Submit Answer
                              </Button>
                            </div>
                          )}
                        </div>
                        {showAnswer && questionType === "open" && isOpenResponse(quizData.Quiz[currentQuestionIndex]) && (
                          <div className="mt-4 p-4 bg-muted rounded-lg">
                            <p className="font-semibold">Sample Answer:</p>
                            <p>{quizData.Quiz[currentQuestionIndex].answer}</p>
                          </div>
                        )}
                        {selectedAnswer && questionType === "multiple" && isMultipleChoice(quizData.Quiz[currentQuestionIndex]) && (
                          <div className="mt-4 p-4 bg-muted rounded-lg">
                            <p className="font-semibold">Explanation:</p>
                            <p>{quizData.Quiz[currentQuestionIndex].explanation}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
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
  // Use the provided content table
  const contentTable = [
    {
      chapter: "Function vs. Class for Simple Operations",
      summary: "Avoid using a class when a simple function will suffice. Classes should be reserved for situations with multiple methods, data access needs, and multiple instances. Using functions simplifies the code and reduces boilerplate.",
      transcript: [
        {
          end: 79.88,
          start: 0.12,
          text: "is your objectoriented python code turning into unmanageable spaghetti today I&amp;#39;ll cover bad practices to avoid at all costs and what to do instead ..."
        }
      ]
    },
    {
      chapter: "Modules vs. Classes with Static Methods",
      summary: "Instead of using classes with static methods for utility functions, leverage Python modules. Modules provide a cleaner way to organize code without the overhead of class instantiation or static method calls.",
      transcript: [
        {
          end: 387.599,
          start: 79.92,
          text: "needs like so this has simplified the code a lot let me run this just to make sure it works and it does this is the data that it has loaded from the file if you&amp;#39;re using classes a lot in this way just containers for methods that often adds unnecessary complexity and boiler plate code because then you have to create an instance of the class to call that method ..."
        }
      ]
    },
    {
      chapter: "Favor Composition over Inheritance",
      summary: "Avoid overly complex inheritance structures. Instead of using inheritance to define roles, consider using composition with role classes or enums to reduce coupling and improve code maintainability. Flattening hierarchies simplifies the code.",
      transcript: [
        {
          end: 563.68,
          start: 387.599,
          text: "the third bad practice is creating overly complex inheritance structures often people try to avoid or decouple code by using inheritance and this often just makes things worse ..."
        }
      ]
    },
    {
      chapter: "Rely on Abstractions (Dependency Injection and Protocols)",
      summary: "Avoid directly instantiating concrete classes within methods. Instead, use dependency injection to pass instances and leverage abstractions like protocols or abstract base classes to decouple code, improve flexibility, and facilitate testing by enabling the use of mock objects.",
      transcript: [
        {
          end: 626.72,
          start: 563.68,
          text: "the fourth bad practice that you don&amp;#39;t rely on abstractions basically directly calling methods constructing objects from other classes Within a method or a function here you see an example of that I have an order class that has a customer email a product ID and a quantity very basic and they also have an SMTP email service which is used to connect to a server and then sending an email to a customer ..."
        }
      ]
    },
    {
      chapter: "Importance of Encapsulation",
      summary: "Implement encapsulation to hide implementation details and maintain internal consistency. Use methods and properties to control access and modification of internal variables. However, for simple data-focused classes (data classes), direct attribute access can be more practical.",
      transcript: [
        {
          end: 1132.679,
          start: 1002.88,
          text: "the fifth bad practice is do not have encapsulation if you have a class in this case there&amp;#39;s a bank account class that has a balance and the way that we work with the bank account in this example is that we directly modify the balance we subtract 50 we add 100 encapsulation means that you hide implementation details from the outside world this is what methods properties allow you to do in a class ..."
        }
      ]
    },
    {
      chapter: "Avoid Overusing Mixins (Favor Composition)",
      summary: "Overusing mixins leads to complicated and hard-to-trace class hierarchies. Consider using composition instead. If classes are simple, functions might be an even better alternative.",
      transcript: [
        {
          end: 1483.64,
          start: 1132.679,
          text: "and by the way if you enjoy these types of discussions make sure to join my Discord server at discord. iron. codes it&amp;#39;s a really awesome Community love for you to join the final bad practice I want to talk about is mixin yes overusing mixins to add functionality to existing classes can really lead to complicated and hard to trace class hierarchies for example here I have an order class I have a log mix in which has a log methods I have a save mix in which has a save method and then I&amp;#39;m mixing in those features into other classes like processing in order and counseling an order ..."
        }
      ]
    }
  ]

  return <VideoPage contentTable={contentTable} />
}
