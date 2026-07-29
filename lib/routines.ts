import { and, desc, eq, gte, ilike, inArray, isNotNull, lt, ne, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "./db";
import {
  routineBlockExercises,
  routineBlocks,
  routineLikes,
  routines,
  setLogs,
  users,
  workoutSessions,
  type blockTypeEnum,
} from "./db/schema";
import { getExerciseById } from "./exercises";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: "Error interno." }, { status: 500 });
}

const BLOCK_EXERCISE_COUNT: Record<(typeof blockTypeEnum.enumValues)[number], number> = {
  single: 1,
  bi_series: 2,
  tri_series: 3,
};

export type BlockExerciseInput = {
  exerciseId: string;
  plannedSets: number;
  targetRepsMin?: number | null;
  targetRepsMax?: number | null;
  targetWeight?: number | null;
};

export type BlockInput = {
  type: (typeof blockTypeEnum.enumValues)[number];
  exercises: BlockExerciseInput[];
};

export type RoutineInput = {
  name: string;
  description?: string | null;
  scheduledDays?: number[];
  blocks: BlockInput[];
};

function validateRoutineInput(input: unknown): RoutineInput {
  if (typeof input !== "object" || input === null) {
    throw new ApiError(400, "Body inválido.");
  }
  const body = input as Record<string, unknown>;

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 120) {
    throw new ApiError(400, "'name' es requerido (máx. 120 caracteres).");
  }

  const description =
    body.description == null ? null : String(body.description).slice(0, 2000);

  let scheduledDays: number[] = [];
  if (body.scheduledDays != null) {
    if (!Array.isArray(body.scheduledDays)) {
      throw new ApiError(400, "'scheduledDays' debe ser un array de números (1=lunes..7=domingo).");
    }
    scheduledDays = [...new Set(body.scheduledDays.map((d) => Number(d)))];
    if (scheduledDays.some((d) => !Number.isInteger(d) || d < 1 || d > 7)) {
      throw new ApiError(400, "'scheduledDays' debe contener valores entre 1 (lunes) y 7 (domingo).");
    }
  }

  if (!Array.isArray(body.blocks) || body.blocks.length === 0) {
    throw new ApiError(400, "'blocks' debe tener al menos un elemento.");
  }
  if (body.blocks.length > 50) {
    throw new ApiError(400, "Máximo 50 bloques por rutina.");
  }

  const blocks: BlockInput[] = body.blocks.map((rawBlock, blockIndex) => {
    if (typeof rawBlock !== "object" || rawBlock === null) {
      throw new ApiError(400, `Bloque #${blockIndex + 1} inválido.`);
    }
    const block = rawBlock as Record<string, unknown>;
    const type = block.type;
    if (
      typeof type !== "string" ||
      !(type in BLOCK_EXERCISE_COUNT)
    ) {
      throw new ApiError(
        400,
        `Bloque #${blockIndex + 1}: 'type' debe ser single, bi_series o tri_series.`,
      );
    }
    const expectedCount = BLOCK_EXERCISE_COUNT[type as keyof typeof BLOCK_EXERCISE_COUNT];

    if (!Array.isArray(block.exercises) || block.exercises.length !== expectedCount) {
      throw new ApiError(
        400,
        `Bloque #${blockIndex + 1} (${type}): debe tener exactamente ${expectedCount} ejercicio(s).`,
      );
    }

    const exercises: BlockExerciseInput[] = block.exercises.map((rawEx, exIndex) => {
      if (typeof rawEx !== "object" || rawEx === null) {
        throw new ApiError(400, `Bloque #${blockIndex + 1}, ejercicio #${exIndex + 1} inválido.`);
      }
      const ex = rawEx as Record<string, unknown>;
      const exerciseId = typeof ex.exerciseId === "string" ? ex.exerciseId : "";
      if (!exerciseId || !getExerciseById(exerciseId)) {
        throw new ApiError(
          400,
          `Bloque #${blockIndex + 1}, ejercicio #${exIndex + 1}: 'exerciseId' no existe en el catálogo.`,
        );
      }

      const plannedSets = Number(ex.plannedSets);
      if (!Number.isInteger(plannedSets) || plannedSets < 1 || plannedSets > 20) {
        throw new ApiError(
          400,
          `Bloque #${blockIndex + 1}, ejercicio #${exIndex + 1}: 'plannedSets' debe ser un entero entre 1 y 20.`,
        );
      }

      const targetRepsMin = ex.targetRepsMin == null ? null : Number(ex.targetRepsMin);
      const targetRepsMax = ex.targetRepsMax == null ? null : Number(ex.targetRepsMax);
      if (targetRepsMin != null && (!Number.isInteger(targetRepsMin) || targetRepsMin < 1)) {
        throw new ApiError(400, `Bloque #${blockIndex + 1}, ejercicio #${exIndex + 1}: 'targetRepsMin' inválido.`);
      }
      if (targetRepsMax != null && (!Number.isInteger(targetRepsMax) || targetRepsMax < 1)) {
        throw new ApiError(400, `Bloque #${blockIndex + 1}, ejercicio #${exIndex + 1}: 'targetRepsMax' inválido.`);
      }
      if (targetRepsMin != null && targetRepsMax != null && targetRepsMin > targetRepsMax) {
        throw new ApiError(
          400,
          `Bloque #${blockIndex + 1}, ejercicio #${exIndex + 1}: 'targetRepsMin' no puede ser mayor que 'targetRepsMax'.`,
        );
      }

      const targetWeight = ex.targetWeight == null ? null : Number(ex.targetWeight);
      if (targetWeight != null && (Number.isNaN(targetWeight) || targetWeight < 0)) {
        throw new ApiError(400, `Bloque #${blockIndex + 1}, ejercicio #${exIndex + 1}: 'targetWeight' inválido.`);
      }

      return { exerciseId, plannedSets, targetRepsMin, targetRepsMax, targetWeight };
    });

    return { type: type as BlockInput["type"], exercises };
  });

  return { name, description, scheduledDays, blocks };
}

export async function ensureUser(clerkUserId: string, displayName: string | null, avatarUrl: string | null) {
  const db = getDb();
  await db
    .insert(users)
    .values({ id: clerkUserId, displayName, avatarUrl })
    .onConflictDoUpdate({
      target: users.id,
      set: { displayName, avatarUrl },
    });
}

export async function getUserProfile(userId: string) {
  const db = getDb();
  const [row] = await db
    .select({
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      weeklyGoal: users.weeklyGoal,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row ?? null;
}

async function insertBlocks(routineId: string, blocks: BlockInput[]) {
  const db = getDb();
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const [insertedBlock] = await db
      .insert(routineBlocks)
      .values({ routineId, position: i, type: block.type })
      .returning({ id: routineBlocks.id });

    await db.insert(routineBlockExercises).values(
      block.exercises.map((ex, exIndex) => ({
        blockId: insertedBlock.id,
        position: exIndex,
        exerciseId: ex.exerciseId,
        plannedSets: ex.plannedSets,
        targetRepsMin: ex.targetRepsMin ?? null,
        targetRepsMax: ex.targetRepsMax ?? null,
        targetWeight: ex.targetWeight ?? null,
      })),
    );
  }
}

export async function createRoutine(ownerId: string, rawInput: unknown) {
  const input = validateRoutineInput(rawInput);
  const db = getDb();
  const routineId = await db.transaction(async (tx) => {
    const [routine] = await tx
      .insert(routines)
      .values({
        ownerId,
        name: input.name,
        description: input.description,
        scheduledDays: input.scheduledDays ?? [],
      })
      .returning({ id: routines.id });
    return routine.id;
  });
  await insertBlocks(routineId, input.blocks);
  return getRoutineDetail(routineId);
}

export async function updateRoutine(routineId: string, ownerId: string, rawInput: unknown) {
  const routine = await getRoutineRow(routineId);
  if (!routine) throw new ApiError(404, "Rutina no encontrada.");
  if (routine.ownerId !== ownerId) throw new ApiError(403, "No eres dueño de esta rutina.");

  const input = validateRoutineInput(rawInput);
  const db = getDb();
  await db
    .update(routines)
    .set({
      name: input.name,
      description: input.description,
      scheduledDays: input.scheduledDays ?? [],
      updatedAt: new Date(),
    })
    .where(eq(routines.id, routineId));

  // Reemplazo completo de bloques (más simple y correcto que diffear).
  await db.delete(routineBlocks).where(eq(routineBlocks.routineId, routineId));
  await insertBlocks(routineId, input.blocks);

  return getRoutineDetail(routineId);
}

export async function deleteRoutine(routineId: string, ownerId: string) {
  const routine = await getRoutineRow(routineId);
  if (!routine) throw new ApiError(404, "Rutina no encontrada.");
  if (routine.ownerId !== ownerId) throw new ApiError(403, "No eres dueño de esta rutina.");
  const db = getDb();
  await db.delete(routines).where(eq(routines.id, routineId));
}

async function getRoutineRow(routineId: string) {
  const db = getDb();
  const [routine] = await db.select().from(routines).where(eq(routines.id, routineId)).limit(1);
  return routine ?? null;
}

function enrichBlockExercise(row: typeof routineBlockExercises.$inferSelect) {
  const exercise = getExerciseById(row.exerciseId);
  return {
    id: row.id,
    position: row.position,
    exerciseId: row.exerciseId,
    exercise: exercise
      ? {
          name: exercise.name,
          image: exercise.image,
          muscleGroup: exercise.muscle_group,
          equipment: exercise.equipment,
        }
      : null,
    plannedSets: row.plannedSets,
    targetRepsMin: row.targetRepsMin,
    targetRepsMax: row.targetRepsMax,
    targetWeight: row.targetWeight,
  };
}

export async function getRoutineDetail(routineId: string) {
  const db = getDb();
  const [routine] = await db
    .select({
      id: routines.id,
      ownerId: routines.ownerId,
      ownerDisplayName: users.displayName,
      originalRoutineId: routines.originalRoutineId,
      name: routines.name,
      description: routines.description,
      scheduledDays: routines.scheduledDays,
      createdAt: routines.createdAt,
      updatedAt: routines.updatedAt,
    })
    .from(routines)
    .innerJoin(users, eq(users.id, routines.ownerId))
    .where(eq(routines.id, routineId))
    .limit(1);

  if (!routine) return null;

  const blocks = await db
    .select()
    .from(routineBlocks)
    .where(eq(routineBlocks.routineId, routineId))
    .orderBy(routineBlocks.position);

  const blockIds = blocks.map((b) => b.id);
  const blockExercises = blockIds.length
    ? await db
        .select()
        .from(routineBlockExercises)
        .where(inArray(routineBlockExercises.blockId, blockIds))
        .orderBy(routineBlockExercises.position)
    : [];

  const exercisesByBlock = new Map<string, ReturnType<typeof enrichBlockExercise>[]>();
  for (const be of blockExercises) {
    const list = exercisesByBlock.get(be.blockId) ?? [];
    list.push(enrichBlockExercise(be));
    exercisesByBlock.set(be.blockId, list);
  }

  return {
    ...routine,
    blocks: blocks.map((b) => ({
      id: b.id,
      position: b.position,
      type: b.type,
      exercises: exercisesByBlock.get(b.id) ?? [],
    })),
  };
}

export type RoutineCard = {
  id: string;
  name: string;
  description: string | null;
  originalRoutineId: string | null;
  createdAt: Date;
  updatedAt: Date;
  blockCount: number;
  exerciseThumbnails: string[];
  lastSessionAt: Date | null;
};

export async function listMyRoutines(ownerId: string): Promise<RoutineCard[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: routines.id,
      name: routines.name,
      description: routines.description,
      originalRoutineId: routines.originalRoutineId,
      createdAt: routines.createdAt,
      updatedAt: routines.updatedAt,
    })
    .from(routines)
    .where(eq(routines.ownerId, ownerId))
    .orderBy(desc(routines.updatedAt));

  if (rows.length === 0) return [];
  const routineIds = rows.map((r) => r.id);

  const blocks = await db
    .select({ id: routineBlocks.id, routineId: routineBlocks.routineId })
    .from(routineBlocks)
    .where(inArray(routineBlocks.routineId, routineIds));

  const blockIdsByRoutine = new Map<string, string[]>();
  for (const b of blocks) {
    const list = blockIdsByRoutine.get(b.routineId) ?? [];
    list.push(b.id);
    blockIdsByRoutine.set(b.routineId, list);
  }

  const allBlockIds = blocks.map((b) => b.id);
  const blockExercises = allBlockIds.length
    ? await db
        .select({ blockId: routineBlockExercises.blockId, exerciseId: routineBlockExercises.exerciseId })
        .from(routineBlockExercises)
        .where(inArray(routineBlockExercises.blockId, allBlockIds))
        .orderBy(routineBlockExercises.position)
    : [];

  const exercisesByBlock = new Map<string, string[]>();
  for (const be of blockExercises) {
    const list = exercisesByBlock.get(be.blockId) ?? [];
    list.push(be.exerciseId);
    exercisesByBlock.set(be.blockId, list);
  }

  const lastSessions = await db
    .select({
      routineId: workoutSessions.routineId,
      lastStarted: sql<string>`max(${workoutSessions.startedAt})`,
    })
    .from(workoutSessions)
    .where(inArray(workoutSessions.routineId, routineIds))
    .groupBy(workoutSessions.routineId);

  const lastSessionByRoutine = new Map(
    lastSessions.map((s) => [s.routineId, s.lastStarted ? new Date(s.lastStarted) : null]),
  );

  return rows.map((r) => {
    const blockIds = blockIdsByRoutine.get(r.id) ?? [];
    const exerciseIds: string[] = [];
    outer: for (const bid of blockIds) {
      for (const exId of exercisesByBlock.get(bid) ?? []) {
        if (!exerciseIds.includes(exId)) exerciseIds.push(exId);
        if (exerciseIds.length >= 4) break outer;
      }
    }
    const exerciseThumbnails = exerciseIds
      .map((exId) => getExerciseById(exId)?.image)
      .filter((img): img is string => Boolean(img));

    return {
      ...r,
      blockCount: blockIds.length,
      exerciseThumbnails,
      lastSessionAt: lastSessionByRoutine.get(r.id) ?? null,
    };
  });
}

export async function listCommunityRoutines(
  excludeOwnerId: string,
  offset: number,
  limit: number,
  q?: string,
) {
  const db = getDb();
  const needle = q?.trim();
  const conditions = [ne(routines.ownerId, excludeOwnerId)];
  if (needle) {
    conditions.push(
      or(ilike(users.displayName, `%${needle}%`), ilike(routines.name, `%${needle}%`))!,
    );
  }

  return db
    .select({
      id: routines.id,
      name: routines.name,
      description: routines.description,
      ownerId: routines.ownerId,
      ownerDisplayName: users.displayName,
      createdAt: routines.createdAt,
      updatedAt: routines.updatedAt,
    })
    .from(routines)
    .innerJoin(users, eq(users.id, routines.ownerId))
    .where(and(...conditions))
    .orderBy(desc(routines.createdAt))
    .offset(offset)
    .limit(limit);
}

export async function searchCommunityUsers(excludeUserId: string, q: string, limit = 6) {
  const needle = q.trim();
  if (!needle) return [];
  const db = getDb();
  return db
    .select({
      id: users.id,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(and(ne(users.id, excludeUserId), ilike(users.displayName, `%${needle}%`)))
    .orderBy(users.displayName)
    .limit(limit);
}

export async function followRoutine(originalRoutineId: string, followerId: string) {
  const original = await getRoutineDetail(originalRoutineId);
  if (!original) throw new ApiError(404, "Rutina no encontrada.");
  if (original.ownerId === followerId) {
    throw new ApiError(400, "No puedes seguir tu propia rutina.");
  }

  const db = getDb();
  const routineId = await db.transaction(async (tx) => {
    const [routine] = await tx
      .insert(routines)
      .values({
        ownerId: followerId,
        originalRoutineId: original.id,
        name: original.name,
        description: original.description,
        scheduledDays: [],
      })
      .returning({ id: routines.id });
    return routine.id;
  });

  await insertBlocks(
    routineId,
    original.blocks.map((b) => ({
      type: b.type,
      exercises: b.exercises.map((e) => ({
        exerciseId: e.exerciseId,
        plannedSets: e.plannedSets,
        targetRepsMin: e.targetRepsMin,
        targetRepsMax: e.targetRepsMax,
        targetWeight: e.targetWeight,
      })),
    })),
  );

  return getRoutineDetail(routineId);
}

export async function startSession(routineId: string, userId: string) {
  const routine = await getRoutineRow(routineId);
  if (!routine) throw new ApiError(404, "Rutina no encontrada.");
  if (routine.ownerId !== userId) throw new ApiError(403, "No eres dueño de esta rutina.");

  const db = getDb();
  const [session] = await db
    .insert(workoutSessions)
    .values({ routineId, userId })
    .returning();
  return session;
}

export async function listRoutineSessions(routineId: string, userId: string) {
  const routine = await getRoutineRow(routineId);
  if (!routine) throw new ApiError(404, "Rutina no encontrada.");
  if (routine.ownerId !== userId) throw new ApiError(403, "No eres dueño de esta rutina.");

  const db = getDb();
  return db
    .select()
    .from(workoutSessions)
    .where(eq(workoutSessions.routineId, routineId))
    .orderBy(desc(workoutSessions.startedAt));
}

async function getSessionRow(sessionId: string) {
  const db = getDb();
  const [session] = await db
    .select()
    .from(workoutSessions)
    .where(eq(workoutSessions.id, sessionId))
    .limit(1);
  return session ?? null;
}

export async function getSessionDetail(sessionId: string, userId: string) {
  const session = await getSessionRow(sessionId);
  if (!session) throw new ApiError(404, "Sesión no encontrada.");
  if (session.userId !== userId) throw new ApiError(403, "No es tu sesión.");

  const routine = await getRoutineDetail(session.routineId);
  const db = getDb();
  const logs = await db.select().from(setLogs).where(eq(setLogs.sessionId, sessionId));

  return { ...session, routine, setLogs: logs };
}

export async function completeSession(sessionId: string, userId: string) {
  const session = await getSessionRow(sessionId);
  if (!session) throw new ApiError(404, "Sesión no encontrada.");
  if (session.userId !== userId) throw new ApiError(403, "No es tu sesión.");

  const db = getDb();
  const [updated] = await db
    .update(workoutSessions)
    .set({ completedAt: new Date() })
    .where(eq(workoutSessions.id, sessionId))
    .returning();
  return updated;
}

export type SetLogInput = {
  blockExerciseId: string;
  setNumber: number;
  weight?: number | null;
  reps?: number | null;
  completed?: boolean;
};

function validateSetLogInput(input: unknown): SetLogInput {
  if (typeof input !== "object" || input === null) throw new ApiError(400, "Body inválido.");
  const body = input as Record<string, unknown>;

  const blockExerciseId = typeof body.blockExerciseId === "string" ? body.blockExerciseId : "";
  if (!blockExerciseId) throw new ApiError(400, "'blockExerciseId' es requerido.");

  const setNumber = Number(body.setNumber);
  if (!Number.isInteger(setNumber) || setNumber < 1) {
    throw new ApiError(400, "'setNumber' debe ser un entero >= 1.");
  }

  const weight = body.weight == null ? null : Number(body.weight);
  if (weight != null && (Number.isNaN(weight) || weight < 0)) {
    throw new ApiError(400, "'weight' inválido.");
  }

  const reps = body.reps == null ? null : Number(body.reps);
  if (reps != null && (!Number.isInteger(reps) || reps < 0)) {
    throw new ApiError(400, "'reps' inválido.");
  }

  const completed = body.completed == null ? undefined : Boolean(body.completed);

  return { blockExerciseId, setNumber, weight, reps, completed };
}

export async function upsertSetLog(sessionId: string, userId: string, rawInput: unknown) {
  const session = await getSessionRow(sessionId);
  if (!session) throw new ApiError(404, "Sesión no encontrada.");
  if (session.userId !== userId) throw new ApiError(403, "No es tu sesión.");

  const input = validateSetLogInput(rawInput);

  const db = getDb();
  const [blockExercise] = await db
    .select({ id: routineBlockExercises.id, blockId: routineBlockExercises.blockId })
    .from(routineBlockExercises)
    .where(eq(routineBlockExercises.id, input.blockExerciseId))
    .limit(1);
  if (!blockExercise) throw new ApiError(400, "'blockExerciseId' no existe.");

  const [block] = await db
    .select({ routineId: routineBlocks.routineId })
    .from(routineBlocks)
    .where(eq(routineBlocks.id, blockExercise.blockId))
    .limit(1);
  if (!block || block.routineId !== session.routineId) {
    throw new ApiError(400, "'blockExerciseId' no pertenece a la rutina de esta sesión.");
  }

  const completed = input.completed ?? true;

  const [log] = await db
    .insert(setLogs)
    .values({
      sessionId,
      blockExerciseId: input.blockExerciseId,
      setNumber: input.setNumber,
      weight: input.weight ?? null,
      reps: input.reps ?? null,
      completed,
      completedAt: completed ? new Date() : null,
    })
    .onConflictDoUpdate({
      target: [setLogs.sessionId, setLogs.blockExerciseId, setLogs.setNumber],
      set: {
        weight: input.weight ?? null,
        reps: input.reps ?? null,
        completed,
        completedAt: completed ? new Date() : null,
      },
    })
    .returning();

  return log;
}

export async function toggleRoutineLike(routineId: string, userId: string) {
  const routine = await getRoutineRow(routineId);
  if (!routine) throw new ApiError(404, "Rutina no encontrada.");

  const db = getDb();
  const [existing] = await db
    .select({ id: routineLikes.id })
    .from(routineLikes)
    .where(and(eq(routineLikes.routineId, routineId), eq(routineLikes.userId, userId)))
    .limit(1);

  if (existing) {
    await db.delete(routineLikes).where(eq(routineLikes.id, existing.id));
  } else {
    await db.insert(routineLikes).values({ routineId, userId });
  }

  const [row] = await db
    .select({ count: sql<string>`count(*)` })
    .from(routineLikes)
    .where(eq(routineLikes.routineId, routineId));

  return { liked: !existing, likesCount: row ? Number(row.count) : 0 };
}

export async function getRoutineLikeInfo(routineId: string, userId: string) {
  const db = getDb();
  const [row] = await db
    .select({ count: sql<string>`count(*)` })
    .from(routineLikes)
    .where(eq(routineLikes.routineId, routineId));
  const [liked] = await db
    .select({ id: routineLikes.id })
    .from(routineLikes)
    .where(and(eq(routineLikes.routineId, routineId), eq(routineLikes.userId, userId)))
    .limit(1);
  return { likesCount: row ? Number(row.count) : 0, liked: Boolean(liked) };
}

export async function getRoutineLikesBatch(routineIds: string[], userId: string) {
  const map = new Map<string, { likesCount: number; liked: boolean }>();
  if (routineIds.length === 0) return map;

  const db = getDb();
  const counts = await db
    .select({ routineId: routineLikes.routineId, count: sql<string>`count(*)` })
    .from(routineLikes)
    .where(inArray(routineLikes.routineId, routineIds))
    .groupBy(routineLikes.routineId);
  const likedRows = await db
    .select({ routineId: routineLikes.routineId })
    .from(routineLikes)
    .where(and(inArray(routineLikes.routineId, routineIds), eq(routineLikes.userId, userId)));
  const likedSet = new Set(likedRows.map((r) => r.routineId));

  for (const id of routineIds) {
    map.set(id, { likesCount: 0, liked: likedSet.has(id) });
  }
  for (const c of counts) {
    const entry = map.get(c.routineId) ?? { likesCount: 0, liked: likedSet.has(c.routineId) };
    entry.likesCount = Number(c.count);
    map.set(c.routineId, entry);
  }
  return map;
}

export async function deleteSetLog(
  sessionId: string,
  userId: string,
  blockExerciseId: string,
  setNumber: number,
) {
  const session = await getSessionRow(sessionId);
  if (!session) throw new ApiError(404, "Sesión no encontrada.");
  if (session.userId !== userId) throw new ApiError(403, "No es tu sesión.");

  const db = getDb();
  await db
    .delete(setLogs)
    .where(
      and(
        eq(setLogs.sessionId, sessionId),
        eq(setLogs.blockExerciseId, blockExerciseId),
        eq(setLogs.setNumber, setNumber),
      ),
    );
}

export async function updateSessionNotes(sessionId: string, userId: string, notes: string) {
  const session = await getSessionRow(sessionId);
  if (!session) throw new ApiError(404, "Sesión no encontrada.");
  if (session.userId !== userId) throw new ApiError(403, "No es tu sesión.");

  const db = getDb();
  await db
    .update(workoutSessions)
    .set({ notes: notes.trim().slice(0, 2000) || null })
    .where(eq(workoutSessions.id, sessionId));
}

// ---- Dashboard "Inicio" ----

const DAY_LABELS = ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function isoWeekday(date: Date): number {
  const day = date.getUTCDay(); // 0=domingo..6=sábado
  return day === 0 ? 7 : day;
}

export function startOfWeekUTC(date: Date): Date {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - (isoWeekday(date) - 1));
  return start;
}

export type WeeklyProgress = {
  sessionsCount: number;
  volumeKg: number;
  totalMs: number;
  weeklyGoal: number;
};

export async function getWeeklyProgress(userId: string): Promise<WeeklyProgress> {
  const db = getDb();
  const weekStart = startOfWeekUTC(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

  const [userRow] = await db
    .select({ weeklyGoal: users.weeklyGoal })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const sessions = await db
    .select({
      id: workoutSessions.id,
      startedAt: workoutSessions.startedAt,
      completedAt: workoutSessions.completedAt,
    })
    .from(workoutSessions)
    .where(
      and(
        eq(workoutSessions.userId, userId),
        isNotNull(workoutSessions.completedAt),
        gte(workoutSessions.completedAt, weekStart),
        lt(workoutSessions.completedAt, weekEnd),
      ),
    );

  const totalMs = sessions.reduce(
    (sum, s) => sum + (s.completedAt ? s.completedAt.getTime() - s.startedAt.getTime() : 0),
    0,
  );

  let volumeKg = 0;
  const sessionIds = sessions.map((s) => s.id);
  if (sessionIds.length > 0) {
    const [row] = await db
      .select({
        volume: sql<string>`coalesce(sum(${setLogs.weight} * ${setLogs.reps}), 0)`,
      })
      .from(setLogs)
      .where(and(inArray(setLogs.sessionId, sessionIds), eq(setLogs.completed, true)));
    volumeKg = row ? Number(row.volume) : 0;
  }

  return {
    sessionsCount: sessions.length,
    volumeKg,
    totalMs,
    weeklyGoal: userRow?.weeklyGoal ?? 4,
  };
}

export type ScheduledRoutineCard = {
  id: string;
  name: string;
  blockCount: number;
  dayLabel: string;
};

export async function getTodayAndUpcoming(userId: string) {
  const db = getDb();
  const rows = await db
    .select({ id: routines.id, name: routines.name, scheduledDays: routines.scheduledDays })
    .from(routines)
    .where(eq(routines.ownerId, userId));

  const scheduled = rows.filter((r) => r.scheduledDays.length > 0);
  const scheduledWeekdays = [...new Set(scheduled.flatMap((r) => r.scheduledDays))];
  if (scheduled.length === 0) {
    return {
      today: null as ScheduledRoutineCard | null,
      upcoming: [] as ScheduledRoutineCard[],
      scheduledWeekdays,
    };
  }

  const routineIds = scheduled.map((r) => r.id);
  const blocks = await db
    .select({ routineId: routineBlocks.routineId })
    .from(routineBlocks)
    .where(inArray(routineBlocks.routineId, routineIds));
  const blockCountByRoutine = new Map<string, number>();
  for (const b of blocks) {
    blockCountByRoutine.set(b.routineId, (blockCountByRoutine.get(b.routineId) ?? 0) + 1);
  }

  const todayIso = isoWeekday(new Date());
  const toCard = (r: (typeof scheduled)[number], dayLabel: string): ScheduledRoutineCard => ({
    id: r.id,
    name: r.name,
    blockCount: blockCountByRoutine.get(r.id) ?? 0,
    dayLabel,
  });

  const todayRoutine = scheduled.find((r) => r.scheduledDays.includes(todayIso));
  const today = todayRoutine ? toCard(todayRoutine, DAY_LABELS[todayIso]) : null;

  const upcoming: ScheduledRoutineCard[] = [];
  for (let offset = 1; offset <= 6 && upcoming.length < 5; offset++) {
    const day = ((todayIso - 1 + offset) % 7) + 1;
    const match = scheduled.find((r) => r.scheduledDays.includes(day));
    if (match) upcoming.push(toCard(match, DAY_LABELS[day]));
  }

  return { today, upcoming, scheduledWeekdays };
}

export type ScheduledToday = { userId: string; routineName: string };

export async function getUsersScheduledToday(): Promise<ScheduledToday[]> {
  const db = getDb();
  const todayIso = isoWeekday(new Date());
  const rows = await db
    .select({
      ownerId: routines.ownerId,
      name: routines.name,
      scheduledDays: routines.scheduledDays,
    })
    .from(routines);

  return rows
    .filter((r) => r.scheduledDays.includes(todayIso))
    .map((r) => ({ userId: r.ownerId, routineName: r.name }));
}

export type WeekdayRoutineCard = {
  id: string;
  name: string;
  description: string | null;
  blockCount: number;
};

export async function getRoutinesGroupedByWeekday(
  userId: string,
): Promise<Record<number, WeekdayRoutineCard[]>> {
  const db = getDb();
  const rows = await db
    .select({
      id: routines.id,
      name: routines.name,
      description: routines.description,
      scheduledDays: routines.scheduledDays,
    })
    .from(routines)
    .where(eq(routines.ownerId, userId));

  const routineIds = rows.map((r) => r.id);
  const blocks = routineIds.length
    ? await db
        .select({ routineId: routineBlocks.routineId })
        .from(routineBlocks)
        .where(inArray(routineBlocks.routineId, routineIds))
    : [];
  const blockCountByRoutine = new Map<string, number>();
  for (const b of blocks) {
    blockCountByRoutine.set(b.routineId, (blockCountByRoutine.get(b.routineId) ?? 0) + 1);
  }

  const byWeekday: Record<number, WeekdayRoutineCard[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
  };
  for (const r of rows) {
    const card: WeekdayRoutineCard = {
      id: r.id,
      name: r.name,
      description: r.description,
      blockCount: blockCountByRoutine.get(r.id) ?? 0,
    };
    for (const day of r.scheduledDays) {
      if (byWeekday[day]) byWeekday[day].push(card);
    }
  }
  return byWeekday;
}

export async function getStreak(userId: string): Promise<number> {
  const db = getDb();
  const sessions = await db
    .select({ completedAt: workoutSessions.completedAt })
    .from(workoutSessions)
    .where(and(eq(workoutSessions.userId, userId), isNotNull(workoutSessions.completedAt)))
    .orderBy(desc(workoutSessions.completedAt))
    .limit(200);

  const days = new Set<string>();
  for (const s of sessions) {
    if (s.completedAt) days.add(s.completedAt.toISOString().slice(0, 10));
  }

  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  // Si todavía no entrenaste hoy, arranca a contar desde ayer para no cortar
  // la racha antes de que termine el día.
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export type SessionHistoryItem = {
  id: string;
  routineId: string;
  routineName: string;
  startedAt: Date;
  completedAt: Date | null;
};

export async function listAllMySessions(userId: string, limit = 50): Promise<SessionHistoryItem[]> {
  const db = getDb();
  return db
    .select({
      id: workoutSessions.id,
      routineId: workoutSessions.routineId,
      routineName: routines.name,
      startedAt: workoutSessions.startedAt,
      completedAt: workoutSessions.completedAt,
    })
    .from(workoutSessions)
    .innerJoin(routines, eq(routines.id, workoutSessions.routineId))
    .where(eq(workoutSessions.userId, userId))
    .orderBy(desc(workoutSessions.startedAt))
    .limit(limit);
}

export async function updateWeeklyGoal(userId: string, weeklyGoal: number) {
  if (!Number.isInteger(weeklyGoal) || weeklyGoal < 1 || weeklyGoal > 14) {
    throw new ApiError(400, "La meta semanal debe ser un entero entre 1 y 14.");
  }
  const db = getDb();
  await db.update(users).set({ weeklyGoal }).where(eq(users.id, userId));
}
