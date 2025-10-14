export interface Connection {
  controller: ReadableStreamDefaultController
  peerId: string
  isHost: boolean
  lastSeen: number
}

// Shared connection store
export const connections = new Map<string, Connection>()

// Store pending messages for each meeting
export const pendingMessages = new Map<string, any[]>()

// Cleanup old connections every 30 seconds
let cleanupInterval: NodeJS.Timeout | null = null

if (typeof window === "undefined" && process.env.NODE_ENV !== "production") {
  // Only start cleanup in actual runtime, not during build
  if (process.env.NEXT_PHASE !== "phase-production-build") {
    cleanupInterval = setInterval(() => {
      const now = Date.now()
      const timeout = 60000 // 1 minute timeout

      for (const [key, connection] of connections.entries()) {
        if (now - connection.lastSeen > timeout) {
          console.log("Cleaning up stale connection:", key)
          try {
            connection.controller.close()
          } catch (error) {
            // Connection already closed
          }
          connections.delete(key)
        }
      }
    }, 30000)
  }
}

export function broadcastToMeeting(meetingId: string, message: any, excludePeerId?: string) {
  const meetingConnections = Array.from(connections.entries())
    .filter(([key]) => key.startsWith(`${meetingId}-`))
    .filter(([key]) => (excludePeerId ? !key.endsWith(`-${excludePeerId}`) : true))

  console.log("Broadcasting to connections:", meetingConnections.length)

  let delivered = 0

  for (const [connectionKey, connection] of meetingConnections) {
    try {
      const messageData = `data: ${JSON.stringify(message)}\n\n`
      connection.controller.enqueue(messageData)
      connection.lastSeen = Date.now()
      delivered++
      console.log("Message delivered to:", connectionKey)
    } catch (error) {
      console.error("Error delivering message to:", connectionKey, error)
      connections.delete(connectionKey)
    }
  }

  return delivered
}
