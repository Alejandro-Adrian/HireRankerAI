import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, updateUser } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const { name, email, bio, company_name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Check if user exists
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Split name into firstname and lastname for backward compatibility
    const nameParts = name.trim().split(" ")
    const firstname = nameParts[0] || ""
    const lastname = nameParts.slice(1).join(" ") || ""

    await updateUser(email, {
      firstname,
      lastname,
      company_name: company_name || null,
    })

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
