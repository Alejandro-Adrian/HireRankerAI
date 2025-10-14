import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export interface UserPayload {
  id: string
  email: string
  verified: boolean
}

// Simple base64url encoding/decoding functions
function base64urlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

function base64urlDecode(str: string): string {
  // Add padding if needed
  str += "=".repeat((4 - (str.length % 4)) % 4)
  return atob(str.replace(/-/g, "+").replace(/_/g, "/"))
}

// Simple JWT implementation using HMAC
async function createHmacSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ])

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data))
  return base64urlEncode(String.fromCharCode(...new Uint8Array(signature)))
}

async function verifyHmacSignature(data: string, signature: string, secret: string): Promise<boolean> {
  const expectedSignature = await createHmacSignature(data, secret)
  return expectedSignature === signature
}

export async function createAuthToken(user: UserPayload): Promise<string> {
  const header = {
    alg: "HS256",
    typ: "JWT",
  }

  const payload = {
    ...user,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  }

  const encodedHeader = base64urlEncode(JSON.stringify(header))
  const encodedPayload = base64urlEncode(JSON.stringify(payload))
  const data = `${encodedHeader}.${encodedPayload}`

  const signature = await createHmacSignature(data, JWT_SECRET)

  return `${data}.${signature}`
}

export async function verifyAuthToken(token: string): Promise<UserPayload | null> {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) {
      return null
    }

    const [encodedHeader, encodedPayload, signature] = parts
    const data = `${encodedHeader}.${encodedPayload}`

    // Verify signature
    const isValid = await verifyHmacSignature(data, signature, JWT_SECRET)
    if (!isValid) {
      return null
    }

    // Decode and validate payload
    const payload = JSON.parse(base64urlDecode(encodedPayload))

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return {
      id: payload.id,
      email: payload.email,
      verified: payload.verified,
    }
  } catch {
    return null
  }
}

export async function getAuthUser(): Promise<UserPayload | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    return await verifyAuthToken(token)
  } catch {
    return null
  }
}

export function setAuthCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export function clearAuthCookie() {
  const cookieStore = cookies()
  cookieStore.delete("auth-token")
}
