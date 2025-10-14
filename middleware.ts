import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

function isBuildTime() {
  return process.env.NODE_ENV === "production" && process.env.NEXT_PHASE === "phase-production-build"
}

export async function middleware(request: NextRequest) {
  if (isBuildTime()) {
    return NextResponse.next({ request })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase not configured, skipping auth middleware")
    return NextResponse.next({ request })
  }

  if (supabaseUrl.includes("ixqjqjqjqjqjqjqj") || supabaseAnonKey.includes("example")) {
    console.error("Supabase environment variables contain placeholder values, skipping auth middleware")
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
  } catch (error) {
    console.warn("Auth check failed in middleware:", error)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.redirect() or
  // NextResponse.rewrite(), you must:
  // 1. Pass the request in it, like so: NextResponse.redirect(new URL('/login', request.url), { request })
  // 2. Copy over the cookies, like so: supabaseResponse.cookies.getAll().forEach((cookie) => myNewResponse.cookies.set(cookie.name, cookie.value))

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/rankings (public ranking APIs)
     * - api/applications (public application APIs)
     * - apply/ (public application pages)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/rankings|api/applications|apply/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
