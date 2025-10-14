import { type NextRequest, NextResponse } from "next/server"
import { findUserByEmail } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await findUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      email: user.email,
      isVerified: user.is_verified,
      message: user.is_verified ? "Email is verified" : "Email is not verified",
    })
  } catch (error) {
    console.error("Check verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
