import { NextRequest, NextResponse } from "next/server"

const ASSEMBLY_API_KEY = process.env.ASSEMBLYAI_API_KEY || "7ecd9aaf0ef84f7492ccfbdf715e0065"
const ASSEMBLY_API_URL = "https://api.assemblyai.com/v2"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioBlob = formData.get("audio") as Blob
    const sessionId = formData.get("sessionId") as string

    if (!audioBlob || !sessionId) {
      return NextResponse.json({ error: "Missing audio or sessionId" }, { status: 400 })
    }

    console.log("[v0] Processing audio chunk, size:", audioBlob.size)

    const arrayBuffer = await audioBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Step 1: Upload audio to AssemblyAI
    const uploadResponse = await fetch(`${ASSEMBLY_API_URL}/upload`, {
      method: "POST",
      headers: {
        "Authorization": ASSEMBLY_API_KEY,
      },
      body: buffer,
    })

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text()
      console.error("[v0] Upload failed:", uploadResponse.status, error)
      return NextResponse.json({ error: "Upload failed" }, { status: uploadResponse.status })
    }

    const uploadData = await uploadResponse.json()
    const audioUrl = uploadData.upload_url

    console.log("[v0] Audio uploaded, URL:", audioUrl.substring(0, 50) + "...")

    // Step 2: Submit for transcription
    const transcriptResponse = await fetch(`${ASSEMBLY_API_URL}/transcript`, {
      method: "POST",
      headers: {
        "Authorization": ASSEMBLY_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        language_code: "en",
        punctuate: true,
        format_text: true,
      }),
    })

    if (!transcriptResponse.ok) {
      const error = await transcriptResponse.text()
      console.error("[v0] Transcription submit failed:", transcriptResponse.status, error)
      return NextResponse.json({ error: "Transcription submit failed" }, { status: transcriptResponse.status })
    }

    const transcriptData = await transcriptResponse.json()
    const transcriptionId = transcriptData.id

    console.log("[v0] Transcription job submitted:", transcriptionId)

    return NextResponse.json({
      transcriptionId,
      message: "Transcription submitted successfully",
    })
  } catch (error) {
    console.error("[v0] Live stream error:", error)
    return NextResponse.json(
      { error: `Failed: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    )
  }
}
