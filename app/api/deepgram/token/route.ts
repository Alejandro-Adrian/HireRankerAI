export async function GET() {
  try {
    const deepgramApiKey = process.env.DEEPGRAM_API_KEY

    if (!deepgramApiKey) {
      return Response.json(
        { error: "Deepgram API key not configured" },
        { status: 500 }
      )
    }

    const response = await fetch("https://api.deepgram.com/v1/auth/token", {
      method: "GET",
      headers: {
        "Authorization": `Token ${deepgramApiKey}`,
      },
    })

    if (!response.ok) {
      console.error("[v0] Deepgram token API error:", response.statusText)
      console.warn("[v0] Falling back to raw API key for transcription")
      return Response.json({
        token: deepgramApiKey,
        warning: "Using raw API key - token generation failed",
      })
    }

    const data = await response.json()

    return Response.json({
      token: data.token || deepgramApiKey,
    })
  } catch (error) {
    console.error("[v0] Error generating Deepgram token:", error)
    const deepgramApiKey = process.env.DEEPGRAM_API_KEY
    if (deepgramApiKey) {
      return Response.json({
        token: deepgramApiKey,
        warning: "Token generation failed, using raw API key",
      })
    }
    return Response.json(
      { error: "Failed to generate transcription token" },
      { status: 500 }
    )
  }
}
