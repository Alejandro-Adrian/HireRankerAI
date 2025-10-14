import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { meetingId, peerId, peerType, signalType, signalData } = await request.json()

    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    // Store signaling data
    const { error } = await supabase.from("webrtc_signaling").insert({
      meeting_id: meetingId,
      peer_id: peerId,
      peer_type: peerType,
      signal_type: signalType,
      signal_data: signalData,
    })

    if (error) {
      console.error("Error storing signaling data:", error)
      return NextResponse.json({ error: "Failed to store signaling data" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in signaling POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const meetingId = searchParams.get("meetingId")
    const peerId = searchParams.get("peerId")
    const signalType = searchParams.get("signalType")

    if (!meetingId || !peerId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    // Get signaling data for other peers
    let query = supabase
      .from("webrtc_signaling")
      .select("*")
      .eq("meeting_id", meetingId)
      .neq("peer_id", peerId)
      .eq("consumed", false)
      .order("created_at", { ascending: true })

    if (signalType) {
      query = query.eq("signal_type", signalType)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching signaling data:", error)
      return NextResponse.json({ error: "Failed to fetch signaling data" }, { status: 500 })
    }

    return NextResponse.json({ signals: data || [] })
  } catch (error) {
    console.error("Error in signaling GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { signalIds } = await request.json()

    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    // Mark signals as consumed
    const { error } = await supabase.from("webrtc_signaling").update({ consumed: true }).in("id", signalIds)

    if (error) {
      console.error("Error marking signals as consumed:", error)
      return NextResponse.json({ error: "Failed to update signals" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in signaling PATCH:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
