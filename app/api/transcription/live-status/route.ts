import { NextRequest, NextResponse } from "next/server"

const ASSEMBLY_API_KEY = process.env.ASSEMBLYAI_API_KEY || "7ecd9aaf0ef84f7492ccfbdf715e0065"
const ASSEMBLY_API_URL = "https://api.assemblyai.com/v2"

export async function GET(request: NextRequest) {
  try {
    const transcriptionId = request.nextUrl.searchParams.get("transcriptId") || request.nextUrl.searchParams.get("id")

    if (!transcriptionId) {
      return NextResponse.json({ error: "Missing transcription ID" }, { status: 400 })
    }

    const response = await fetch(`${ASSEMBLY_API_URL}/transcript/${transcriptionId}`, {
      headers: {
        "Authorization": ASSEMBLY_API_KEY,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] Status check failed:", response.status, error)
      return NextResponse.json({ error: "Status check failed" }, { status: response.status })
    }

    const data = await response.json()

    console.log(`[v0] Transcription ${transcriptionId} status: ${data.status}`)

    return NextResponse.json({
      status: data.status,
      transcript: data.text || "",
      confidence: data.confidence || 0,
    })
  } catch (error) {
    console.error("[v0] Failed to check transcription status:", error)
    return NextResponse.json(
      { error: `Failed: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    )
  }
}
