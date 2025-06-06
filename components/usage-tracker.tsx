"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Calendar, Target, TrendingUp } from "lucide-react"

interface UsageTrackerProps {
  sessionsUsed: number
  sessionsLimit: number
  currentPlan: string
  averageScore?: number
  totalSessions?: number
}

export function UsageTracker({
  sessionsUsed,
  sessionsLimit,
  currentPlan,
  averageScore = 0,
  totalSessions = 0,
}: UsageTrackerProps) {
  const usagePercentage = sessionsLimit > 0 ? (sessionsUsed / sessionsLimit) * 100 : 0
  const isLimitReached = sessionsUsed >= sessionsLimit && sessionsLimit > 0

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Usage</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {sessionsUsed}
            {sessionsLimit > 0 && <span className="text-sm font-normal text-gray-600">/{sessionsLimit}</span>}
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant={currentPlan === "free" ? "secondary" : "default"} className="capitalize">
              {currentPlan}
            </Badge>
            {isLimitReached && <Badge variant="destructive">Limit Reached</Badge>}
          </div>
          {sessionsLimit > 0 && (
            <div className="mt-3">
              <Progress value={usagePercentage} className="h-2" />
              <p className="text-xs text-gray-600 mt-1">{sessionsLimit - sessionsUsed} sessions remaining this month</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageScore.toFixed(1)}/10</div>
          <Progress value={averageScore * 10} className="h-2 mt-2" />
          <p className="text-xs text-gray-600 mt-1">
            {averageScore >= 8 ? "Excellent" : averageScore >= 6 ? "Good" : "Needs Improvement"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSessions}</div>
          <p className="text-xs text-gray-600 mt-1">All-time practice sessions</p>
        </CardContent>
      </Card>
    </div>
  )
}
