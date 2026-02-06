"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProWaitlistDialog } from "@/components/marketing/ProWaitlistDialog";

const ENABLE_SIGNUPS = process.env.NEXT_PUBLIC_ENABLE_SIGNUPS === "true";

export default function SignupPage() {
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

  if (!ENABLE_SIGNUPS) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-md px-6 py-16">
          <Card>
            <CardHeader>
              <CardTitle>Private beta</CardTitle>
              <CardDescription>
                We&apos;re currently invite-only. Join the waitlist to get access.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <ProWaitlistDialog
                title="Join Early Access"
                triggerLabel="Join Early Access"
                buttonClassName="w-full"
              />
            </CardFooter>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Sign up</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ll email you a magic link. No password.
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

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
