"use client";

import { useState } from "react";
import type { ExerciseSummary } from "@/lib/exercises";
import { ICON_BUTTON_CLASS } from "@/app/components/IconModalButton";
import { ExerciseThumb } from "@/app/components/ExerciseThumb";
import { Modal } from "@/app/components/Modal";

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function AddExerciseModal({
  onAdd,
}: {
  onAdd: (exerciseId: string, plannedSets: number) => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ExerciseSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ExerciseSummary | null>(null);
  const [plannedSets, setPlannedSets] = useState(3);
  const [saving, setSaving] = useState(false);

  function reset() {
    setQ("");
    setResults([]);
    setSelected(null);
    setPlannedSets(3);
  }

  function close() {
    setOpen(false);
    reset();
  }

  async function search(value: string) {
    setQ(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/exercises?q=${encodeURIComponent(value)}&limit=8`);
    const data = await res.json();
    setResults(data.items);
    setLoading(false);
  }

  async function handleAdd() {
    if (!selected) return;
    setSaving(true);
    await onAdd(selected.id, plannedSets);
    setSaving(false);
    close();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Agregar ejercicio a esta sesión"
        title="Agregar ejercicio"
        className={ICON_BUTTON_CLASS}
      >
        <PlusIcon className="h-5 w-5" />
      </button>

      <Modal open={open} onClose={close}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-[#f1f3f4]">Agregar ejercicio a esta sesión</p>
              <button
                type="button"
                onClick={close}
                className="rounded-full border border-[#2a2f37] px-3 py-1 text-sm text-[#9099a3] hover:text-[#f1f3f4]"
              >
                Cerrar
              </button>
            </div>

            {!selected ? (
              <>
                <input
                  value={q}
                  onChange={(e) => search(e.target.value)}
                  placeholder="Buscar ejercicio…"
                  autoFocus
                  className="min-h-[48px] w-full rounded-[10px] border border-[#2a2f37] bg-[#0d0f12] px-3.5 text-base text-[#f1f3f4] placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#4ade80]"
                />
                <div className="mt-3 max-h-72 overflow-y-auto rounded-[10px] border border-[#2a2f37]">
                  {loading && <p className="p-3 text-xs text-[#9099a3]">Buscando…</p>}
                  {!loading && q.trim() && results.length === 0 && (
                    <p className="p-3 text-xs text-[#9099a3]">Sin resultados.</p>
                  )}
                  {results.map((ex) => (
                    <div key={ex.id} className="flex w-full items-center gap-3 px-3 py-2 hover:bg-[#23272e]">
                      <ExerciseThumb
                        exerciseId={ex.id}
                        image={ex.image}
                        name={ex.name}
                        imgClassName="h-14 w-14 shrink-0 rounded-md object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setSelected(ex)}
                        className="flex-1 text-left"
                      >
                        <span className="block text-sm font-semibold text-[#f1f3f4]">{ex.name}</span>
                        <span className="block text-xs text-[#9099a3] capitalize">
                          {ex.target} · {ex.equipment}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 rounded-xl border border-[#23272e] bg-[#0d0f12] p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/exercises/${selected.image}`}
                    alt={selected.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#f1f3f4]">{selected.name}</p>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="text-xs font-semibold text-[#9099a3] hover:text-[#f1f3f4]"
                    >
                      Cambiar ejercicio
                    </button>
                  </div>
                </div>
                <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#f1f3f4]">
                  Series
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={plannedSets}
                    onChange={(e) =>
                      setPlannedSets(Math.max(1, Math.min(20, Number(e.target.value) || 1)))
                    }
                    className="min-h-[48px] w-24 rounded-[10px] border border-[#2a2f37] bg-[#0d0f12] px-3.5 text-base text-[#f1f3f4] focus:outline-none focus:ring-1 focus:ring-[#4ade80]"
                  />
                </label>
                <p className="text-xs text-[#6b7280]">
                  Se agrega sólo a esta sesión, no cambia la rutina guardada.
                </p>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleAdd}
                  className="min-h-[44px] self-start rounded-[10px] bg-[#22c55e] px-5 text-sm font-bold text-[#08150d] disabled:opacity-60"
                >
                  {saving ? "Agregando…" : "Agregar a la sesión"}
                </button>
              </div>
            )}
      </Modal>
    </>
  );
}
