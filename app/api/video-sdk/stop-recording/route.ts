import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { meetingId, sessionId } = await request.json()

    if (!meetingId) {
      return NextResponse.json(
        { error: "Meeting ID is required" },
        { status: 400 }
      )
    }

    const apiKey = process.env.VIDEOSDK_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "VideoSDK API key not configured" },
        { status: 500 }
      )
    }

    // Stop composite recording
    const response = await fetch(
      "https://api.videosdk.live/v2/recordings/composite/stop",
      {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: meetingId,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error("[VideoSDK] Recording stop failed:", data)
      return NextResponse.json(
        { error: data.message || "Failed to stop recording" },
        { status: response.status }
      )
    }

    console.log("[VideoSDK] Recording stopped successfully:", data)

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("[VideoSDK] Error stopping recording:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
