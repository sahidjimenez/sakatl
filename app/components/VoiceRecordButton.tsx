"use client";

import { useEffect, useRef, useState } from "react";

type RecordState = "idle" | "recording" | "transcribing" | "error";

function MicIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" />
      <path d="M19 11a7 7 0 0 1-14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className={className}>
      <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  );
}

export function VoiceRecordButton({
  onTranscribed,
  disabled,
  variant = "boxed",
}: {
  onTranscribed: (text: string) => void;
  disabled?: boolean;
  variant?: "boxed" | "plain";
}) {
  const [state, setState] = useState<RecordState>("idle");
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function transcribe(blob: Blob) {
    try {
      const formData = new FormData();
      formData.append("audio", blob, "audio.webm");
      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.text) {
        setError(data.error || "No se entendió el audio. Intenta de nuevo.");
        setState("error");
        return;
      }
      onTranscribed(data.text as string);
      setState("idle");
    } catch {
      setError("Error al transcribir. Intenta de nuevo.");
      setState("error");
    }
  }

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setState("transcribing");
        void transcribe(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setState("recording");
    } catch {
      setError("No se pudo acceder al micrófono. Revisa los permisos del navegador.");
      setState("error");
    }
  }

  function handleClick() {
    if (state === "recording") {
      mediaRecorderRef.current?.stop();
      return;
    }
    void startRecording();
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || state === "transcribing"}
        aria-label={state === "recording" ? "Detener grabación" : "Grabar audio"}
        className={
          variant === "plain"
            ? state === "recording"
              ? "flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white"
              : "flex h-9 w-9 items-center justify-center rounded-full text-[#9099a3] transition-colors hover:text-[#4ade80] disabled:opacity-60"
            : state === "recording"
              ? "flex h-[42px] w-[42px] items-center justify-center rounded-[10px] bg-red-500 text-white"
              : "flex h-[42px] w-[42px] items-center justify-center rounded-[10px] border border-[#2a2f37] bg-[#15181d] text-[#9099a3] transition-colors hover:border-[#4ade80] hover:text-[#4ade80] disabled:opacity-60"
        }
      >
        {state === "transcribing" ? (
          <SpinnerIcon className="h-5 w-5 animate-spin" />
        ) : state === "recording" ? (
          <StopIcon className="h-5 w-5" />
        ) : (
          <MicIcon className="h-5 w-5" />
        )}
      </button>
      {error && (
        <p className="absolute right-0 bottom-full mb-2 w-40 rounded-lg border border-red-500/30 bg-[#1c2026] p-2 text-[11px] text-red-400 shadow-lg">
          {error}
        </p>
      )}
    </div>
  );
}
