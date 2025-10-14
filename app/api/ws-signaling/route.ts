import type { NextRequest } from "next/server"

// WebSocket signaling server for WebRTC
export async function GET(request: NextRequest) {
  // This endpoint will be upgraded to WebSocket by the WebSocket handler
  return new Response("WebSocket endpoint", { status: 426 })
}
