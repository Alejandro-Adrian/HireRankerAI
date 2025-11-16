export async function GET() {
  try {
    const deepgramApiKey = process.env.DEEPGRAM_API_KEY

    if (!deepgramApiKey) {
      return Response.json(
        { error: "Deepgram API key not configured" },
        { status: 500 }
      )
    }

    return Response.json(
      { error: "Direct API key access is restricted. Use /api/deepgram/token endpoint instead." },
      { status: 403 }
    )

    // /** rest of code here **/
  } catch (error) {
    console.error("[v0] Error in Deepgram key endpoint:", error)
    return Response.json(
      { error: "Failed to retrieve API key" },
      { status: 500 }
    )
  }
}
