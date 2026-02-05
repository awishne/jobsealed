"use client";

import { useCallback, useRef, useState } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_RECORDING_MS = 3 * 60 * 1000; // 3 minutes

function formatTimer(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function canUseMediaRecorder(): boolean {
  if (typeof window === "undefined") return true;
  return (
    typeof MediaRecorder !== "undefined" &&
    MediaRecorder.isTypeSupported("audio/webm")
  );
}

export interface VoiceInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
  /** When true, render only the button (no timer, no error) for use inside a compact pill. */
  compact?: boolean;
  /** Optional class for the button when compact (e.g. pill styling). */
  buttonClassName?: string;
}

export function VoiceInput({
  onTranscription,
  disabled = false,
  compact = false,
  buttonClassName,
}: VoiceInputProps) {
  const [state, setState] = useState<"idle" | "recording" | "processing">("idle");
  const [error, setError] = useState<string | null>(null);
  const [timerMs, setTimerMs] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const submitChunks = useCallback(
    async (recorder: MediaRecorder) => {
      const chunks = chunksRef.current;
      if (chunks.length === 0) {
        setError("No audio recorded");
        setState("idle");
        return;
      }
      const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
      const formData = new FormData();
      formData.append("file", blob, "recording.webm");
      try {
        const res = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const msg =
            data?.error ?? (res.status === 401 ? "Please sign in" : "Transcription failed");
          setError(msg);
          setState("idle");
          return;
        }
        const data = (await res.json()) as { text?: string };
        const text = typeof data?.text === "string" ? data.text.trim() : "";
        if (text) onTranscription(text);
        setError(null);
      } catch {
        setError("Upload or transcription failed");
      } finally {
        setState("idle");
      }
    },
    [onTranscription]
  );

  const startRecording = useCallback(async () => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Microphone not supported");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setState("processing");
        void submitChunks(recorder);
      };

      recorder.start();
      setState("recording");
      setTimerMs(0);
      timerIntervalRef.current = setInterval(() => {
        setTimerMs((prev) => {
          const next = prev + 1000;
          if (next >= MAX_RECORDING_MS) {
            stopTimer();
            if (mediaRecorderRef.current?.state === "recording") {
              mediaRecorderRef.current.stop();
            }
            return MAX_RECORDING_MS;
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.toLowerCase().includes("permission") || message.toLowerCase().includes("denied")) {
        setError("Microphone permission denied");
      } else {
        setError("Could not access microphone");
      }
    }
  }, [stopTimer, submitChunks]);

  const stopRecording = useCallback(() => {
    stopTimer();
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") {
      setState("idle");
      return;
    }
    recorder.stop();
  }, [stopTimer]);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";
      setState("processing");
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data?.error ?? "Transcription failed");
          setState("idle");
          return;
        }
        const data = (await res.json()) as { text?: string };
        const text = typeof data?.text === "string" ? data.text.trim() : "";
        if (text) onTranscription(text);
      } catch {
        setError("Upload or transcription failed");
      } finally {
        setState("idle");
      }
    },
    [onTranscription]
  );

  const handleIdleClick = useCallback(() => {
    if (canUseMediaRecorder()) {
      void startRecording();
    } else {
      fileInputRef.current?.click();
    }
  }, [startRecording]);

  const isDisabled = disabled || state === "processing";
  const isRecording = state === "recording";

  const idleLabel = "Dictate notes";
  const recordingLabel = "Stop recording";
  const transcribingLabel = "Transcribing…";

  const buttonEl = (
    <div className="relative">
      {isRecording && !compact && (
        <span
          className="absolute inset-0 rounded-full ring-2 ring-destructive/40 animate-pulse"
          aria-hidden
        />
      )}
      <Button
        type="button"
        variant={isRecording ? "destructive" : "secondary"}
        size="icon"
        className={cn(
          "relative shrink-0 touch-manipulation rounded-full",
          compact ? "h-10 w-10 text-muted-foreground hover:bg-muted" : "h-11 w-11 shadow-sm",
          buttonClassName
        )}
        disabled={isDisabled}
        onClick={isRecording ? stopRecording : handleIdleClick}
        title={isRecording ? recordingLabel : state === "processing" ? transcribingLabel : idleLabel}
        aria-label={isRecording ? recordingLabel : state === "processing" ? transcribingLabel : idleLabel}
      >
        {state === "processing" ? (
          <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden />
        ) : isRecording ? (
          <Square className="size-5 shrink-0 fill-current" aria-hidden />
        ) : (
          <Mic className="size-5 shrink-0" aria-hidden />
        )}
      </Button>
    </div>
  );

  if (compact) {
    return (
      <>
        {buttonEl}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          capture="user"
          className="hidden"
          aria-hidden
          tabIndex={-1}
          disabled={isDisabled}
          onChange={handleFileSelect}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        {isRecording && (
          <span
            className="mr-2 rounded-full bg-muted px-2 py-1 text-xs font-mono text-muted-foreground"
            aria-live="polite"
          >
            {formatTimer(timerMs)}
          </span>
        )}
        {buttonEl}
      </div>
      {state === "processing" && (
        <span className="text-xs text-muted-foreground">{transcribingLabel}</span>
      )}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        capture="user"
        className="hidden"
        aria-hidden
        tabIndex={-1}
        disabled={isDisabled}
        onChange={handleFileSelect}
      />
    </div>
  );
}
