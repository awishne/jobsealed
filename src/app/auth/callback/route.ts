import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const origin = url.origin;

    const response = NextResponse.redirect(`${origin}/dashboard`);

    if (code) {
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

        await supabase.auth.exchangeCodeForSession(code);
    }

    return response;
}
