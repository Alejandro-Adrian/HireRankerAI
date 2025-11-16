import { type NextRequest, NextResponse } from "next/server"
import { createUser, findUserByEmail } from "@/lib/storage"
import { createAuthToken } from "@/lib/auth"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const ipHash = crypto.createHash("sha256").update(ip + Date.now()).digest("hex").substring(0, 16)

    // Generate guest email using IP hash
    const guestEmail = `guest-${ipHash}@guest.local`

    // Check if guest user already exists for this IP
    const existingUser = await findUserByEmail(guestEmail)

    let user = existingUser
    if (!existingUser) {
      // Create new guest user with no password (empty string for guest users)
      user = await createUser(guestEmail, "", "Guest", "User", "Guest Account")

      // Mark as verified immediately since no email verification needed
      const supabase = await require("@/lib/supabase/server").createClient()
      await supabase.from("users").update({ is_verified: true }).eq("id", user.id)
    }

    // Create auth token for guest user
    const userPayload = {
      id: user.id.toString(),
      email: user.email,
      verified: true,
      isGuest: true, // Flag to indicate guest user
    }

    const token = await createAuthToken(userPayload)

    const response = NextResponse.json({
      message: "Guest access granted",
      user: userPayload,
    })

    // Set the auth cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[v0] Guest user creation error:", error)
    return NextResponse.json({ error: "Failed to create guest access" }, { status: 500 })
  }
}
