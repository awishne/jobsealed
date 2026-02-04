import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name) {
                    return request.cookies.get(name)?.value;
                },
                set(name, value, options) {
                    response.cookies.set({ name, value, ...options });
                },
                remove(name, options) {
                    response.cookies.set({ name, value: "", ...options });
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Protect these routes using prefix-based checks
    // This ensures ALL nested routes are protected (e.g., /jobs/new, /jobs/123, etc.)
    const PROTECTED_PREFIXES = ["/dashboard", "/jobs", "/profile", "/seal", "/test-upload"];
    const isProtected = PROTECTED_PREFIXES.some(
        (p) => pathname === p || pathname.startsWith(p + "/")
    );

    if (!user && isProtected) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // Keep logged-in users out of /login
    if (user && pathname === "/login") {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    return response;
}

export const config = {
    matcher: [
      "/dashboard",
      "/dashboard/:path*",
      "/jobs",
      "/jobs/:path*",
      "/seal",
      "/seal/:path*",
      "/test-upload",
      "/profile",
      "/profile/:path*",
      "/login",
    ],
  };
  
  

