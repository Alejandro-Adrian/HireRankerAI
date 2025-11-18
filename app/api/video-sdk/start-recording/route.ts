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
    const apiSecret = process.env.VIDEOSDK_SECRET

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "VideoSDK credentials not configured" },
        { status: 500 }
      )
    }

    // Start composite recording which captures all participants
    const response = await fetch(
      "https://api.videosdk.live/v2/recordings/composite/start",
      {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: meetingId,
          // Optional: customize recording layout
          layout: {
            type: "GRID",
            priority: "SPEAKER",
            gridSize: 4,
          },
          // Optional: webhook for recording completion
          ...(process.env.VIDEOSDK_WEBHOOK_URL && {
            webhookUrl: process.env.VIDEOSDK_WEBHOOK_URL,
          }),
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error("[VideoSDK] Recording start failed:", data)
      return NextResponse.json(
        { error: data.message || "Failed to start recording" },
        { status: response.status }
      )
    }

    console.log("[VideoSDK] Recording started successfully:", data)

    return NextResponse.json({
      success: true,
      recordingId: data.recordingId,
      data,
    })
  } catch (error) {
    console.error("[VideoSDK] Error starting recording:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
