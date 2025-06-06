import { env } from "./env"

export async function callGeminiAPI(prompt: string, temperature = 0.7) {
  try {
    // If no API key is available, use mock responses
    if (!env.GEMINI_API_KEY) {
      console.log("No Gemini API key found, using mock response")
      return generateMockResponse(prompt)
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: 2048,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Gemini API error response:", errorText)
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("Gemini API response:", JSON.stringify(data, null, 2))

    if (!data.candidates || data.candidates.length === 0) {
      console.error("No candidates in Gemini response:", data)
      throw new Error("No response candidates from Gemini API")
    }

    if (
      !data.candidates[0].content ||
      !data.candidates[0].content.parts ||
      data.candidates[0].content.parts.length === 0
    ) {
      console.error("Invalid content structure in Gemini response:", data.candidates[0])
      throw new Error("Invalid content structure from Gemini API")
    }

    return data.candidates[0].content.parts[0].text
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    return generateMockResponse(prompt)
  }
}

// Generate mock responses based on the prompt content
function generateMockResponse(prompt: string) {
  if (prompt.includes("Generate") && prompt.includes("interview questions")) {
    return JSON.stringify([
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
      {
        question: "Describe your approach to staying updated with market developments.",
        category: "Market Knowledge",
        expectedPoints: ["Information sources", "Analysis process", "Implementation"],
      },
    ])
  }

  if (prompt.includes("Evaluate") && prompt.includes("answer")) {
    return JSON.stringify({
      score: 7,
      feedback:
        "Good response with clear reasoning. Consider adding more specific examples and technical details to strengthen your answer.",
      strengths: ["Clear communication", "Logical structure", "Good understanding of concepts"],
      improvements: ["Add more specific examples", "Include more technical details", "Quantify results where possible"],
    })
  }

  return "Mock response for: " + prompt.substring(0, 50) + "..."
}
