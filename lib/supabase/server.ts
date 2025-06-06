import { createClient } from "@supabase/supabase-js"

export function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  // Create a mock client if environment variables are missing
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase environment variables are missing. Using mock client.")
    return createMockSupabaseClient()
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

// Mock Supabase client for development
function createMockSupabaseClient() {
  return {
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: mockData[table]?.[0] || null, error: null }),
          order: () => ({ data: mockData[table] || [], error: null }),
          gte: () => ({ data: mockData[table]?.slice(0, 1) || [], error: null }),
        }),
        order: () => ({ data: mockData[table] || [], error: null }),
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({
            data: {
              id: `mock-${Date.now()}`,
              email: "user@example.com",
              subscription_status: "free",
              subscription_plan: "free",
              created_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: async () => ({ data: mockData[table]?.[0] || null, error: null }),
          }),
        }),
      }),
    }),
  } as any
}

// Mock data for development
const mockData = {
  users: [
    {
      id: "mock-user-1",
      email: "user@example.com",
      created_at: new Date().toISOString(),
      subscription_status: "free",
      subscription_plan: "free",
    },
  ],
  sessions: [
    {
      id: "mock-session-1",
      user_id: "mock-user-1",
      role: "trader",
      round_type: "mixed",
      difficulty: "medium",
      started_at: new Date().toISOString(),
      ended_at: null,
      score: null,
      feedback: null,
    },
    {
      id: "mock-session-2",
      user_id: "mock-user-1",
      role: "researcher",
      round_type: "technical",
      difficulty: "hard",
      started_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      ended_at: new Date(Date.now() - 86000000).toISOString(),
      score: 8,
      feedback: { strengths: ["Good analysis"], improvements: ["More examples"] },
    },
  ],
  qas: [],
}
