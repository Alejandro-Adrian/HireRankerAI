import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const sessionId = formData.get("sessionId") as string
    const participantRole = formData.get("participantRole") as string
    const participantName = formData.get("participantName") as string

    if (!audioFile || !sessionId || !participantRole) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    console.log(`[v0] Processing ${participantRole} recording for session:`, sessionId)

    // Upload audio to Vercel Blob
    const blob = await put(
      `video-sessions/${sessionId}/${participantRole}-${Date.now()}.${audioFile.name.split('.').pop()}`,
      audioFile,
      { access: "public" }
    )

    console.log(`[v0] ${participantRole} audio uploaded to blob:`, blob.url)

    // Store recording info in database
    const supabase = await createClient()
    const { error: insertError } = await supabase
      .from("video_session_recordings")
      .insert({
        session_id: sessionId,
        participant_role: participantRole,
        participant_name: participantName || null,
        audio_url: blob.url,
        status: 'processing',
      })

    if (insertError) {
      console.error(`[v0] Error storing ${participantRole} recording:`, insertError)
      return NextResponse.json(
        { error: "Failed to store recording", details: insertError.message },
        { status: 500 }
      )
    }

    // Transcribe audio using Deepgram
    console.log(`[v0] Starting Deepgram transcription for ${participantRole}...`)
    
    const audioResponse = await fetch(blob.url)
    const audioBuffer = await audioResponse.arrayBuffer()

    const deepgramResponse = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true&paragraphs=true",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          "Content-Type": audioFile.type,
        },
        body: audioBuffer,
      }
    )

    if (!deepgramResponse.ok) {
      const errorText = await deepgramResponse.text()
      console.error(`[v0] Deepgram error for ${participantRole}:`, errorText)
      return NextResponse.json(
        { error: "Transcription failed", details: errorText },
        { status: 500 }
      )
    }

    const deepgramData = await deepgramResponse.json()
    const transcript =
      deepgramData?.results?.channels?.[0]?.alternatives?.[0]?.paragraphs?.transcript ||
      deepgramData?.results?.channels?.[0]?.alternatives?.[0]?.transcript ||
      ""

    console.log(`[v0] ${participantRole} transcript length:`, transcript.length)

    // Update recording with transcript
    if (transcript) {
      const { error: updateError } = await supabase
        .from("video_session_recordings")
        .update({
          transcript,
          status: 'completed', // Update status to completed
        })
        .eq("session_id", sessionId)
        .eq("participant_role", participantRole)

      if (updateError) {
        console.error(`[v0] Error updating transcript:`, updateError)
      } else {
        console.log(`[v0] ${participantRole} transcript saved to database`)
      }
    }

    return NextResponse.json({
      success: true,
      participantRole,
      transcriptLength: transcript.length,
    })
  } catch (error: any) {
    console.error("[v0] Error processing participant recording:", error)
    return NextResponse.json(
      { error: "Failed to process recording", details: error.message },
      { status: 500 }
    )
  }
}
