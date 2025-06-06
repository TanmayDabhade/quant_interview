import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = getSupabaseServerClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to dashboard after successful auth
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}
