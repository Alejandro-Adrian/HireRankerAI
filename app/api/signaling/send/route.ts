import { type NextRequest, NextResponse } from "next/server"
import { connections, pendingMessages, broadcastToMeeting } from "@/lib/connection-manager"

export async function POST(request: NextRequest) {
  try {
    const { meetingId, fromPeerId, signalType, signalData, isHost, toPeerId } = await request.json()

    if (!meetingId || !fromPeerId || !signalType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Received signal to broadcast:", { meetingId, fromPeerId, signalType, toPeerId })

    const message = {
      type: "signal",
      signalType,
      meetingId,
      fromPeerId,
      signalData,
      timestamp: new Date().toISOString(),
    }

    let delivered = 0

    if (toPeerId) {
      // Send to specific peer
      const targetConnectionKey = `${meetingId}-${toPeerId}`
      const targetConnection = connections.get(targetConnectionKey)

      if (targetConnection) {
        try {
          const messageData = `data: ${JSON.stringify(message)}\n\n`
          targetConnection.controller.enqueue(messageData)
          targetConnection.lastSeen = Date.now()
          delivered = 1
          console.log("[v0] Message delivered to target peer:", targetConnectionKey)
        } catch (error) {
          console.error("[v0] Error delivering message to target peer:", error)
          connections.delete(targetConnectionKey)
        }
      } else {
        console.log("[v0] Target peer not found, storing as pending message")
      }
    } else {
      // Broadcast to all peers in meeting (excluding sender)
      delivered = broadcastToMeeting(meetingId, message, fromPeerId)
    }

    // Store message for offline peers
    if (!pendingMessages.has(meetingId)) {
      pendingMessages.set(meetingId, [])
    }

    const pending = pendingMessages.get(meetingId)!
    pending.push({ ...message, toPeerId })

    // Keep only last 50 messages per meeting
    if (pending.length > 50) {
      pending.splice(0, pending.length - 50)
    }

    console.log("[v0] Signal broadcast complete. Delivered to:", delivered, "connections")

    return NextResponse.json({
      success: true,
      delivered,
    })
  } catch (error) {
    console.error("[v0] Error processing signal:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
