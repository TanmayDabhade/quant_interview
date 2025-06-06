"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Download, Home, RotateCcw, Trophy, TrendingUp, MessageSquare } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import confetti from "canvas-confetti"

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  const [sessionResults, setSessionResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load session results from localStorage
    const results = localStorage.getItem(`session_${sessionId}`)
    if (results) {
      const parsedResults = JSON.parse(results)
      setSessionResults(parsedResults)

      // Trigger confetti for high scores
      if (parsedResults.averageScore >= 8) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }
    }
    setIsLoading(false)
  }, [sessionId])

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 8) return { variant: "default" as const, text: "Excellent", color: "bg-green-100 text-green-800" }
    if (score >= 6) return { variant: "secondary" as const, text: "Good", color: "bg-yellow-100 text-yellow-800" }
    return { variant: "destructive" as const, text: "Needs Improvement", color: "bg-red-100 text-red-800" }
  }

  const downloadResults = () => {
    // Create a simple text report
    const report = `
Interview Results - ${sessionResults.sessionData.role} ${sessionResults.sessionData.round_type}

Overall Score: ${sessionResults.averageScore}/10
Completed: ${new Date(sessionResults.completedAt).toLocaleDateString()}

Questions and Answers:
${sessionResults.answers
  .map(
    (qa: any, index: number) => `
${index + 1}. ${qa.question}
Answer: ${qa.answer}
Score: ${qa.score}/10
Feedback: ${qa.feedback}
`,
  )
  .join("\n")}
    `

    const blob = new Blob([report], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `interview-results-${sessionId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <Brain className="h-12 w-12 text-blue-600 animate-pulse mb-4" />
              <h3 className="text-lg font-semibold mb-2">Loading Results</h3>
              <p className="text-gray-600 text-center">Preparing your interview results...</p>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  if (!sessionResults) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
              <p className="text-gray-600 text-center mb-4">We couldn't find results for this session.</p>
              <Button onClick={() => router.push("/dashboard")}>
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  const scoreBadge = getScoreBadge(sessionResults.averageScore)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold">Interview Results</h1>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{sessionResults.sessionData.role}</Badge>
                  <Badge variant="outline">{sessionResults.sessionData.round_type}</Badge>
                  <Badge variant="outline">{sessionResults.sessionData.difficulty}</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={downloadResults}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={() => router.push("/dashboard")}>
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Overall Score */}
          <Card className="mb-8">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Trophy className={`h-16 w-16 ${getScoreColor(sessionResults.averageScore)}`} />
              </div>
              <CardTitle className="text-3xl">
                <span className={getScoreColor(sessionResults.averageScore)}>{sessionResults.averageScore}/10</span>
              </CardTitle>
              <CardDescription>
                <Badge className={scoreBadge.color}>{scoreBadge.text}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{sessionResults.answers.length}</div>
                  <div className="text-sm text-gray-600">Questions Answered</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {sessionResults.answers.filter((a: any) => a.score >= 7).length}
                  </div>
                  <div className="text-sm text-gray-600">Strong Answers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(
                      (sessionResults.answers.reduce((acc: number, a: any) => acc + a.score, 0) /
                        (sessionResults.answers.length * 10)) *
                        100,
                    )}
                    %
                  </div>
                  <div className="text-sm text-gray-600">Overall Performance</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Question Results */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center">
              <TrendingUp className="h-6 w-6 mr-2" />
              Question-by-Question Breakdown
            </h2>

            {sessionResults.answers.map((qa: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg font-bold ${getScoreColor(qa.score)}`}>{qa.score}/10</span>
                      <Progress value={qa.score * 10} className="w-20" />
                    </div>
                  </div>
                  <CardDescription className="text-base">{qa.question}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Your Answer:</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{qa.answer}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Feedback:</h4>
                      <p className="text-gray-700">{qa.feedback}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center space-x-4">
            <Button variant="outline" onClick={() => router.push("/session/new")}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Practice Again
            </Button>
            <Button onClick={() => router.push("/dashboard")}>
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
