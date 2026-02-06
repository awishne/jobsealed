import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { HeaderSignupCta } from "@/components/nav/HeaderSignupCta";

interface SiteHeaderProps {
  variant?: "default" | "home";
}

export async function SiteHeader({ variant = "default" }: SiteHeaderProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
        {variant === "home" ? (
          <div className="w-0" />
        ) : (
          <Link href="/" className="text-xl font-semibold tracking-tight sm:text-2xl">
            JobSealed
          </Link>
        )}
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/pricing">Pricing</Link>
          </Button>
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/profile">Profile</Link>
              </Button>
              <LogoutButton />
            </>
          ) : (
            <>
              <HeaderSignupCta enableSignups={process.env.NEXT_PUBLIC_ENABLE_SIGNUPS === "true"} />
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
