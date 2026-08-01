"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { AssistantUIMessage } from "@/lib/agents/assistant-agent";
import { getGuestAssistantCooldown, markGuestAssistantUsed, saveGuestRoutine } from "@/lib/guest/storage";
import { ExerciseThumb } from "@/app/components/ExerciseThumb";

const CHAT_HISTORY_KEY = "sakatl:guest:assistant-chat-history";
const MAX_HISTORY_MESSAGES = 20;

function trimHistory(messages: AssistantUIMessage[]): AssistantUIMessage[] {
  return messages.length > MAX_HISTORY_MESSAGES
    ? messages.slice(messages.length - MAX_HISTORY_MESSAGES)
    : messages;
}

function loadStoredMessages(): AssistantUIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CHAT_HISTORY_KEY);
    return raw ? trimHistory(JSON.parse(raw) as AssistantUIMessage[]) : [];
  } catch {
    return [];
  }
}

type ProposeRoutinePart = Extract<AssistantUIMessage["parts"][number], { type: "tool-proposeRoutine" }>;
type ProposeRoutineOutputPart = Extract<ProposeRoutinePart, { state: "output-available" }>;

function hasRoutineProposal(messages: AssistantUIMessage[]): boolean {
  return messages.some((m) =>
    m.parts.some((p) => p.type === "tool-proposeRoutine" && p.state === "output-available"),
  );
}

function RoutineProposalCard({ part }: { part: ProposeRoutineOutputPart }) {
  const proposal = part.output;
  const [state, setState] = useState<
    { status: "idle" } | { status: "error"; message: string } | { status: "done"; id: string }
  >({ status: "idle" });

  function handleCreate() {
    const result = saveGuestRoutine({
      name: proposal.name,
      description: proposal.description ?? null,
      scheduledDays: proposal.scheduledDays ?? [],
      blocks: proposal.blocks.map((block) => ({
        type: block.type,
        exercises: block.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          exerciseName: ex.exerciseName,
          exerciseImage: ex.exerciseImage,
          plannedSets: ex.plannedSets,
          targetRepsMin: ex.targetRepsMin ?? null,
          targetRepsMax: ex.targetRepsMax ?? null,
          targetWeight: ex.targetWeight ?? null,
        })),
      })),
    });
    if ("error" in result) setState({ status: "error", message: result.error });
    else setState({ status: "done", id: result.id });
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
              <div key={j} className="flex items-center gap-2.5">
                <ExerciseThumb
                  exerciseId={ex.exerciseId}
                  image={ex.exerciseImage}
                  name={ex.exerciseName}
                  imgClassName="h-9 w-9 rounded-lg object-cover"
                />
                <p className="text-[#f1f3f4]">
                  {ex.exerciseName} — {ex.plannedSets}x
                  {ex.targetRepsMin && ex.targetRepsMax
                    ? `${ex.targetRepsMin}-${ex.targetRepsMax}`
                    : ex.targetRepsMin ?? "?"}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>

      {state.status === "done" ? (
        <Link
          href={`/invitado/rutinas/${state.id}`}
          className="w-full rounded-[10px] bg-[#22c55e] px-4 py-2 text-center text-sm font-bold text-[#08150d]"
        >
          Ver rutina creada
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleCreate}
          className="w-full rounded-[10px] bg-[#22c55e] px-4 py-2 text-sm font-bold text-[#08150d]"
        >
          Crear esta rutina
        </button>
      )}
      {state.status === "error" && <p className="text-sm text-red-400">{state.message}</p>}
    </div>
  );
}

function OptionsButtons({
  options,
  onSelect,
  disabled,
}: {
  options: string[];
  onSelect: (option: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option, i) => (
        <button
          key={i}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(option)}
          className="rounded-full border border-[#2a2f37] bg-[#1c2026] px-4 py-2 text-sm font-semibold text-[#f1f3f4] transition-colors hover:border-[#4ade80] hover:text-[#4ade80] disabled:opacity-60"
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function GuestAsistenteChat() {
  const [input, setInput] = useState("");
  const [initialMessages] = useState(loadStoredMessages);
  const [cooldown, setCooldown] = useState({ locked: false, daysRemaining: 0 });
  const markedRef = useRef(hasRoutineProposal(initialMessages));

  useEffect(() => {
    // El cooldown vive en localStorage: se lee tras montar para no desincronizar
    // el HTML del servidor.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCooldown(getGuestAssistantCooldown());
  }, []);

  const { messages, sendMessage, status, setMessages, error } = useChat<AssistantUIMessage>({
    messages: initialMessages,
    transport: new DefaultChatTransport({ api: "/api/assistant-invitado" }),
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const trimmed = trimHistory(messages);
    if (trimmed.length !== messages.length) {
      setMessages(trimmed);
      return;
    }
    if (trimmed.length > 0) {
      window.localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(trimmed));
    }
  }, [messages, setMessages]);

  useEffect(() => {
    if (markedRef.current) return;
    if (!hasRoutineProposal(messages)) return;
    markedRef.current = true;
    markGuestAssistantUsed();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCooldown(getGuestAssistantCooldown());
  }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const locked = cooldown.locked;

  function handleSend(text: string) {
    if (!text.trim() || status !== "ready" || locked) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="flex flex-col gap-4">
      {locked && (
        <div className="rounded-2xl border border-[#4ade80]/40 bg-[#4ade80]/10 px-5 py-4 text-sm">
          <p className="font-bold text-[#f1f3f4]">Ya usaste tu rutina con IA de esta semana</p>
          <p className="mt-1 text-[#9099a3]">
            Como invitado podés generar 1 rutina con IA por semana. Vuelve en {cooldown.daysRemaining} día
            {cooldown.daysRemaining === 1 ? "" : "s"}, o{" "}
            <Link href="/sign-up" className="font-semibold text-[#4ade80] hover:underline">
              crea una cuenta gratis
            </Link>{" "}
            para chatear sin límites.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {messages.length === 0 && !locked && (
          <p className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] px-6 py-8 text-center text-[#9099a3]">
            Cuéntame tu objetivo (ej. &quot;quiero una rutina de 3 días para espalda y bíceps con
            mancuernas&quot;) y te propongo una rutina. Como invitado tenés 1 rutina con IA por semana.
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
                        ? "rounded-2xl bg-[#22c55e] px-4 py-2 text-sm font-medium whitespace-pre-wrap text-[#08150d]"
                        : "rounded-2xl border border-[#2a2f37] bg-[#1c2026] px-4 py-2 text-sm whitespace-pre-wrap text-[#f1f3f4]"
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
              if (part.type === "tool-presentOptions" && part.state === "output-available") {
                return (
                  <OptionsButtons
                    key={i}
                    options={part.output.options}
                    disabled={status !== "ready" || locked}
                    onSelect={handleSend}
                  />
                );
              }
              return null;
            })}
          </div>
        ))}
        {(status === "submitted" || status === "streaming") && (
          <p className="mr-auto text-xs text-[#9099a3]">El asistente está escribiendo…</p>
        )}
        {error && (
          <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            {error.message || "Algo salió mal. Intenta de nuevo en un momento."}
          </p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="flex items-end gap-2"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(input);
            }
          }}
          disabled={status !== "ready" || locked}
          rows={1}
          placeholder={
            locked
              ? "Ya generaste tu rutina de esta semana"
              : "Ej: rutina de 3 días, piernas y espalda, con mancuernas (Shift+Enter para salto de línea)"
          }
          className="max-h-40 flex-1 resize-none rounded-[10px] border border-[#2a2f37] bg-[#15181d] px-4 py-2.5 text-sm text-[#f1f3f4] outline-none focus:border-[#4ade80] disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status !== "ready" || locked}
          className="rounded-[10px] bg-[#22c55e] px-4 py-2.5 text-sm font-bold text-[#08150d] disabled:opacity-60"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
