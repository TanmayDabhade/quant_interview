import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, Session, QA } from "./types"

interface SessionState {
  currentSession: Session | null
  currentQuestions: QA[]
  currentQuestionIndex: number
  timeRemaining: number
  isRecording: boolean
  user: User | null
}

interface SessionActions {
  setUser: (user: User | null) => void
  startSession: (session: Session) => void
  setQuestions: (questions: QA[]) => void
  nextQuestion: () => void
  updateAnswer: (answer: string) => void
  setTimeRemaining: (time: number) => void
  setRecording: (recording: boolean) => void
  resetSession: () => void
}

export const useSessionStore = create<SessionState & SessionActions>()(
  persist(
    (set, get) => ({
      currentSession: null,
      currentQuestions: [],
      currentQuestionIndex: 0,
      timeRemaining: 0,
      isRecording: false,
      user: null,

      setUser: (user) => set({ user }),

      startSession: (session) =>
        set({
          currentSession: session,
          currentQuestionIndex: 0,
          timeRemaining: 1800, // 30 minutes
        }),

      setQuestions: (questions) => set({ currentQuestions: questions }),

      nextQuestion: () => {
        const { currentQuestionIndex, currentQuestions } = get()
        if (currentQuestionIndex < currentQuestions.length - 1) {
          set({ currentQuestionIndex: currentQuestionIndex + 1 })
        }
      },

      updateAnswer: (answer) => {
        const { currentQuestions, currentQuestionIndex } = get()
        const updatedQuestions = [...currentQuestions]
        updatedQuestions[currentQuestionIndex] = {
          ...updatedQuestions[currentQuestionIndex],
          answer,
        }
        set({ currentQuestions: updatedQuestions })
      },

      setTimeRemaining: (time) => set({ timeRemaining: time }),
      setRecording: (recording) => set({ isRecording: recording }),
      resetSession: () =>
        set({
          currentSession: null,
          currentQuestions: [],
          currentQuestionIndex: 0,
          timeRemaining: 0,
          isRecording: false,
        }),
    }),
    {
      name: "session-storage",
      partialize: (state) => ({ user: state.user }),
    },
  ),
)
