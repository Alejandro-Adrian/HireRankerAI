import type { NextRequest } from "next/server"
import { connections, pendingMessages } from "@/lib/connection-manager"

// Cleanup old connections every 30 seconds
setInterval(() => {
  const now = Date.now()
  const timeout = 60000 // 1 minute timeout

  for (const [key, connection] of connections.entries()) {
    if (now - connection.lastSeen > timeout) {
      console.log("[v0] Cleaning up stale connection:", key)
      try {
        connection.controller.close()
      } catch (error) {
        // Connection already closed
      }
      connections.delete(key)
    }
  }
}, 30000)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const meetingId = searchParams.get("meetingId")
  const peerId = searchParams.get("peerId")
  const isHost = searchParams.get("isHost") === "true"

  if (!meetingId || !peerId) {
    return new Response("Missing meetingId or peerId", { status: 400 })
  }

  console.log("[v0] SSE connection request:", { meetingId, peerId, isHost })

  const stream = new ReadableStream({
    start(controller) {
      // Store connection
      const connectionKey = `${meetingId}-${peerId}`
      connections.set(connectionKey, {
        controller,
        peerId,
        isHost,
        lastSeen: Date.now(),
      })

      console.log("[v0] SSE connection established for:", connectionKey)

      // Send initial connection message
      const initMessage = JSON.stringify({
        type: "connected",
        peerId,
        timestamp: new Date().toISOString(),
      })

      try {
        controller.enqueue(`data: ${initMessage}\n\n`)
      } catch (error) {
        console.error("[v0] Error sending init message:", error)
      }

      // Send any pending messages
      const pending = pendingMessages.get(meetingId) || []
      for (const message of pending) {
        if (message.toPeerId === peerId || !message.toPeerId) {
          try {
            controller.enqueue(`data: ${JSON.stringify(message)}\n\n`)
          } catch (error) {
            console.error("[v0] Error sending pending message:", error)
          }
        }
      }

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          const connection = connections.get(connectionKey)
          if (connection) {
            connection.lastSeen = Date.now()
            controller.enqueue(`data: ${JSON.stringify({ type: "heartbeat", timestamp: Date.now() })}\n\n`)
          } else {
            clearInterval(heartbeat)
          }
        } catch (error) {
          console.error("[v0] Heartbeat error:", error)
          clearInterval(heartbeat)
          connections.delete(connectionKey)
        }
      }, 15000) // Every 15 seconds

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        console.log("[v0] SSE connection closed:", connectionKey)
        clearInterval(heartbeat)
        connections.delete(connectionKey)
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  })
}
