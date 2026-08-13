"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Player, type PlayerRef } from "@remotion/player";
import { CountdownComposition } from "@/app/components/CountdownComposition";

const FPS = 30;
const SECONDS = 5;
const DURATION_IN_FRAMES = FPS * SECONDS;

export function StartSessionButton({
  routineId,
  routineName,
  action,
  className,
}: {
  routineId: string;
  routineName: string;
  action: (routineId: string) => Promise<{ error: string } | { ok: true; id: string }>;
  className?: string;
}) {
  const router = useRouter();
  const [counting, setCounting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<PlayerRef>(null);
  const resultRef = useRef<{ error: string } | { ok: true; id: string } | null>(null);
  const countdownDoneRef = useRef(false);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !counting) return;

    const finish = () => {
      countdownDoneRef.current = true;
      const result = resultRef.current;
      if (result) applyResult(result);
    };
    player.addEventListener("ended", finish);
    return () => player.removeEventListener("ended", finish);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counting]);

  function applyResult(result: { error: string } | { ok: true; id: string }) {
    if (!countdownDoneRef.current) return;
    if ("error" in result) {
      setCounting(false);
      setError(result.error);
      return;
    }
    router.push(`/app/sesiones/${result.id}`);
  }

  function handleStart() {
    setError(null);
    countdownDoneRef.current = false;
    resultRef.current = null;
    setCounting(true);
    action(routineId).then((result) => {
      resultRef.current = result;
      applyResult(result);
    });
  }

  return (
    <>
      <button type="button" onClick={handleStart} className={className}>
        Empezar entrenamiento
      </button>
      {error && <p className="mt-1 w-full text-xs font-semibold text-red-400">{error}</p>}

      {counting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d0f12]">
          <Player
            ref={playerRef}
            component={CountdownComposition}
            inputProps={{ label: routineName }}
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
        </div>
      )}
    </>
  );
}
