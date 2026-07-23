"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ExerciseDetail, ExerciseSummary } from "@/lib/exercises";

const PAGE_SIZE = 24;

type SearchResponse = {
  total: number;
  items: ExerciseSummary[];
};

function buildQuery(q: string, category: string, equipment: string, offset: number) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (equipment) params.set("equipment", equipment);
  params.set("offset", String(offset));
  params.set("limit", String(PAGE_SIZE));
  return params.toString();
}

export default function ExerciseLibrary({
  categories,
  equipments,
}: {
  categories: string[];
  equipments: string[];
}) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [equipment, setEquipment] = useState("");
  const [items, setItems] = useState<ExerciseSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const requestId = useRef(0);

  const runSearch = useCallback(
    async (offset: number, append: boolean) => {
      const id = ++requestId.current;
      setLoading(true);
      const res = await fetch(`/api/exercises?${buildQuery(q, category, equipment, offset)}`);
      const data: SearchResponse = await res.json();
      if (id !== requestId.current) return;
      setTotal(data.total);
      setItems((prev) => (append ? [...prev, ...data.items] : data.items));
      setLoading(false);
    },
    [q, category, equipment],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      runSearch(0, false);
    }, 200);
    return () => clearTimeout(timeout);
  }, [runSearch]);

  const canLoadMore = items.length < total;

  return (
    <div className="min-h-screen bg-[#0d0f12] px-[clamp(20px,5vw,72px)] py-10 text-[#f1f3f4]">
      <div className="mx-auto max-w-[1200px]">
        <header className="mb-8">
          <p className="mb-2 text-xs font-semibold tracking-wide text-[#9099a3] uppercase">
            Biblioteca de ejercicios
          </p>
          <h1 className="text-3xl font-extrabold">Busca entre {total || "1,324"} ejercicios</h1>
          <p className="mt-2 max-w-[58ch] text-[15px] leading-relaxed text-[#9099a3]">
            Filtra por músculo, equipo o busca por nombre. Cada ejercicio incluye
            instrucciones y una animación de la técnica.
          </p>
        </header>

        <div className="mb-8 flex flex-wrap gap-3">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, músculo o equipo…"
            className="min-h-[44px] flex-1 min-w-[220px] rounded-[10px] border border-[#2a2f37] bg-[#1c2026] px-3.5 text-sm text-[#f1f3f4] placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#4ade80]"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="min-h-[44px] rounded-[10px] border border-[#2a2f37] bg-[#1c2026] px-3.5 text-sm text-[#f1f3f4] focus:outline-none focus:ring-1 focus:ring-[#4ade80]"
          >
            <option value="">Todos los músculos</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            className="min-h-[44px] rounded-[10px] border border-[#2a2f37] bg-[#1c2026] px-3.5 text-sm text-[#f1f3f4] focus:outline-none focus:ring-1 focus:ring-[#4ade80]"
          >
            <option value="">Todo el equipo</option>
            {equipments.map((eq) => (
              <option key={eq} value={eq}>
                {eq}
              </option>
            ))}
          </select>
        </div>

        {!loading && items.length === 0 ? (
          <p className="py-16 text-center text-[#9099a3]">
            No encontramos ejercicios con esos filtros.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {items.map((ex) => (
              <button
                key={ex.id}
                onClick={() => setSelectedId(ex.id)}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#2a2f37] bg-[#1c2026] text-left transition-colors hover:border-[#4ade80]"
              >
                <div className="aspect-square w-full overflow-hidden bg-[#0d0f12]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/exercises/${ex.image}`}
                    alt={ex.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <span className="text-sm font-semibold leading-snug">{ex.name}</span>
                  <span className="text-xs text-[#9099a3] capitalize">
                    {ex.target} · {ex.equipment}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {canLoadMore && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              disabled={loading}
              onClick={() => runSearch(items.length, true)}
              className="rounded-[10px] border border-[#2a2f37] px-5 py-2.5 text-sm font-bold text-[#f1f3f4] transition-colors hover:border-[#4ade80] disabled:opacity-50"
            >
              {loading ? "Cargando…" : "Cargar más"}
            </button>
          </div>
        )}
      </div>

      {selectedId && (
        <ExerciseDetailModal id={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}

function ExerciseDetailModal({ id, onClose }: { id: string; onClose: () => void }) {
  const [detail, setDetail] = useState<ExerciseDetail | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDetail(null);
    fetch(`/api/exercises/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setDetail(data);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {!detail ? (
          <p className="text-[#9099a3]">Cargando…</p>
        ) : (
          <>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#f1f3f4]">{detail.name}</h2>
                <p className="mt-1 text-sm text-[#9099a3] capitalize">
                  {detail.target} · {detail.equipment} · {detail.category}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full border border-[#2a2f37] px-3 py-1 text-sm text-[#9099a3] hover:text-[#f1f3f4]"
              >
                Cerrar
              </button>
            </div>

            <div className="mb-4 overflow-hidden rounded-xl bg-[#0d0f12]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/exercises/${detail.gif_url}`}
                alt={`Animación de ${detail.name}`}
                className="w-full"
              />
            </div>

            {detail.secondary_muscles.length > 0 && (
              <p className="mb-4 text-xs text-[#9099a3]">
                Músculos secundarios: {detail.secondary_muscles.join(", ")}
              </p>
            )}

            <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[#f1f3f4]">
              {detail.instruction_steps_es.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>

            <p className="mt-4 text-xs text-[#6b7280]">{detail.attribution}</p>
          </>
        )}
      </div>
    </div>
  );
}
