"use client";

import { useState } from "react";
import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { AssistantUIMessage } from "@/lib/agents/assistant-agent";
import { createRoutineAction, type FormActionResult } from "@/lib/actions/routines";

type ProposeRoutinePart = Extract<AssistantUIMessage["parts"][number], { type: "tool-proposeRoutine" }>;
type ProposeRoutineOutputPart = Extract<ProposeRoutinePart, { state: "output-available" }>;

function RoutineProposalCard({ part }: { part: ProposeRoutineOutputPart }) {
  const proposal = part.output;
  const [state, setState] = useState<
    { status: "idle" } | { status: "saving" } | { status: "error"; message: string } | { status: "done"; id: string }
  >({ status: "idle" });

  async function handleCreate() {
    setState({ status: "saving" });
    const result: FormActionResult = await createRoutineAction({
      name: proposal.name,
      description: proposal.description ?? null,
      scheduledDays: proposal.scheduledDays ?? [],
      blocks: proposal.blocks.map((block) => ({
        type: block.type,
        exercises: block.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          plannedSets: ex.plannedSets,
          targetRepsMin: ex.targetRepsMin ?? null,
          targetRepsMax: ex.targetRepsMax ?? null,
          targetWeight: ex.targetWeight ?? null,
        })),
      })),
    });
    if ("error" in result) {
      setState({ status: "error", message: result.error });
    } else {
      setState({ status: "done", id: result.id });
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5">
      <div>
        <p className="text-base font-bold text-[#f1f3f4]">{proposal.name}</p>
        {proposal.description && <p className="mt-1 text-sm text-[#9099a3]">{proposal.description}</p>}
      </div>

      <div className="flex flex-col gap-2">
        {proposal.blocks.map((block, i) => (
          <div key={i} className="rounded-xl border border-[#2a2f37] bg-[#15181d] p-3 text-sm">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#4ade80]">
              {block.type === "single" ? "Ejercicio suelto" : block.type === "bi_series" ? "Bi-serie" : "Tri-serie"}
            </p>
            {block.exercises.map((ex, j) => (
              <p key={j} className="text-[#f1f3f4]">
                {ex.exerciseName} — {ex.plannedSets}x
                {ex.targetRepsMin && ex.targetRepsMax
                  ? `${ex.targetRepsMin}-${ex.targetRepsMax}`
                  : ex.targetRepsMin ?? "?"}
              </p>
            ))}
          </div>
        ))}
      </div>

      {state.status === "done" ? (
        <Link
          href={`/app/rutinas/${state.id}`}
          className="w-full rounded-[10px] bg-[#22c55e] px-4 py-2 text-center text-sm font-bold text-[#08150d]"
        >
          Ver rutina creada
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleCreate}
          disabled={state.status === "saving"}
          className="w-full rounded-[10px] bg-[#22c55e] px-4 py-2 text-sm font-bold text-[#08150d] transition-opacity disabled:opacity-60"
        >
          {state.status === "saving" ? "Creando…" : "Crear esta rutina"}
        </button>
      )}
      {state.status === "error" && <p className="text-sm text-red-400">{state.message}</p>}
    </div>
  );
}

export function AsistenteChat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat<AssistantUIMessage>({
    transport: new DefaultChatTransport({ api: "/api/assistant" }),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {messages.length === 0 && (
          <p className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] px-6 py-8 text-center text-[#9099a3]">
            Cuéntame tu objetivo (ej. &quot;quiero una rutina de 3 días para espalda y bíceps con mancuernas&quot;) y
            te propongo una rutina.
          </p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.role === "user" ? "ml-auto max-w-[85%]" : "mr-auto max-w-[85%]"}
          >
            {message.parts.map((part, i) => {
              if (part.type === "text") {
                return (
                  <div
                    key={i}
                    className={
                      message.role === "user"
                        ? "rounded-2xl bg-[#22c55e] px-4 py-2 text-sm font-medium text-[#08150d]"
                        : "rounded-2xl border border-[#2a2f37] bg-[#1c2026] px-4 py-2 text-sm text-[#f1f3f4]"
                    }
                  >
                    {part.text}
                  </div>
                );
              }
              if (part.type === "tool-searchExercises" && part.state !== "output-available") {
                return (
                  <p key={i} className="px-1 text-xs text-[#9099a3]">
                    🔎 Buscando ejercicios…
                  </p>
                );
              }
              if (part.type === "tool-proposeRoutine" && part.state === "output-available") {
                return <RoutineProposalCard key={i} part={part} />;
              }
              return null;
            })}
          </div>
        ))}
        {(status === "submitted" || status === "streaming") && (
          <p className="mr-auto text-xs text-[#9099a3]">El asistente está escribiendo…</p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          sendMessage({ text: input });
          setInput("");
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={status !== "ready"}
          placeholder="Ej: rutina de 3 días, piernas y espalda, con mancuernas"
          className="flex-1 rounded-[10px] border border-[#2a2f37] bg-[#15181d] px-4 py-2 text-sm text-[#f1f3f4] outline-none focus:border-[#4ade80]"
        />
        <button
          type="submit"
          disabled={status !== "ready"}
          className="rounded-[10px] bg-[#22c55e] px-4 py-2 text-sm font-bold text-[#08150d] disabled:opacity-60"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
