import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

function validateEnvironmentVariables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables:", {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey,
    })
    return null
  }

  if (supabaseUrl.includes("ixqjqjqjqjqjqjqj") || supabaseAnonKey.includes("example")) {
    console.error("Supabase environment variables contain placeholder values")
    return null
  }

  return { supabaseUrl, supabaseAnonKey }
}

function isBuildTime() {
  return process.env.NODE_ENV === "production" && process.env.NEXT_PHASE === "phase-production-build"
}

function getSafeCookieStore() {
  if (isBuildTime()) {
    return {
      getAll: () => [],
      set: () => {},
    }
  }

  try {
    return cookies()
  } catch (error) {
    // During build time or when cookies() is not available
    return {
      getAll: () => [],
      set: () => {},
    }
  }
}

function createMockClient() {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({ data: null, error: { code: "MOCK_CLIENT", message: "Supabase not configured" } }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: () =>
            Promise.resolve({ data: null, error: { code: "MOCK_CLIENT", message: "Supabase not configured" } }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () =>
              Promise.resolve({ data: null, error: { code: "MOCK_CLIENT", message: "Supabase not configured" } }),
          }),
        }),
      }),
      delete: () => ({
        eq: () => ({
          select: () => ({
            single: () =>
              Promise.resolve({ data: null, error: { code: "MOCK_CLIENT", message: "Supabase not configured" } }),
          }),
        }),
      }),
    }),
  } as any
}

export function createClient() {
  if (isBuildTime()) {
    return createMockClient()
  }

  const envVars = validateEnvironmentVariables()

  if (!envVars) {
    return createMockClient()
  }

  const cookieStore = getSafeCookieStore()

  return createServerClient(envVars.supabaseUrl, envVars.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

export function createAdminClient() {
  if (isBuildTime()) {
    return createMockClient()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase admin environment variables:", {
      url: !!supabaseUrl,
      serviceKey: !!supabaseServiceKey,
    })
    return createClient() // Fallback to regular client
  }

  if (supabaseUrl.includes("ixqjqjqjqjqjqjqj") || supabaseServiceKey.includes("example")) {
    console.error("Supabase admin environment variables contain placeholder values")
    return createClient()
  }

  const cookieStore = getSafeCookieStore()

  return createServerClient(supabaseUrl, supabaseServiceKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
