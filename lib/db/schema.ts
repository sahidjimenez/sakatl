import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const blockTypeEnum = pgEnum("block_type", [
  "single",
  "bi_series",
  "tri_series",
]);

// Espejo mínimo del usuario de Clerk (clerkUserId es el id de Clerk, ej. "user_...").
// Se puebla de forma lazy (upsert) en el primer request autenticado.
export const users = pgTable("users", {
  id: text("id").primaryKey(), // clerk user id
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  // Meta de entrenamientos por semana (configurable en Perfil), para "Meta semanal" del dashboard.
  weeklyGoal: integer("weekly_goal").notNull().default(4),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const routines = pgTable("routines", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // Si esta rutina es una copia de otra (al "seguir" a otro usuario), apunta
  // al original — da crédito al autor sin acoplar el progreso de cada quien.
  originalRoutineId: uuid("original_routine_id").references(
    (): AnyPgColumn => routines.id,
    { onDelete: "set null" },
  ),
  name: text("name").notNull(),
  description: text("description"),
  // Días de la semana en que se entrena esta rutina (ISO: 1=lunes ... 7=domingo).
  // Vacío/null = sin agendar todavía.
  scheduledDays: integer("scheduled_days").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Un bloque es un ejercicio suelto, una bi-serie o una tri-serie dentro de la rutina.
export const routineBlocks = pgTable("routine_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  routineId: uuid("routine_id")
    .notNull()
    .references(() => routines.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  type: blockTypeEnum("type").notNull(),
});

// Cada ejercicio dentro de un bloque (1 si es "single", 2 si es bi-serie, 3 si es tri-serie).
export const routineBlockExercises = pgTable("routine_block_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  blockId: uuid("block_id")
    .notNull()
    .references(() => routineBlocks.id, { onDelete: "cascade" }),
  position: integer("position").notNull(), // orden dentro del bloque (0 = primero en la ronda)
  exerciseId: text("exercise_id").notNull(), // id del dataset en public/exercises/, no es FK en DB
  plannedSets: integer("planned_sets").notNull(),
  targetRepsMin: integer("target_reps_min"),
  targetRepsMax: integer("target_reps_max"),
  targetWeight: numeric("target_weight", { precision: 6, scale: 2, mode: "number" }),
});

// Una sesión = una vez que alguien entrena siguiendo una rutina (propia o seguida).
export const workoutSessions = pgTable("workout_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  routineId: uuid("routine_id")
    .notNull()
    .references(() => routines.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

// Un set real, marcado durante la sesión (check + peso + reps).
export const setLogs = pgTable(
  "set_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => workoutSessions.id, { onDelete: "cascade" }),
    blockExerciseId: uuid("block_exercise_id")
      .notNull()
      .references(() => routineBlockExercises.id, { onDelete: "cascade" }),
    setNumber: integer("set_number").notNull(),
    weight: numeric("weight", { precision: 6, scale: 2, mode: "number" }),
    reps: integer("reps"),
    completed: boolean("completed").notNull().default(false),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("set_logs_session_block_exercise_set_idx").on(
      table.sessionId,
      table.blockExerciseId,
      table.setNumber,
    ),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  routines: many(routines),
  workoutSessions: many(workoutSessions),
}));

export const routinesRelations = relations(routines, ({ one, many }) => ({
  owner: one(users, { fields: [routines.ownerId], references: [users.id] }),
  originalRoutine: one(routines, {
    fields: [routines.originalRoutineId],
    references: [routines.id],
  }),
  blocks: many(routineBlocks),
  sessions: many(workoutSessions),
}));

export const routineBlocksRelations = relations(routineBlocks, ({ one, many }) => ({
  routine: one(routines, { fields: [routineBlocks.routineId], references: [routines.id] }),
  exercises: many(routineBlockExercises),
}));

export const routineBlockExercisesRelations = relations(routineBlockExercises, ({ one, many }) => ({
  block: one(routineBlocks, {
    fields: [routineBlockExercises.blockId],
    references: [routineBlocks.id],
  }),
  setLogs: many(setLogs),
}));

export const workoutSessionsRelations = relations(workoutSessions, ({ one, many }) => ({
  routine: one(routines, { fields: [workoutSessions.routineId], references: [routines.id] }),
  user: one(users, { fields: [workoutSessions.userId], references: [users.id] }),
  setLogs: many(setLogs),
}));

export const setLogsRelations = relations(setLogs, ({ one }) => ({
  session: one(workoutSessions, {
    fields: [setLogs.sessionId],
    references: [workoutSessions.id],
  }),
  blockExercise: one(routineBlockExercises, {
    fields: [setLogs.blockExerciseId],
    references: [routineBlockExercises.id],
  }),
}));
