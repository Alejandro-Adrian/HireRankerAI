import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("[v0] No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] Recording file received - Name:", file.name, "Size:", file.size, "Type:", file.type)

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Handle cookie errors silently
            }
          },
        },
      }
    )

    const timestamp = Date.now()
    const filename = `recordings/${timestamp}-${Math.random().toString(36).substring(7)}.webm`

    const buffer = await file.arrayBuffer()
    console.log("[v0] Buffer created - Size:", buffer.byteLength)

    const { data, error } = await supabase.storage
      .from("recordings")
      .upload(filename, buffer, {
        contentType: file.type || "audio/webm",
        upsert: false,
      })

    if (error) {
      console.error("[v0] Supabase upload error:", error)
      throw new Error(`Supabase upload failed: ${error.message}`)
    }

    console.log("[v0] Recording uploaded to Supabase Storage:", data.path)

    const { data: publicUrlData } = supabase.storage
      .from("recordings")
      .getPublicUrl(data.path)

    console.log("[v0] Public URL generated:", publicUrlData.publicUrl)

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      path: data.path,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[v0] Error uploading recording:", errorMessage)
    return NextResponse.json(
      { 
        error: "Failed to upload recording",
        details: errorMessage
      }, 
      { status: 500 }
    )
  }
}
