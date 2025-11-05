import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.VIDEOSDK_API_KEY
    const apiSecret = process.env.VIDEOSDK_SECRET

    if (!apiKey || !apiSecret) {
      console.error("[v0] VideoSDK API key or secret not configured")
      return NextResponse.json({ error: "VideoSDK credentials not configured" }, { status: 500 })
    }

    const createRoomResponse = await fetch("https://api.videosdk.live/v2/rooms", {
      method: "POST",
      headers: {
        authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })

    if (!createRoomResponse.ok) {
      console.error("[v0] Failed to create room:", await createRoomResponse.text())
      throw new Error("Failed to create meeting room")
    }

    const { roomId } = await createRoomResponse.json()

    console.log("[v0] VideoSDK room created successfully:", roomId)

    return NextResponse.json({
      success: true,
      roomId,
    })
  } catch (error) {
    console.error("[v0] Error creating VideoSDK meeting:", error)
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 })
  }
}
