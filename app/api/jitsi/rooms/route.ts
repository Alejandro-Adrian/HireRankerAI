import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { meetingId, isHost } = await request.json()

    if (!meetingId) {
      return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 })
    }

    const jitsiApiKey = "vpaas-magic-cookie-393c80097c644f049995136e9fd279d3"
    const roomName = `interview-meeting-${meetingId}`
    const jitsiDomain = "8x8.vc"

    const roomUrl = `https://${jitsiDomain}/${jitsiApiKey}/${roomName}`

    return NextResponse.json({
      success: true,
      roomUrl,
      roomName,
      isHost,
      meetingId,
    })
  } catch (error) {
    console.error("Error creating Jitsi room:", error)
    return NextResponse.json({ error: "Failed to create Jitsi room" }, { status: 500 })
  }
}
