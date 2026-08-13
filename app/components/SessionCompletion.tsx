"use client";

import { createContext, useContext, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Player, type PlayerRef } from "@remotion/player";
import { SessionCompleteComposition } from "@/app/components/SessionCompleteComposition";

const FPS = 30;
const DURATION_IN_FRAMES = 90;

type CompletionResult = { error: string } | { ok: true };

type Ctx = {
  markSetDone: (key: string) => void;
  markSetUndone: (key: string) => void;
  requestComplete: () => void;
  error: string | null;
};

const SessionCompletionContext = createContext<Ctx | null>(null);

export function useSessionCompletion() {
  return useContext(SessionCompletionContext);
}

export function SessionCompletionProvider({
  sessionId,
  routineName,
  totalSets,
  initialDoneKeys,
  alreadyCompleted,
  action,
  children,
}: {
  sessionId: string;
  routineName: string;
  totalSets: number;
  initialDoneKeys: string[];
  alreadyCompleted: boolean;
  action: (sessionId: string) => Promise<CompletionResult>;
  children: ReactNode;
}) {
  const router = useRouter();
  const doneKeysRef = useRef(new Set(initialDoneKeys));
  const animationDoneRef = useRef(false);
  const resultRef = useRef<CompletionResult | null>(null);
  const playerRef = useRef<PlayerRef>(null);

  const [celebrating, setCelebrating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !celebrating) return;
    const finish = () => {
      animationDoneRef.current = true;
      settle();
    };
    player.addEventListener("ended", finish);
    return () => player.removeEventListener("ended", finish);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrating]);

  function settle() {
    if (!animationDoneRef.current) return;
    const result = resultRef.current;
    if (!result) return;
    if ("error" in result) {
      setCelebrating(false);
      setError(result.error);
      return;
    }
    startTransition(() => {
      router.refresh();
      setCelebrating(false);
    });
  }

  function requestComplete() {
    if (celebrating) return;
    setError(null);
    animationDoneRef.current = false;
    resultRef.current = null;
    setStats(`${doneKeysRef.current.size}/${totalSets} sets`);
    setCelebrating(true);
    action(sessionId).then((result) => {
      resultRef.current = result;
      settle();
    });
  }

  function markSetDone(key: string) {
    if (doneKeysRef.current.has(key)) return;
    doneKeysRef.current.add(key);
    if (!alreadyCompleted && !celebrating && totalSets > 0 && doneKeysRef.current.size >= totalSets) {
      requestComplete();
    }
  }

  function markSetUndone(key: string) {
    doneKeysRef.current.delete(key);
  }

  return (
    <SessionCompletionContext.Provider
      value={{ markSetDone, markSetUndone, requestComplete, error }}
    >
      {children}
      {celebrating &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d0f12]">
            <Player
              ref={playerRef}
              component={SessionCompleteComposition}
              inputProps={{ label: routineName, stats }}
              durationInFrames={DURATION_IN_FRAMES}
              fps={FPS}
              compositionWidth={1080}
              compositionHeight={1920}
              style={{ width: "100%", height: "100%" }}
              autoPlay
              initiallyMuted
              controls={false}
              clickToPlay={false}
              showVolumeControls={false}
              allowFullscreen={false}
              acknowledgeRemotionLicense
            />
          </div>,
          document.body,
        )}
    </SessionCompletionContext.Provider>
  );
}
