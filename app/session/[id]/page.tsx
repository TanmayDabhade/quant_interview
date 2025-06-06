"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Brain, Mic, MicOff, Clock, ArrowRight, Save } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"

// Mock questions for different roles and types
const mockQuestions = {
  trader: {
    behavioral: [
      {
        question: "Describe a time when you had to make a quick decision under pressure in a trading environment.",
        category: "Decision Making",
        expectedPoints: ["Quick analysis", "Risk assessment", "Clear reasoning"],
      },
      {
        question: "How do you handle disagreements with colleagues about trading strategies?",
        category: "Teamwork",
        expectedPoints: ["Active listening", "Data-driven discussion", "Compromise"],
      },
      {
        question: "Tell me about a time when you had to adapt to sudden market changes.",
        category: "Adaptability",
        expectedPoints: ["Flexibility", "Quick thinking", "Risk management"],
      },
    ],
    technical: [
      {
        question: "Explain the concept of Value at Risk (VaR) and its limitations.",
        category: "Risk Management",
        expectedPoints: ["Statistical measure", "Confidence intervals", "Model limitations"],
      },
      {
        question: "How would you implement a pairs trading strategy?",
        category: "Trading Strategies",
        expectedPoints: ["Cointegration", "Mean reversion", "Risk controls"],
      },
      {
        question: "Walk me through the Black-Scholes model and its assumptions.",
        category: "Options Pricing",
        expectedPoints: ["Geometric Brownian motion", "Constant volatility", "No dividends"],
      },
    ],
  },
  researcher: {
    behavioral: [
      {
        question: "Describe your approach to conducting quantitative research.",
        category: "Research Methodology",
        expectedPoints: ["Hypothesis formation", "Data analysis", "Validation"],
      },
      {
        question: "How do you handle conflicting research results?",
        category: "Problem Solving",
        expectedPoints: ["Data verification", "Methodology review", "Peer consultation"],
      },
    ],
    technical: [
      {
        question: "Explain the difference between Type I and Type II errors in statistical testing.",
        category: "Statistics",
        expectedPoints: ["False positive", "False negative", "Power analysis"],
      },
      {
        question: "How would you test for stationarity in a time series?",
        category: "Time Series Analysis",
        expectedPoints: ["ADF test", "KPSS test", "Visual inspection"],
      },
    ],
  },
  analyst: {
    behavioral: [
      {
        question: "How do you communicate complex quantitative findings to non-technical stakeholders?",
        category: "Communication",
        expectedPoints: ["Simplification", "Visual aids", "Business impact"],
      },
      {
        question: "Describe a time when your analysis led to a significant business decision.",
        category: "Impact",
        expectedPoints: ["Clear methodology", "Actionable insights", "Measurable results"],
      },
    ],
    technical: [
      {
        question: "Walk me through building a discounted cash flow model.",
        category: "Financial Modeling",
        expectedPoints: ["Cash flow projections", "Discount rate", "Terminal value"],
      },
      {
        question: "How would you analyze the performance of a portfolio?",
        category: "Portfolio Analysis",
        expectedPoints: ["Risk-adjusted returns", "Benchmarking", "Attribution analysis"],
      },
    ],
  },
}

export default function InterviewRoom() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  const { user } = useAuth()

  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [timeRemaining, setTimeRemaining] = useState(1800) // 30 minutes
  const [isLoading, setIsLoading] = useState(true)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [sessionData, setSessionData] = useState<any>(null)
  const [answers, setAnswers] = useState<any[]>([])

  const timerRef = useRef<NodeJS.Timeout>()
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")

  const startListening = () => {
    setIsListening(true)
    // Simulate speech recognition
    setTimeout(() => {
      setTranscript(
        "This is a simulated speech-to-text transcription. In a real implementation, this would use the Web Speech API or a service like AssemblyAI.",
      )
      setIsListening(false)
    }, 3000)
  }

  const stopListening = () => {
    setIsListening(false)
  }

  const resetTranscript = () => {
    setTranscript("")
  }

  // Mock evaluation function
  const evaluateAnswer = async (question: string, answer: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock evaluation based on answer length and content
    const score = Math.min(10, Math.max(1, Math.floor(answer.length / 20) + Math.floor(Math.random() * 3) + 5))

    const feedback =
      answer.length > 100
        ? "Good detailed response. You demonstrated understanding of the key concepts and provided relevant examples."
        : "Your answer shows basic understanding. Consider providing more specific examples and elaborating on key points."

    return {
      score,
      feedback,
      strengths: ["Clear communication", "Relevant content"],
      improvements: ["Add more specific examples", "Elaborate on key concepts"],
    }
  }

  // Initialize session and generate questions
  const initializeSession = async () => {
    if (sessionId === "new") {
      router.replace("/session/new")
      return
    }

    try {
      // Mock session data based on session ID
      const roles = ["trader", "researcher", "analyst"] as const
      const roundTypes = ["behavioral", "technical", "mixed"] as const
      const difficulties = ["easy", "medium", "hard"] as const

      const mockSession = {
        id: sessionId,
        role: roles[sessionId.length % 3],
        round_type: roundTypes[sessionId.length % 3],
        difficulty: difficulties[sessionId.length % 3],
      }

      setSessionData(mockSession)

      // Get questions based on session data
      const roleQuestions = mockQuestions[mockSession.role]
      let selectedQuestions: any[] = []

      if (mockSession.round_type === "mixed") {
        // Mix behavioral and technical questions
        selectedQuestions = [...roleQuestions.behavioral.slice(0, 2), ...roleQuestions.technical.slice(0, 3)]
      } else {
        selectedQuestions = roleQuestions[mockSession.round_type] || roleQuestions.behavioral
      }

      // Shuffle and take first 5 questions
      const shuffled = selectedQuestions.sort(() => 0.5 - Math.random())
      setQuestions(shuffled.slice(0, 5))
      setIsLoading(false)
    } catch (error) {
      console.error("Failed to initialize session:", error)
      setIsLoading(false)
    }
  }

  // Timer countdown
  const startTimer = () => {
    if (!isLoading && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleCompleteSession()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  // Update answer when transcript changes
  const updateAnswerFromTranscript = () => {
    if (transcript) {
      setCurrentAnswer((prev) => prev + " " + transcript)
      resetTranscript()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleNextQuestion = async () => {
    if (!currentAnswer.trim()) return

    setIsEvaluating(true)
    try {
      // Evaluate current answer using mock function
      const evaluation = await evaluateAnswer(questions[currentQuestionIndex].question, currentAnswer)

      // Store the answer and evaluation
      const newAnswer = {
        question: questions[currentQuestionIndex].question,
        answer: currentAnswer,
        score: evaluation.score,
        feedback: evaluation.feedback,
      }

      setAnswers((prev) => [...prev, newAnswer])

      // Move to next question or complete session
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setCurrentAnswer("")
      } else {
        handleCompleteSession()
      }
    } catch (error) {
      console.error("Failed to evaluate answer:", error)
    } finally {
      setIsEvaluating(false)
    }
  }

  const handleCompleteSession = async () => {
    try {
      const averageScore =
        answers.length > 0 ? Math.round(answers.reduce((acc, a) => acc + a.score, 0) / answers.length) : 0

      // Store session results in localStorage for the results page
      const sessionResults = {
        sessionId,
        sessionData,
        answers,
        averageScore,
        completedAt: new Date().toISOString(),
      }

      localStorage.setItem(`session_${sessionId}`, JSON.stringify(sessionResults))
      router.push(`/session/${sessionId}/results`)
    } catch (error) {
      console.error("Failed to complete session:", error)
    }
  }

  useEffect(() => {
    initializeSession()
  }, [sessionId])

  useEffect(() => {
    startTimer()
    return () => {
      stopTimer()
    }
  }, [isLoading, timeRemaining])

  useEffect(() => {
    updateAnswerFromTranscript()
  }, [transcript])

  // If we're on the "new" route, don't render the interview room
  if (sessionId === "new") {
    return null
  }

  return (
    <ProtectedRoute>
      {isLoading ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <Brain className="h-12 w-12 text-blue-600 animate-pulse mb-4" />
              <h3 className="text-lg font-semibold mb-2">Preparing Your Interview</h3>
              <p className="text-gray-600 text-center">
                Generating personalized questions based on your preferences...
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white border-b">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Brain className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold">Interview Session</h1>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{sessionData?.role}</Badge>
                    <Badge variant="outline">{sessionData?.round_type}</Badge>
                    <Badge variant="outline">{sessionData?.difficulty}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span className={timeRemaining < 300 ? "text-red-600 font-semibold" : ""}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
                <Button variant="outline" onClick={handleCompleteSession}>
                  End Session
                </Button>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-sm text-gray-600">
                  {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
                </span>
              </div>
              <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />
            </div>

            {/* Question Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Question {currentQuestionIndex + 1}</CardTitle>
                <Badge variant="secondary">{questions[currentQuestionIndex]?.category}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed">{questions[currentQuestionIndex]?.question}</p>
              </CardContent>
            </Card>

            {/* Answer Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Your Answer
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={isListening ? "destructive" : "outline"}
                      size="sm"
                      onClick={isListening ? stopListening : startListening}
                      disabled={isEvaluating}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="h-4 w-4 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-2" />
                          Start Recording
                        </>
                      )}
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>Type your answer or use the microphone to record your response</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Start typing your answer here..."
                  className="min-h-[200px] mb-4"
                  disabled={isEvaluating}
                />

                {isListening && (
                  <div className="flex items-center space-x-2 text-red-600 mb-4">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                    <span className="text-sm">Recording... Speak clearly into your microphone</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">{currentAnswer.length} characters</div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentAnswer("")}
                      disabled={isEvaluating || !currentAnswer}
                    >
                      Clear
                    </Button>
                    <Button onClick={handleNextQuestion} disabled={!currentAnswer.trim() || isEvaluating}>
                      {isEvaluating ? (
                        "Evaluating..."
                      ) : currentQuestionIndex === questions.length - 1 ? (
                        <>
                          Complete Session
                          <Save className="h-4 w-4 ml-2" />
                        </>
                      ) : (
                        <>
                          Next Question
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </ProtectedRoute>
  )
}
