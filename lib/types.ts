export type Role = "trader" | "researcher" | "analyst"
export type RoundType = "behavioral" | "technical" | "mixed"
export type Difficulty = "easy" | "medium" | "hard"

export interface User {
  id: string
  email: string
  created_at: string
}

export interface Session {
  id: string
  user_id: string
  role: Role
  round_type: RoundType
  difficulty: Difficulty
  started_at: string
  ended_at?: string
  score?: number
  feedback?: any
}

export interface QA {
  id: string
  session_id: string
  question: string
  answer?: string
  ai_score?: number
  ai_feedback?: string
  created_at: string
}

export interface GeneratedQuestion {
  question: string
  category: string
  expectedPoints: string[]
}

export interface EvaluationResult {
  score: number
  feedback: string
  strengths: string[]
  improvements: string[]
}
