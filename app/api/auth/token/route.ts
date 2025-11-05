import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username } = body

    if (!username) {
      return NextResponse.json({ error: "Missing username" }, { status: 400 })
    }

    // Call Flask backend to generate token
    const apiUrl = process.env.FLASK_API_URL || "http://localhost:5000"
    const response = await fetch(`${apiUrl}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    })

    if (!response.ok) {
      throw new Error(`Failed to generate token: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error generating token:", error)
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 })
  }
}
