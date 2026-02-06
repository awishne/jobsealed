"use client";

import { useState } from "react";
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

  const UTM_PARAMS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ] as const;

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

    setStatus("loading");
    setErrorMessage("");

    try {
      const url = buildWaitlistUrl();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source: source ?? undefined }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        status?: "joined" | "already_joined";
        error?: string;
      };

      if (!res.ok) {
        if (res.status === 429) {
          setErrorMessage("Too many attempts. Please try again in a few minutes.");
        } else {
          setErrorMessage(data?.error ?? "Something went wrong. Please try again.");
        }
        setStatus("error");
        return;
      }

      if (data.ok && data.status === "already_joined") {
        setStatus("already_joined");
        return;
      }

      setStatus("joined");
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
