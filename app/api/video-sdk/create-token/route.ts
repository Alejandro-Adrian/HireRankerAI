import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { meetingId, isHost, userName } = await request.json()

    if (!meetingId) {
      return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 })
    }

    const apiKey = process.env.VIDEOSDK_API_KEY
    const apiSecret = process.env.VIDEOSDK_SECRET

    if (!apiKey || !apiSecret) {
      console.error("[v0] VideoSDK API key or secret not configured")
      return NextResponse.json({ error: "VideoSDK credentials not configured" }, { status: 500 })
    }

    const payload = {
      apikey: apiKey,
      permissions: ["allow_join"],
      version: 2,
      roles: ["rtc"],
      roomId: meetingId,
      participantId: `${isHost ? "host" : "participant"}-${Date.now()}`,
    }

    const token = jwt.sign(payload, apiSecret, { algorithm: "HS256", expiresIn: "24h" })

    console.log("[v0] VideoSDK access token generated successfully for meeting:", meetingId)

    return NextResponse.json({
      success: true,
      token,
      apiKey,
      meetingId,
      isHost,
    })
  } catch (error) {
    console.error("[v0] Error generating VideoSDK token:", error)
    return NextResponse.json({ error: "Failed to generate access token" }, { status: 500 })
  }
}
