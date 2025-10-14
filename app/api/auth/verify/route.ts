import { type NextRequest, NextResponse } from "next/server"
import { findUserByEmail, updateUser, verifyCode } from "@/lib/storage"
import { createAuthToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Email verification request received")

    const { email, code } = await request.json()

    if (!email || !code) {
      console.log("[v0] Missing email or code in request")
      return NextResponse.json({ error: "Email and verification code are required" }, { status: 400 })
    }

    if (typeof email !== "string" || typeof code !== "string") {
      console.log("[v0] Invalid input format - email or code not string")
      return NextResponse.json({ error: "Invalid input format" }, { status: 400 })
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      console.log("[v0] Invalid code format:", code)
      return NextResponse.json({ error: "Verification code must be 6 digits" }, { status: 400 })
    }

    console.log("[v0] Looking up user by email:", email)
    const user = await findUserByEmail(email)
    if (!user) {
      console.log("[v0] User not found for email:", email)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.is_verified) {
      console.log("[v0] User already verified:", email)
      return NextResponse.json({ error: "User is already verified" }, { status: 400 })
    }

    console.log("[v0] Verifying code for user:", email)
    const isValidCode = await verifyCode(email, code, "verification")
    if (!isValidCode) {
      console.log("[v0] Invalid or expired code for user:", email)
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
    }

    console.log("[v0] Updating user verification status:", email)
    const updatedUser = await updateUser(email, { is_verified: true })
    if (!updatedUser) {
      console.log("[v0] Failed to update user:", email)
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    const userPayload = {
      id: updatedUser.id.toString(),
      email: updatedUser.email,
      verified: updatedUser.is_verified,
    }

    const token = await createAuthToken(userPayload)

    const response = NextResponse.json({
      message: "Email verified successfully",
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

    console.log("[v0] Email verification successful for:", email)
    return response
  } catch (error) {
    console.error("[v0] Verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
