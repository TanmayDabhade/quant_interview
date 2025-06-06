"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingUp, Target, ArrowRight, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"

type Role = "trader" | "researcher" | "analyst"
type RoundType = "behavioral" | "technical" | "mixed"
type Difficulty = "easy" | "medium" | "hard"

const roles = [
  {
    id: "trader" as Role,
    title: "Quant Trader",
    description: "Focus on trading strategies, market microstructure, and risk management",
    icon: TrendingUp,
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    id: "researcher" as Role,
    title: "Quant Researcher",
    description: "Emphasis on mathematical modeling, statistical analysis, and research methodologies",
    icon: Brain,
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    id: "analyst" as Role,
    title: "Quant Analyst",
    description: "Data analysis, portfolio optimization, and quantitative methods",
    icon: Target,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
]

const roundTypes = [
  {
    id: "behavioral" as RoundType,
    title: "Behavioral",
    description: "Situational questions, teamwork, and cultural fit",
    questions: "5-7 questions",
  },
  {
    id: "technical" as RoundType,
    title: "Technical",
    description: "Math, statistics, probability, and domain knowledge",
    questions: "3-5 questions",
  },
  {
    id: "mixed" as RoundType,
    title: "Mixed Round",
    description: "Combination of behavioral and technical questions",
    questions: "6-8 questions",
  },
]

const difficulties = [
  {
    id: "easy" as Difficulty,
    title: "Easy",
    description: "Entry-level questions, basic concepts",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    id: "medium" as Difficulty,
    title: "Medium",
    description: "Intermediate questions, some complexity",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  {
    id: "hard" as Difficulty,
    title: "Hard",
    description: "Advanced questions, high complexity",
    color: "bg-red-100 text-red-800 border-red-200",
  },
]

export default function NewSessionPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedRoundType, setSelectedRoundType] = useState<RoundType | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateSession = async () => {
    if (!selectedRole || !selectedRoundType || !selectedDifficulty) return

    setIsCreating(true)

    // Mock session creation
    const mockSessionId = Math.random().toString(36).substr(2, 9)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Redirect to the interview room
    router.push(`/session/${mockSessionId}`)
  }

  const canProceedToStep2 = selectedRole !== null
  const canProceedToStep3 = selectedRoundType !== null
  const canCreateSession = selectedDifficulty !== null

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">QuantPrep AI</span>
            </div>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-16 h-1 mx-2 ${step > stepNumber ? "bg-blue-600" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {step === 1 && "Choose Your Role"}
                {step === 2 && "Select Interview Type"}
                {step === 3 && "Pick Difficulty Level"}
              </h1>
              <p className="text-gray-600">
                {step === 1 && "Select the quant role you want to practice for"}
                {step === 2 && "Choose the type of interview round"}
                {step === 3 && "Select the difficulty level for your practice session"}
              </p>
            </div>
          </div>

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="space-y-4">
              {roles.map((role) => {
                const Icon = role.icon
                return (
                  <Card
                    key={role.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedRole === role.id ? "ring-2 ring-blue-500 border-blue-200" : "hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${role.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{role.title}</h3>
                          <p className="text-gray-600">{role.description}</p>
                        </div>
                        {selectedRole === role.id && (
                          <div className="text-blue-600">
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Step 2: Round Type Selection */}
          {step === 2 && (
            <div className="space-y-4">
              {roundTypes.map((roundType) => (
                <Card
                  key={roundType.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedRoundType === roundType.id
                      ? "ring-2 ring-blue-500 border-blue-200"
                      : "hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedRoundType(roundType.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{roundType.title}</h3>
                        <p className="text-gray-600 mb-2">{roundType.description}</p>
                        <Badge variant="outline">{roundType.questions}</Badge>
                      </div>
                      {selectedRoundType === roundType.id && (
                        <div className="text-blue-600">
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Step 3: Difficulty Selection */}
          {step === 3 && (
            <div className="space-y-4">
              {difficulties.map((difficulty) => (
                <Card
                  key={difficulty.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedDifficulty === difficulty.id
                      ? "ring-2 ring-blue-500 border-blue-200"
                      : "hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedDifficulty(difficulty.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{difficulty.title}</h3>
                          <Badge className={difficulty.color}>{difficulty.title}</Badge>
                        </div>
                        <p className="text-gray-600">{difficulty.description}</p>
                      </div>
                      {selectedDifficulty === difficulty.id && (
                        <div className="text-blue-600">
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => {
                if (step > 1) {
                  setStep(step - 1)
                } else {
                  router.push("/dashboard")
                }
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {step === 1 ? "Back to Dashboard" : "Previous"}
            </Button>

            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={(step === 1 && !canProceedToStep2) || (step === 2 && !canProceedToStep3)}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleCreateSession} disabled={!canCreateSession || isCreating}>
                {isCreating ? "Creating Session..." : "Start Interview"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
