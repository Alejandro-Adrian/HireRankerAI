import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // This endpoint is now deprecated - transcription happens directly in video-session-batch
    return NextResponse.json({
      success: true,
      message: "Transcription handled by video-session-batch endpoint",
    })
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json(
      { error: "Legacy endpoint" },
      { status: 410 }
    )
  }
}
