import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

async function getSupabaseClient() {
  try {
    const client = await createClient()
    return client
  } catch (error) {
    console.error("[v0] Failed to get Supabase client:", error)
    throw new Error("Database connection failed")
  }
}

export async function createUser(
  email: string,
  password: string,
  firstname: string,
  lastname: string,
  company_name?: string,
) {
  try {
    const supabase = await getSupabaseClient()
    const hashedPassword = await hashPassword(password)

    const { data, error } = await supabase
      .from("users")
      .insert({
        email,
        password_hash: hashedPassword,
        firstname,
        lastname,
        company_name: company_name || null,
        is_verified: false,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Database error creating user:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("[v0] Error in createUser:", error)
    throw error
  }
}

export async function findUserByEmail(email: string) {
  try {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

    if (error && error.code !== "PGRST116") {
      console.error("[v0] Database error finding user:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("[v0] Error in findUserByEmail:", error)
    throw error
  }
}

export async function getUserByEmail(email: string) {
  return findUserByEmail(email)
}

export async function updateUser(email: string, updates: any) {
  try {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase.from("users").update(updates).eq("email", email).select().single()

    if (error) {
      console.error("[v0] Database error updating user:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("[v0] Error in updateUser:", error)
    throw error
  }
}

export async function deleteUser(email: string) {
  try {
    const supabase = await getSupabaseClient()
    const { error } = await supabase.from("users").delete().eq("email", email)

    if (error) {
      console.error("[v0] Database error deleting user:", error)
      throw error
    }
    return true
  } catch (error) {
    console.error("[v0] Error in deleteUser:", error)
    throw error
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function storeVerificationCode(email: string, code: string, type: string) {
  try {
    const supabase = await getSupabaseClient()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    if (type === "verification") {
      const { data, error } = await supabase
        .from("users")
        .update({
          verification_code: code,
          verification_expires_at: expiresAt.toISOString(),
        })
        .eq("email", email)
        .select()
        .single()

      if (error) {
        console.error("[v0] Database error storing verification code:", error)
        throw error
      }
      return data
    } else if (type === "reset") {
      const { data, error } = await supabase
        .from("users")
        .update({
          reset_code: code,
          reset_expires_at: expiresAt.toISOString(),
        })
        .eq("email", email)
        .select()
        .single()

      if (error) {
        console.error("[v0] Database error storing reset code:", error)
        throw error
      }
      return data
    }

    throw new Error("Invalid verification code type")
  } catch (error) {
    console.error("[v0] Error in storeVerificationCode:", error)
    throw error
  }
}

export async function verifyCode(email: string, code: string, type: string) {
  try {
    const supabase = await getSupabaseClient()

    if (type === "verification") {
      const { data, error } = await supabase
        .from("users")
        .select("verification_code, verification_expires_at")
        .eq("email", email)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("[v0] Database error verifying code:", error)
        throw error
      }

      if (
        data &&
        data.verification_code === code &&
        data.verification_expires_at &&
        new Date(data.verification_expires_at) > new Date()
      ) {
        await supabase
          .from("users")
          .update({
            verification_code: null,
            verification_expires_at: null,
          })
          .eq("email", email)

        return true
      }
    } else if (type === "reset") {
      const { data, error } = await supabase
        .from("users")
        .select("reset_code, reset_expires_at")
        .eq("email", email)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("[v0] Database error verifying reset code:", error)
        throw error
      }

      if (data && data.reset_code === code && data.reset_expires_at && new Date(data.reset_expires_at) > new Date()) {
        return true
      }
    }

    return false
  } catch (error) {
    console.error("[v0] Error in verifyCode:", error)
    throw error
  }
}

export async function checkCodeValid(email: string, code: string, type: string) {
  try {
    const supabase = await getSupabaseClient()

    if (type === "verification") {
      const { data, error } = await supabase
        .from("users")
        .select("verification_code, verification_expires_at")
        .eq("email", email)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("[v0] Database error checking verification code:", error)
        throw error
      }

      return !!(
        data &&
        data.verification_code === code &&
        data.verification_expires_at &&
        new Date(data.verification_expires_at) > new Date()
      )
    } else if (type === "reset") {
      const { data, error } = await supabase
        .from("users")
        .select("reset_code, reset_expires_at")
        .eq("email", email)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("[v0] Database error checking reset code:", error)
        throw error
      }

      return !!(
        data &&
        data.reset_code === code &&
        data.reset_expires_at &&
        new Date(data.reset_expires_at) > new Date()
      )
    }

    return false
  } catch (error) {
    console.error("[v0] Error in checkCodeValid:", error)
    throw error
  }
}
