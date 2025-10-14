import { type NextRequest, NextResponse } from "next/server"
import { findUserByEmail } from "@/lib/storage"
import { verifyAuthToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userPayload = await verifyAuthToken(token)
    if (!userPayload) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    const user = await findUserByEmail(userPayload.email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        name: `${user.firstname || ""} ${user.lastname || ""}`.trim(),
        email: user.email,
        bio: user.bio || "",
        company_name: user.company_name || "",
      },
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
