import { type NextRequest, NextResponse } from "next/server"
import { stripe, isStripeConfigured } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const { priceId, userEmail } = await request.json()

    if (!priceId || !userEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // If Stripe is not configured, return mock data
    if (!isStripeConfigured) {
      return NextResponse.json({
        sessionId: `mock_session_${Date.now()}`,
        url: `${request.nextUrl.origin}/dashboard?mock_checkout=true&plan=${priceId}`,
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${request.nextUrl.origin}/dashboard?success=true`,
      cancel_url: `${request.nextUrl.origin}/dashboard?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userEmail,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
