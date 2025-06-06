import { getSupabaseServerClient } from "@/lib/supabase/server"

async function seed() {
  const supabase = getSupabaseServerClient()

  // Create sample users
  const users = [
    { email: "john.doe@example.com" },
    { email: "jane.smith@example.com" },
    { email: "alex.johnson@example.com" },
  ]

  for (const userData of users) {
    const { data: user, error: userError } = await supabase.from("users").insert(userData).select().single()

    if (userError) {
      console.error("Error creating user:", userError)
      continue
    }

    console.log("Created user:", user.email)

    // Create sample sessions for each user
    const sessions = [
      {
        user_id: user.id,
        role: "trader",
        round_type: "behavioral",
        difficulty: "medium",
        ended_at: new Date().toISOString(),
        score: 8,
        feedback: { completed: true, averageScore: 8 },
      },
      {
        user_id: user.id,
        role: "researcher",
        round_type: "technical",
        difficulty: "hard",
        ended_at: new Date().toISOString(),
        score: 7,
        feedback: { completed: true, averageScore: 7 },
      },
    ]

    for (const sessionData of sessions) {
      const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .insert(sessionData)
        .select()
        .single()

      if (sessionError) {
        console.error("Error creating session:", sessionError)
        continue
      }

      console.log("Created session:", session.id)

      // Create sample Q&As for each session
      const qas = [
        {
          session_id: session.id,
          question: "Describe a time when you had to make a quick decision under pressure.",
          answer: "During a market volatility spike, I quickly assessed our risk exposure...",
          ai_score: 8,
          ai_feedback: "Excellent response with clear decision-making process.",
        },
        {
          session_id: session.id,
          question: "Explain the concept of Value at Risk (VaR).",
          answer: "VaR is a statistical measure that quantifies potential portfolio losses...",
          ai_score: 9,
          ai_feedback: "Outstanding technical explanation with good depth.",
        },
      ]

      for (const qaData of qas) {
        const { error: qaError } = await supabase.from("qas").insert(qaData)

        if (qaError) {
          console.error("Error creating Q&A:", qaError)
        }
      }
    }
  }

  console.log("Seed data created successfully!")
}

seed().catch(console.error)
