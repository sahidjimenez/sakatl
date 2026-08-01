// Capa de datos para el modo invitado: todo vive en localStorage del navegador,
// nunca toca la base de datos. Se limpia sola pasado GUEST_TTL_DAYS desde el
// primer uso (ver pruneIfExpired).

export type GuestBlockType = "single" | "bi_series" | "tri_series";

export type GuestBlockExercise = {
  id: string;
  exerciseId: string;
  exerciseName: string | null;
  exerciseImage: string | null;
  plannedSets: number;
  targetRepsMin: number | null;
  targetRepsMax: number | null;
  targetWeight: number | null;
};

export type GuestBlock = {
  id: string;
  type: GuestBlockType;
  exercises: GuestBlockExercise[];
};

export type GuestRoutine = {
  id: string;
  name: string;
  description: string | null;
  scheduledDays: number[];
  blocks: GuestBlock[];
  createdAt: string;
  updatedAt: string;
};

export type GuestSetLog = {
  blockExerciseId: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  completed: boolean;
  completedAt: string | null;
};

export type GuestSession = {
  id: string;
  routineId: string;
  startedAt: string;
  completedAt: string | null;
  notes: string | null;
  setLogs: GuestSetLog[];
  // Ejercicios agregados sólo a esta sesión puntual (botón "Agregar ejercicio"),
  // no forman parte de la plantilla de la rutina guardada.
  extraBlocks?: GuestBlock[];
};

export type GuestRoutineInput = {
  name: string;
  description?: string | null;
  scheduledDays?: number[];
  blocks: Array<{
    type: GuestBlockType;
    exercises: Array<{
      exerciseId: string;
      exerciseName?: string | null;
      exerciseImage?: string | null;
      plannedSets: number;
      targetRepsMin?: number | null;
      targetRepsMax?: number | null;
      targetWeight?: number | null;
    }>;
  }>;
};

export type GuestSetLogInput = {
  blockExerciseId: string;
  setNumber: number;
  weight?: number | null;
  reps?: number | null;
  completed?: boolean;
};

const PREFIX = "sakatl:guest:";
const META_KEY = `${PREFIX}meta`;
const ROUTINES_KEY = `${PREFIX}routines`;
const SESSIONS_KEY = `${PREFIX}sessions`;
const ASSISTANT_USAGE_KEY = `${PREFIX}assistant-usage`;

export const GUEST_TTL_DAYS = 14;
const TTL_MS = GUEST_TTL_DAYS * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Cuántos días debe esperar un invitado entre rutinas generadas por IA. */
export const GUEST_ASSISTANT_COOLDOWN_DAYS = 7;
const ASSISTANT_COOLDOWN_MS = GUEST_ASSISTANT_COOLDOWN_DAYS * DAY_MS;

type GuestMeta = { createdAt: string };

function isBrowser() {
  return typeof window !== "undefined";
}

function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function getMeta(): GuestMeta | null {
  return readJSON<GuestMeta | null>(META_KEY, null);
}

function touchMeta(): GuestMeta {
  const existing = getMeta();
  if (existing) return existing;
  const meta: GuestMeta = { createdAt: new Date().toISOString() };
  writeJSON(META_KEY, meta);
  return meta;
}

function pruneIfExpired() {
  if (!isBrowser()) return;
  const meta = getMeta();
  if (!meta) return;
  const expired = Date.now() - new Date(meta.createdAt).getTime() > TTL_MS;
  if (expired) {
    window.localStorage.removeItem(META_KEY);
    window.localStorage.removeItem(ROUTINES_KEY);
    window.localStorage.removeItem(SESSIONS_KEY);
    window.localStorage.removeItem(ASSISTANT_USAGE_KEY);
  }
}

/** Marca el inicio (o continúa) la sesión de invitado; llamar antes de guardar algo. */
export function touchGuestMeta(): void {
  pruneIfExpired();
  touchMeta();
}

export function getGuestDaysRemaining(): number {
  pruneIfExpired();
  const meta = getMeta();
  if (!meta) return GUEST_TTL_DAYS;
  const remainingMs = TTL_MS - (Date.now() - new Date(meta.createdAt).getTime());
  return Math.max(0, Math.ceil(remainingMs / DAY_MS));
}

/** True si ya hay una sesión de invitado activa (no expirada) en este navegador. */
export function hasGuestData(): boolean {
  pruneIfExpired();
  return getMeta() !== null;
}

function readRoutines(): GuestRoutine[] {
  pruneIfExpired();
  return readJSON<GuestRoutine[]>(ROUTINES_KEY, []);
}

function writeRoutines(routines: GuestRoutine[]) {
  writeJSON(ROUTINES_KEY, routines);
}

function readSessions(): GuestSession[] {
  pruneIfExpired();
  return readJSON<GuestSession[]>(SESSIONS_KEY, []);
}

function writeSessions(sessions: GuestSession[]) {
  writeJSON(SESSIONS_KEY, sessions);
}

export function listGuestRoutines(): GuestRoutine[] {
  return [...readRoutines()].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getGuestRoutine(id: string): GuestRoutine | null {
  return readRoutines().find((r) => r.id === id) ?? null;
}

const BLOCK_EXERCISE_COUNT: Record<GuestBlockType, number> = {
  single: 1,
  bi_series: 2,
  tri_series: 3,
};

function validateGuestRoutineInput(input: GuestRoutineInput): string | null {
  const name = input.name?.trim();
  if (!name || name.length > 120) return "Ponle un nombre a la rutina (máx. 120 caracteres).";
  if (!Array.isArray(input.blocks) || input.blocks.length === 0) return "Agrega al menos un bloque.";
  if (input.blocks.length > 50) return "Máximo 50 bloques por rutina.";

  for (const block of input.blocks) {
    const expected = BLOCK_EXERCISE_COUNT[block.type];
    if (!expected) return "Tipo de bloque inválido.";
    if (!Array.isArray(block.exercises) || block.exercises.length !== expected) {
      return `Un bloque de tipo ${block.type} necesita exactamente ${expected} ejercicio(s).`;
    }
    for (const ex of block.exercises) {
      if (!ex.exerciseId) return "Todos los ejercicios de cada bloque deben estar elegidos.";
      if (!Number.isInteger(ex.plannedSets) || ex.plannedSets < 1 || ex.plannedSets > 20) {
        return "'Series' debe ser un entero entre 1 y 20.";
      }
    }
  }
  return null;
}

export function saveGuestRoutine(
  input: GuestRoutineInput,
  existingId?: string,
): { ok: true; id: string } | { error: string } {
  const validationError = validateGuestRoutineInput(input);
  if (validationError) return { error: validationError };

  touchGuestMeta();

  const routines = readRoutines();
  const now = new Date().toISOString();
  const id = existingId ?? crypto.randomUUID();
  const existingIndex = routines.findIndex((r) => r.id === id);

  const blocks: GuestBlock[] = input.blocks.map((b) => ({
    id: crypto.randomUUID(),
    type: b.type,
    exercises: b.exercises.map((ex) => ({
      id: crypto.randomUUID(),
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName ?? null,
      exerciseImage: ex.exerciseImage ?? null,
      plannedSets: ex.plannedSets,
      targetRepsMin: ex.targetRepsMin ?? null,
      targetRepsMax: ex.targetRepsMax ?? null,
      targetWeight: ex.targetWeight ?? null,
    })),
  }));

  const routine: GuestRoutine = {
    id,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    scheduledDays: input.scheduledDays ?? [],
    blocks,
    createdAt: existingIndex >= 0 ? routines[existingIndex].createdAt : now,
    updatedAt: now,
  };

  if (existingIndex >= 0) routines[existingIndex] = routine;
  else routines.push(routine);
  writeRoutines(routines);

  return { ok: true, id };
}

export function deleteGuestRoutine(id: string): void {
  writeRoutines(readRoutines().filter((r) => r.id !== id));
  writeSessions(readSessions().filter((s) => s.routineId !== id));
}

export function listGuestSessionsForRoutine(routineId: string): GuestSession[] {
  return readSessions()
    .filter((s) => s.routineId === routineId)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export function getGuestSession(id: string): GuestSession | null {
  return readSessions().find((s) => s.id === id) ?? null;
}

export function startGuestSession(routineId: string): GuestSession {
  touchGuestMeta();
  const sessions = readSessions();
  const session: GuestSession = {
    id: crypto.randomUUID(),
    routineId,
    startedAt: new Date().toISOString(),
    completedAt: null,
    notes: null,
    setLogs: [],
  };
  sessions.push(session);
  writeSessions(sessions);
  return session;
}

export function completeGuestSession(id: string): void {
  const sessions = readSessions();
  const idx = sessions.findIndex((s) => s.id === id);
  if (idx < 0) return;
  sessions[idx] = { ...sessions[idx], completedAt: new Date().toISOString() };
  writeSessions(sessions);
}

export function updateGuestSessionNotes(id: string, notes: string): void {
  const sessions = readSessions();
  const idx = sessions.findIndex((s) => s.id === id);
  if (idx < 0) return;
  sessions[idx] = { ...sessions[idx], notes: notes.trim().slice(0, 2000) || null };
  writeSessions(sessions);
}

export function upsertGuestSetLog(sessionId: string, input: GuestSetLogInput): void {
  const sessions = readSessions();
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx < 0) return;

  const session = sessions[idx];
  const completed = input.completed ?? true;
  const log: GuestSetLog = {
    blockExerciseId: input.blockExerciseId,
    setNumber: input.setNumber,
    weight: input.weight ?? null,
    reps: input.reps ?? null,
    completed,
    completedAt: completed ? new Date().toISOString() : null,
  };

  const logIdx = session.setLogs.findIndex(
    (l) => l.blockExerciseId === input.blockExerciseId && l.setNumber === input.setNumber,
  );
  const setLogs = [...session.setLogs];
  if (logIdx >= 0) setLogs[logIdx] = log;
  else setLogs.push(log);

  sessions[idx] = { ...session, setLogs };
  writeSessions(sessions);
}

export function deleteGuestSetLog(sessionId: string, blockExerciseId: string, setNumber: number): void {
  const sessions = readSessions();
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx < 0) return;
  const session = sessions[idx];
  sessions[idx] = {
    ...session,
    setLogs: session.setLogs.filter(
      (l) => !(l.blockExerciseId === blockExerciseId && l.setNumber === setNumber),
    ),
  };
  writeSessions(sessions);
}

export function deleteGuestSession(id: string): void {
  writeSessions(readSessions().filter((s) => s.id !== id));
}

/**
 * Agrega un ejercicio "extra" sólo a esta sesión puntual: se guarda como un
 * bloque más dentro de la sesión (no toca la rutina guardada en ROUTINES_KEY),
 * para no alterar la plantilla para futuras sesiones.
 */
export function addGuestExtraExercise(
  sessionId: string,
  exercise: { exerciseId: string; exerciseName: string | null; exerciseImage: string | null },
  plannedSets: number,
): void {
  const sessions = readSessions();
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx < 0) return;
  const session = sessions[idx];
  const extraBlock: GuestBlock = {
    id: crypto.randomUUID(),
    type: "single",
    exercises: [
      {
        id: crypto.randomUUID(),
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        exerciseImage: exercise.exerciseImage,
        plannedSets,
        targetRepsMin: null,
        targetRepsMax: null,
        targetWeight: null,
      },
    ],
  };
  sessions[idx] = { ...session, extraBlocks: [...(session.extraBlocks ?? []), extraBlock] };
  writeSessions(sessions);
}

type GuestAssistantUsage = { lastUsedAt: string };

/**
 * El asistente de IA para invitados sólo puede generar 1 rutina por semana
 * (sin cuenta no hay forma de cobrar/limitar en el servidor por usuario, así
 * que el límite vive aquí y se refuerza también con un tope por IP en la API).
 */
export function getGuestAssistantCooldown(): { locked: boolean; daysRemaining: number } {
  pruneIfExpired();
  const usage = readJSON<GuestAssistantUsage | null>(ASSISTANT_USAGE_KEY, null);
  if (!usage) return { locked: false, daysRemaining: 0 };
  const elapsedMs = Date.now() - new Date(usage.lastUsedAt).getTime();
  if (elapsedMs >= ASSISTANT_COOLDOWN_MS) return { locked: false, daysRemaining: 0 };
  return { locked: true, daysRemaining: Math.max(1, Math.ceil((ASSISTANT_COOLDOWN_MS - elapsedMs) / DAY_MS)) };
}

export function markGuestAssistantUsed(): void {
  touchGuestMeta();
  const usage: GuestAssistantUsage = { lastUsedAt: new Date().toISOString() };
  writeJSON(ASSISTANT_USAGE_KEY, usage);
}
