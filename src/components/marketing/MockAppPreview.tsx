import { cn } from "@/lib/utils";
import { FileImage, Link2, FileCheck, Sparkles } from "lucide-react";

export function MockAppPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-3xl border bg-background shadow-xl",
        className
      )}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b bg-muted/30 px-3 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
          <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
          <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        </div>
        <span className="text-xs text-muted-foreground">app.jobsealed.com</span>
      </div>

      {/* Sealed report view */}
      <div className="space-y-4 p-4 sm:p-5">
        {/* Title + status badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">Kitchen remodel — Smith</span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
              "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-300"
            )}
          >
            <FileCheck className="h-3 w-3" aria-hidden />
            Sealed
          </span>
        </div>

        {/* Share link row */}
        <div className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2">
          <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate text-xs text-muted-foreground">
            jobsealed.com/r/ed20f5b0…
          </span>
        </div>

        {/* Before / After photo tiles */}
        <div className="grid grid-cols-2 gap-2">
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-lg border p-3",
              "bg-gradient-to-br from-muted/60 to-muted/30 dark:from-muted/40 dark:to-muted/20"
            )}
          >
            <FileImage className="h-5 w-5 text-muted-foreground/60" aria-hidden />
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Before
            </span>
          </div>
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-lg border p-3",
              "bg-gradient-to-br from-muted/50 to-muted/25 dark:from-muted/35 dark:to-muted/15"
            )}
          >
            <FileImage className="h-5 w-5 text-muted-foreground/60" aria-hidden />
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              After
            </span>
          </div>
        </div>

        {/* Notes — Dictate / AI */}
        <div className="rounded-lg border bg-muted/10 px-3 py-2">
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3 w-3" aria-hidden />
            AI-cleaned notes
          </div>
          <p className="text-[10px] italic text-muted-foreground/90">
            Dictated: countertops in backsplash done final sign off…
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Countertops installed. Backsplash complete. Final sign-off pending.
          </p>
        </div>
      </div>
    </div>
  );
}
