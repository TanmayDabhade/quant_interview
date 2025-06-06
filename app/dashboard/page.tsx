"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Plus, Clock, Target, TrendingUp, LogOut, User, Crown, Settings } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"

// Mock data for development
const mockSessions = [
  {
    id: "1",
    role: "trader",
    round_type: "behavioral",
    difficulty: "medium",
    started_at: new Date().toISOString(),
    ended_at: new Date().toISOString(),
    score: 8,
  },
  {
    id: "2",
    role: "researcher",
    round_type: "technical",
    difficulty: "hard",
    started_at: new Date(Date.now() - 86400000).toISOString(),
    ended_at: new Date(Date.now() - 86400000).toISOString(),
    score: 7,
  },
]

const mockUserProfile = {
  subscription_status: "free",
  subscription_plan: "free",
}

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [sessions, setSessions] = useState(mockSessions)
  const [userProfile, setUserProfile] = useState(mockUserProfile)

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "trader":
        return <TrendingUp className="h-4 w-4" />
      case "researcher":
        return <Brain className="h-4 w-4" />
      case "analyst":
        return <Target className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "trader":
        return "bg-green-100 text-green-800"
      case "researcher":
        return "bg-purple-100 text-purple-800"
      case "analyst":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Calculate usage stats
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlySessionsUsed = sessions.filter((session) => {
    const sessionDate = new Date(session.started_at)
    return sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear
  }).length

  const sessionsLimit = userProfile.subscription_status === "free" ? 3 : 0 // 0 means unlimited
  const averageScore = sessions.length
    ? sessions.filter((s) => s.score).reduce((acc, s) => acc + (s.score || 0), 0) /
      sessions.filter((s) => s.score).length
    : 0

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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm text-gray-600">{user?.email}</span>
                {userProfile.subscription_status !== "free" && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Crown className="h-3 w-3 mr-1" />
                    {userProfile.subscription_plan}
                  </Badge>
                )}
              </div>
              <Link href="/">
                <Button variant="outline">Home</Button>
              </Link>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Track your interview practice progress and start new sessions</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="subscription">
                <Settings className="h-4 w-4 mr-2" />
                Subscription
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Link href="/session/new">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-blue-200 hover:border-blue-400">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <Plus className="h-12 w-12 text-blue-600 mb-4" />
                      <h3 className="font-semibold text-lg mb-2">New Session</h3>
                      <p className="text-sm text-gray-600">Start practicing now</p>
                    </CardContent>
                  </Card>
                </Link>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">This Month</p>
                        <p className="text-2xl font-bold">{monthlySessionsUsed}</p>
                      </div>
                      <Clock className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Avg Score</p>
                        <p className="text-2xl font-bold">{averageScore.toFixed(1)}</p>
                      </div>
                      <Target className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Completed</p>
                        <p className="text-2xl font-bold">{sessions.filter((s) => s.ended_at).length}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Usage Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Usage</CardTitle>
                  <CardDescription>
                    {userProfile.subscription_status === "free"
                      ? `${monthlySessionsUsed} of ${sessionsLimit} sessions used this month`
                      : "Unlimited sessions available"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userProfile.subscription_status === "free" && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(monthlySessionsUsed / sessionsLimit) * 100}%` }}
                      ></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sessions">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sessions</CardTitle>
                  <CardDescription>Your latest interview practice sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {sessions.length === 0 ? (
                    <div className="text-center py-8">
                      <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions yet</h3>
                      <p className="text-gray-600 mb-4">Start your first interview practice session</p>
                      <Link href="/session/new">
                        <Button>Create New Session</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-4">
                            {getRoleIcon(session.role)}
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge className={getRoleColor(session.role)}>{session.role}</Badge>
                                <Badge variant="outline">{session.round_type}</Badge>
                                <Badge className={getDifficultyColor(session.difficulty)}>{session.difficulty}</Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                {new Date(session.started_at).toLocaleDateString()} at{" "}
                                {new Date(session.started_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            {session.score && (
                              <div className="text-right">
                                <p className="font-semibold">{session.score}/10</p>
                                <p className="text-sm text-gray-600">Score</p>
                              </div>
                            )}
                            {session.ended_at ? (
                              <Link href={`/session/${session.id}/results`}>
                                <Button variant="outline" size="sm">
                                  View Results
                                </Button>
                              </Link>
                            ) : (
                              <Link href={`/session/${session.id}`}>
                                <Button size="sm">Continue</Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscription">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Management</CardTitle>
                    <CardDescription>Manage your subscription and billing preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <h4 className="font-semibold mb-2">Current Plan</h4>
                      <div className="flex items-center space-x-2">
                        <Badge className="capitalize">{userProfile.subscription_plan}</Badge>
                        <span className="text-sm text-gray-600">Status: {userProfile.subscription_status}</span>
                      </div>
                    </div>

                    {userProfile.subscription_status === "free" && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-blue-900 mb-2">Upgrade to Pro</h5>
                        <p className="text-blue-800 text-sm mb-3">
                          Get unlimited sessions, advanced analytics, and priority support.
                        </p>
                        <Button className="bg-blue-600 hover:bg-blue-700">Upgrade Now</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}
