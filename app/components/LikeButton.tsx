"use client";

import { useState, useTransition } from "react";
import { toggleRoutineLikeAction } from "@/lib/actions/routines";

export function LikeButton({
  routineId,
  initialLiked,
  initialCount,
}: {
  routineId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        const nextLiked = !liked;
        setLiked(nextLiked);
        setCount((c) => c + (nextLiked ? 1 : -1));
        startTransition(async () => {
          const result = await toggleRoutineLikeAction(routineId);
          setLiked(result.liked);
          setCount(result.likesCount);
        });
      }}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-60 ${
        liked
          ? "border-[#4ade80] bg-[#4ade80]/10 text-[#4ade80]"
          : "border-[#2a2f37] text-[#9099a3] hover:border-[#4ade80] hover:text-[#4ade80]"
      }`}
    >
      <span>{liked ? "♥" : "♡"}</span>
      {count}
    </button>
  );
}
