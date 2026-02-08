"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      remove?: (widgetId: string) => void;
      reset?: (widgetId: string) => void;
    };
  }
}

interface ProWaitlistDialogProps {
  title?: string;
  buttonClassName?: string;
  /** Trigger button label. Default "Join Pro waitlist" */
  triggerLabel?: string;
  triggerVariant?: "default" | "ghost" | "link" | "outline" | "secondary" | "destructive";
  triggerSize?: "default" | "sm" | "lg" | "xs" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
  /** Source for analytics (e.g. "pricing", "login", "header") */
  source?: string;
}

type SubmitStatus = "idle" | "loading" | "joined" | "already_joined" | "error";

export function ProWaitlistDialog({
  title = "Join Pro",
  buttonClassName,
  triggerLabel = "Join Pro waitlist",
  triggerVariant = "default",
  triggerSize = "lg",
  source,
}: ProWaitlistDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileScriptLoaded, setTurnstileScriptLoaded] = useState(false);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);

  const UTM_PARAMS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ] as const;

  // Render Turnstile when dialog is open and script is loaded. Use ref for widget id to avoid
  // state-driven re-renders that can prevent the widget from showing after close + reopen.
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !open || !turnstileScriptLoaded || !turnstileContainerRef.current || typeof window === "undefined" || !window.turnstile) return;

    const existingId = turnstileWidgetIdRef.current;
    if (existingId != null) {
      try {
        window.turnstile.remove?.(existingId);
      } catch {
        // ignore
      }
      turnstileWidgetIdRef.current = null;
    }
    turnstileContainerRef.current.innerHTML = "";
    setTurnstileToken("");

    const id = window.turnstile.render(turnstileContainerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token) => setTurnstileToken(token),
      "expired-callback": () => setTurnstileToken(""),
      "error-callback": () => setTurnstileToken(""),
    });
    turnstileWidgetIdRef.current = id;

    return () => {
      const idToRemove = turnstileWidgetIdRef.current;
      if (idToRemove != null) {
        try {
          window.turnstile?.remove?.(idToRemove);
        } catch {
          // ignore
        }
        turnstileWidgetIdRef.current = null;
      }
      if (turnstileContainerRef.current) turnstileContainerRef.current.innerHTML = "";
      setTurnstileToken("");
    };
  }, [open, turnstileScriptLoaded]);

  // When dialog opens, mark script as loaded if Turnstile is already on window (cached/already loaded).
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !open) return;
    if (typeof window !== "undefined" && window.turnstile) {
      setTurnstileScriptLoaded(true);
    }
  }, [open]);

  function buildWaitlistUrl(): string {
    if (typeof window === "undefined") return "/api/waitlist";
    const params = new URLSearchParams(window.location.search);
    const qs = UTM_PARAMS.filter((key) => params.get(key))
      .map((key) => `${key}=${encodeURIComponent(params.get(key) ?? "")}`)
      .join("&");
    return qs ? `/api/waitlist?${qs}` : "/api/waitlist";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setErrorMessage("Please complete the verification.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const url = buildWaitlistUrl();
      const body: { email: string; source?: string; turnstileToken?: string } = {
        email: trimmed,
        source: source ?? undefined,
      };
      if (turnstileToken) body.turnstileToken = turnstileToken;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        status?: "joined" | "already_joined";
        error?: string;
      };

      if (!res.ok) {
        if (res.status === 429) {
          setErrorMessage("Too many attempts. Please try again in a few minutes.");
        } else if (data?.error === "missing_captcha") {
          setErrorMessage("Please complete the verification.");
        } else if (data?.error === "captcha_failed") {
          setErrorMessage("Verification failed. Please try again.");
        } else {
          setErrorMessage(data?.error ?? "Something went wrong. Please try again.");
        }
        setStatus("error");
        return;
      }

      if (data.ok && data.status === "already_joined") {
        setStatus("already_joined");
        setTurnstileToken("");
        return;
      }

      setStatus("joined");
      setTurnstileToken("");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setStatus("idle");
      setErrorMessage("");
      setEmail("");
    }
    setOpen(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className={`w-full sm:w-auto ${buttonClassName ?? ""}`}
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {TURNSTILE_SITE_KEY && (
          <Script
            src={TURNSTILE_SCRIPT}
            strategy="afterInteractive"
            onLoad={() => setTurnstileScriptLoaded(true)}
            onReady={() => setTurnstileScriptLoaded(true)}
          />
        )}
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Pro unlocks voice dictation and Customer-ready notes. Join the waitlist and
            we&apos;ll notify you when it&apos;s available.
          </DialogDescription>
        </DialogHeader>

        {status === "joined" && (
          <p className="text-sm text-foreground">
            You&apos;re on the list — we&apos;ll email you when early access opens.
          </p>
        )}

        {status === "already_joined" && (
          <p className="text-sm text-foreground">You&apos;re already on the list.</p>
        )}

        {(status === "idle" || status === "loading" || status === "error") && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              autoComplete="email"
              required
            />
            {TURNSTILE_SITE_KEY && (
              <div ref={turnstileContainerRef} className="flex justify-center [&_.cf-turnstile]:inline-block" />
            )}
            {status === "error" && errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
            <Button type="submit" className="w-full" disabled={status === "loading"}>
              {status === "loading" ? "Joining…" : "Join waitlist"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
