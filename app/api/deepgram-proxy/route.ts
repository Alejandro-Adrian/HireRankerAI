import { NextRequest, NextResponse } from 'next/server'

let deepgramWs: WebSocket | null = null
let clientConnections: Set<WebSocket> = new Set()

export async function GET(request: NextRequest) {
  // The actual WebSocket proxy is handled by the client-side connection with proper auth
  return NextResponse.json({
    status: 'Deepgram proxy ready',
    endpoint: 'Use /api/deepgram/token to get authenticated token for direct connection'
  })
}

export async function POST(request: NextRequest) {
  try {
    const { action, audio, token } = await request.json()

    if (action === 'connect') {
      const deepgramApiKey = process.env.DEEPGRAM_API_KEY

      if (!deepgramApiKey) {
        return NextResponse.json(
          { error: 'Deepgram API key not configured' },
          { status: 500 }
        )
      }

      // Return a valid connection URL with all required parameters
      return NextResponse.json({
        url: `wss://api.deepgram.com/v1/listen?model=nova-2&encoding=webm&sample_rate=48000&interim_results=true`,
        token: deepgramApiKey,
        success: true
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[v0] Deepgram proxy error:', error)
    return NextResponse.json(
      { error: 'Proxy error' },
      { status: 500 }
    )
  }
}
