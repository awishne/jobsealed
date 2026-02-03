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

    const path = request.nextUrl.pathname;

    // Protect these routes
    const protectedRoutes =
        path.startsWith("/dashboard") ||
        path.startsWith("/jobs") ||
        path.startsWith("/seal") ||
        path.startsWith("/test-upload");

    if (!user && protectedRoutes) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // Keep logged-in users out of /login
    if (user && path === "/login") {
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
      "/login",
    ],
  };
  
  

