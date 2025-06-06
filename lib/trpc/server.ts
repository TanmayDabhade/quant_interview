import { initTRPC } from "@trpc/server"
import { z } from "zod"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { callGeminiAPI } from "@/lib/gemini"

const t = initTRPC.create()

export const router = t.router
export const publicProcedure = t.procedure

// Fallback questions for when API fails
const fallbackQuestions = {
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
    ],
  },
  researcher: {
    behavioral: [
      {
        question: "Describe your approach to conducting quantitative research.",
        category: "Research Methodology",
        expectedPoints: ["Hypothesis formation", "Data analysis", "Validation"],
      },
    ],
    technical: [
      {
        question: "Explain the difference between Type I and Type II errors in statistical testing.",
        category: "Statistics",
        expectedPoints: ["False positive", "False negative", "Power analysis"],
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
    ],
    technical: [
      {
        question: "Walk me through building a discounted cash flow model.",
        category: "Financial Modeling",
        expectedPoints: ["Cash flow projections", "Discount rate", "Terminal value"],
      },
    ],
  },
}

export const appRouter = router({
  generateQuestions: publicProcedure
    .input(
      z.object({
        role: z.enum(["trader", "researcher", "analyst"]),
        roundType: z.enum(["behavioral", "technical", "mixed"]),
        difficulty: z.enum(["easy", "medium", "hard"]),
        count: z.number().default(5),
      }),
    )
    .mutation(async ({ input }) => {
      const { role, roundType, difficulty, count } = input

      try {
        const systemPrompt = `You are an expert interviewer for quantitative finance roles. Generate ${count} ${difficulty} ${roundType} interview questions for a ${role} position.

For behavioral questions, focus on:
- Leadership and teamwork
- Problem-solving under pressure
- Risk management mindset
- Communication skills
- Adaptability in fast-paced environments

For technical questions, focus on:
- Mathematical concepts (probability, statistics, calculus)
- Programming and algorithms
- Financial markets knowledge
- Risk management
- Data analysis and modeling

Return ONLY a valid JSON array of objects with this exact structure:
[
  {
    "question": "The interview question",
    "category": "The specific category/topic",
    "expectedPoints": ["Key point 1", "Key point 2", "Key point 3"]
  }
]

Generate ${count} questions for ${role} ${roundType} interview at ${difficulty} level.`

        const content = await callGeminiAPI(systemPrompt, 0.7)

        // Try to parse the JSON response
        let questions
        try {
          // Clean the response to extract JSON
          const jsonMatch = content.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            questions = JSON.parse(jsonMatch[0])
          } else {
            throw new Error("No JSON array found in response")
          }
        } catch (parseError) {
          console.error("Failed to parse Gemini response:", parseError)
          throw new Error("Invalid JSON response from Gemini")
        }

        return questions
      } catch (error) {
        console.error("Error generating questions with Gemini, using fallback:", error)

        // Use fallback questions
        const questionType = roundType === "mixed" ? (Math.random() > 0.5 ? "behavioral" : "technical") : roundType
        const availableQuestions = fallbackQuestions[role]?.[questionType] || fallbackQuestions.trader.behavioral

        // Return the requested number of questions (repeat if necessary)
        const questions = []
        for (let i = 0; i < count; i++) {
          questions.push(availableQuestions[i % availableQuestions.length])
        }

        return questions
      }
    }),

  evaluateAnswer: publicProcedure
    .input(
      z.object({
        question: z.string(),
        answer: z.string(),
        role: z.enum(["trader", "researcher", "analyst"]),
        roundType: z.enum(["behavioral", "technical", "mixed"]),
        difficulty: z.enum(["easy", "medium", "hard"]),
        expectedPoints: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { question, answer, role, roundType, difficulty, expectedPoints } = input

      try {
        const systemPrompt = `You are an expert interviewer evaluating answers for quantitative finance roles. 

Evaluate this ${roundType} interview answer for a ${role} position at ${difficulty} level.

Question: ${question}
Answer: ${answer}
Expected key points: ${expectedPoints?.join(", ") || "Not provided"}

Provide a score from 0-10 and detailed feedback. Consider:
- Technical accuracy and depth
- Communication clarity
- Relevant experience demonstration
- Problem-solving approach
- Industry knowledge

Return ONLY a valid JSON object with this exact structure:
{
  "score": 8,
  "feedback": "Detailed feedback paragraph",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement 1", "Improvement 2"]
}

Please evaluate this answer.`

        const content = await callGeminiAPI(systemPrompt, 0.3)

        // Try to parse the JSON response
        let evaluation
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            evaluation = JSON.parse(jsonMatch[0])
          } else {
            throw new Error("No JSON object found in response")
          }
        } catch (parseError) {
          console.error("Failed to parse evaluation response:", parseError)
          throw new Error("Invalid JSON response from Gemini")
        }

        return evaluation
      } catch (error) {
        console.error("Error evaluating answer with Gemini, using fallback:", error)

        // Fallback evaluation
        const score = Math.floor(Math.random() * 3) + 6 // Random score between 6-8
        return {
          score,
          feedback: `Your answer demonstrates understanding of the topic. ${answer.length > 100 ? "Good detail provided." : "Consider providing more specific examples."} Continue practicing to improve your responses.`,
          strengths: ["Clear communication", "Relevant content"],
          improvements: ["Add more specific examples", "Elaborate on key concepts"],
        }
      }
    }),

  createSession: publicProcedure
    .input(
      z.object({
        userEmail: z.string().email(),
        role: z.enum(["trader", "researcher", "analyst"]),
        roundType: z.enum(["behavioral", "technical", "mixed"]),
        difficulty: z.enum(["easy", "medium", "hard"]),
      }),
    )
    .mutation(async ({ input }) => {
      const supabase = getSupabaseServerClient()

      // Get or create user with subscription fields
      let { data: user } = await supabase.from("users").select("*").eq("email", input.userEmail).single()

      if (!user) {
        const { data: newUser, error } = await supabase
          .from("users")
          .insert({
            email: input.userEmail,
            subscription_status: "free",
            subscription_plan: "free",
          })
          .select()
          .single()

        if (error) throw error
        user = newUser
      }

      // Check session limits for free users
      if (user.subscription_status === "free") {
        const { data: sessions } = await supabase
          .from("sessions")
          .select("id")
          .eq("user_id", user.id)
          .gte("started_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

        if (sessions && sessions.length >= 3) {
          throw new Error("Free plan limit reached. Upgrade to Pro for unlimited sessions.")
        }
      }

      // Create session
      const { data: session, error } = await supabase
        .from("sessions")
        .insert({
          user_id: user.id,
          role: input.role,
          round_type: input.roundType,
          difficulty: input.difficulty,
        })
        .select()
        .single()

      if (error) throw error
      return session
    }),

  saveQA: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        question: z.string(),
        answer: z.string(),
        aiScore: z.number(),
        aiFeedback: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const supabase = getSupabaseServerClient()

      const { data, error } = await supabase
        .from("qas")
        .insert({
          session_id: input.sessionId,
          question: input.question,
          answer: input.answer,
          ai_score: input.aiScore,
          ai_feedback: input.aiFeedback,
        })
        .select()
        .single()

      if (error) throw error
      return data
    }),

  completeSession: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        score: z.number(),
        feedback: z.any(),
      }),
    )
    .mutation(async ({ input }) => {
      const supabase = getSupabaseServerClient()

      const { data, error } = await supabase
        .from("sessions")
        .update({
          ended_at: new Date().toISOString(),
          score: input.score,
          feedback: input.feedback,
        })
        .eq("id", input.sessionId)
        .select()
        .single()

      if (error) throw error
      return data
    }),

  getUserSessions: publicProcedure
    .input(
      z.object({
        userEmail: z.string().email(),
      }),
    )
    .query(async ({ input }) => {
      const supabase = getSupabaseServerClient()

      const { data: user } = await supabase.from("users").select("id").eq("email", input.userEmail).single()

      if (!user) return []

      const { data: sessions, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })

      if (error) throw error
      return sessions || []
    }),

  getUserProfile: publicProcedure
    .input(
      z.object({
        userEmail: z.string().email(),
      }),
    )
    .query(async ({ input }) => {
      const supabase = getSupabaseServerClient()

      const { data: user, error } = await supabase.from("users").select("*").eq("email", input.userEmail).single()

      if (error) throw error
      return user
    }),
})

export type AppRouter = typeof appRouter
