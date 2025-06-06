"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Zap, Check } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-provider"

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: ["3 practice sessions per month", "Basic AI feedback", "All question types", "Session history"],
    limitations: ["Limited sessions", "Basic feedback only"],
    buttonText: "Current Plan",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    description: "Most popular choice",
    features: [
      "Unlimited practice sessions",
      "Advanced AI feedback",
      "Performance analytics",
      "PDF reports",
      "Priority support",
    ],
    limitations: [],
    buttonText: "Upgrade to Pro",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$49",
    description: "For teams and organizations",
    features: [
      "Everything in Pro",
      "Custom question sets",
      "Team management",
      "Advanced analytics",
      "Dedicated support",
    ],
    limitations: [],
    buttonText: "Contact Sales",
    popular: false,
  },
]

interface SubscriptionManagerProps {
  currentPlan?: string
  onUpgrade?: (planId: string) => void
}

export function SubscriptionManager({ currentPlan = "free", onUpgrade }: SubscriptionManagerProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const { user } = useAuth()

  const handleUpgrade = async (planId: string) => {
    if (!user?.email || !onUpgrade) return

    setLoading(planId)
    try {
      await onUpgrade(planId)
    } catch (error) {
      console.error("Upgrade failed:", error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`relative ${plan.popular ? "border-2 border-blue-500" : "border"} ${
            currentPlan === plan.id ? "bg-blue-50" : ""
          }`}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-500">
                <Crown className="h-3 w-3 mr-1" />
                Most Popular
              </Badge>
            </div>
          )}

          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <div className="text-4xl font-bold">
              {plan.price}
              {plan.id !== "free" && <span className="text-lg font-normal text-gray-600">/month</span>}
            </div>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>

          <CardContent>
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {currentPlan === plan.id ? (
              <Button className="w-full" variant="outline" disabled>
                Current Plan
              </Button>
            ) : (
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading === plan.id}
              >
                {loading === plan.id ? (
                  "Processing..."
                ) : plan.id === "enterprise" ? (
                  "Contact Sales"
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    {plan.buttonText}
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
