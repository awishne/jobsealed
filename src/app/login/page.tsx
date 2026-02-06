"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProWaitlistDialog } from "@/components/marketing/ProWaitlistDialog";
import { requestMagicLink } from "./actions";

const ENABLE_SIGNUPS = process.env.NEXT_PUBLIC_ENABLE_SIGNUPS === "true";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<string | null>(null);
    const [inviteOnly, setInviteOnly] = useState(false);
    const [loading, setLoading] = useState(false);

    async function sendLink() {
        setLoading(true);
        setStatus(null);
        setInviteOnly(false);

        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const result = await requestMagicLink(email, origin);

        setLoading(false);

        if (result.success) {
            setStatus("Check your email for a magic link.");
        } else if (result.error.code === "invite_only") {
            setInviteOnly(true);
        } else {
            setStatus(result.error.message);
        }
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-md px-6 py-16">
                <h1 className="text-3xl font-semibold tracking-tight">Login</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    We’ll email you a magic link. No password.
                </p>

                <div className="mt-8 space-y-4">
                    {inviteOnly ? (
                        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/60 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold tracking-tight text-amber-900">
                                You found us early 👋
                            </h2>
                            <p className="mt-2 text-sm text-amber-900/90">
                                JobSealed is currently invite-only while we polish the experience. Join Early Access and we’ll email you as soon as spots open.
                            </p>
                            <p className="mt-1 text-xs text-amber-800/70">
                                Takes 10 seconds. No spam.
                            </p>
                            <div className="mt-5">
                                <ProWaitlistDialog
                                    title="Join Early Access"
                                    triggerLabel="Join Early Access"
                                    buttonClassName="w-full"
                                    source="login"
                                />
                            </div>
                            <div className="mt-5 pt-4 border-t border-amber-200/80">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <Input
                                        type="email"
                                        placeholder="you@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-9 text-sm bg-white/80 border-amber-200/80 flex-1"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={sendLink}
                                        disabled={!email || loading}
                                        className="text-amber-900/90 hover:text-amber-900 hover:bg-amber-100/60 shrink-0"
                                    >
                                        {loading ? "Sending…" : "Have an invite? Send magic link"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
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
                        </>
                    )}

                    {ENABLE_SIGNUPS && (
                        <p className="text-center text-sm text-muted-foreground">
                            Don&apos;t have an account?{" "}
                            <Link href="/signup" className="font-medium text-foreground underline underline-offset-4 hover:no-underline">
                                Sign up
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}
