import { type NextRequest, NextResponse } from "next/server"
import { stripe, isStripeConfigured } from "@/lib/stripe"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  // If Stripe is not configured, return success for development
  if (!isStripeConfigured) {
    console.log("Stripe webhook called but Stripe is not configured - using mock response")
    return NextResponse.json({ received: true, mock: true })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = getSupabaseServerClient()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userEmail = session.metadata?.userEmail

        if (userEmail) {
          // Update user subscription status
          await supabase
            .from("users")
            .update({
              subscription_status: "active",
              stripe_customer_id: session.customer as string,
              subscription_id: session.subscription as string,
            })
            .eq("email", userEmail)
        }
        break
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const status = subscription.status === "active" ? "active" : "inactive"

        await supabase.from("users").update({ subscription_status: status }).eq("stripe_customer_id", customerId)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error handling webhook:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
