"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
    const supabase = createClient();
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function sendLink() {
        setLoading(true);
        setStatus(null);

        const redirectTo =
            typeof window !== "undefined"
                ? `${window.location.origin}/auth/callback`
                : undefined;

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: redirectTo },
        });

        setLoading(false);

        if (error) setStatus(error.message);
        else setStatus("Check your email for a magic link.");
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-md px-6 py-16">
                <h1 className="text-3xl font-semibold tracking-tight">Login</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    We’ll email you a magic link. No password.
                </p>

                <div className="mt-8 space-y-3">
                    <Input
                        type="email"
                        placeholder="you@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button
                        className="w-full"
                        onClick={sendLink}
                        disabled={!email || loading}
                    >
                        {loading ? "Sending…" : "Send magic link"}
                    </Button>

                    {status && (
                        <p className="text-sm text-muted-foreground">{status}</p>
                    )}
                </div>
            </div>
        </main>
    );
}
