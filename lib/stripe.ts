const createMockStripe = () => ({
  checkout: {
    sessions: {
      create: async (params: any) => ({
        id: `mock_session_${Date.now()}`,
        url: "/dashboard?mock=true",
      }),
    },
  },
  webhooks: {
    constructEvent: (body: string, signature: string, secret: string) => ({
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { userEmail: "test@example.com" },
          customer: "mock_customer",
          subscription: "mock_subscription",
        },
      },
    }),
  },
})

// Use real Stripe if env vars exist, otherwise use mock
export const stripe = process.env.STRIPE_SECRET_KEY
  ? require("stripe")(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" })
  : createMockStripe()

export const STRIPE_PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID || "price_mock_pro",
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_mock_enterprise",
}

export const isStripeConfigured = !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRO_PRICE_ID)
