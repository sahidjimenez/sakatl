import fs from "node:fs";
import path from "node:path";

export type ExerciseRecord = {
  id: string;
  name: string;
  category: string;
  body_part: string;
  equipment: string;
  instructions: Record<string, string>;
  instruction_steps: Record<string, string[]>;
  muscle_group: string;
  secondary_muscles: string[];
  target: string;
  media_id: string;
  image: string;
  gif_url: string;
  attribution: string;
  created_at: string;
};

export type ExerciseSummary = {
  id: string;
  name: string;
  category: string;
  equipment: string;
  target: string;
  muscle_group: string;
  image: string;
};

export type ExerciseDetail = ExerciseSummary & {
  secondary_muscles: string[];
  gif_url: string;
  attribution: string;
  instructions_es: string;
  instruction_steps_es: string[];
};

let cache: ExerciseRecord[] | null = null;

function loadExercises(): ExerciseRecord[] {
  if (cache) return cache;
  const filePath = path.join(
    process.cwd(),
    "public",
    "exercises",
    "data",
    "exercises.json",
  );
  const raw = fs.readFileSync(filePath, "utf8");
  cache = JSON.parse(raw) as ExerciseRecord[];
  return cache;
}

function toSummary(ex: ExerciseRecord): ExerciseSummary {
  return {
    id: ex.id,
    name: ex.name,
    category: ex.category,
    equipment: ex.equipment,
    target: ex.target,
    muscle_group: ex.muscle_group,
    image: ex.image,
  };
}

export function getFilterOptions() {
  const exercises = loadExercises();
  const categories = new Set<string>();
  const equipments = new Set<string>();
  for (const ex of exercises) {
    categories.add(ex.category);
    equipments.add(ex.equipment);
  }
  return {
    categories: Array.from(categories).sort(),
    equipments: Array.from(equipments).sort(),
  };
}

export type SearchParams = {
  q?: string;
  category?: string;
  equipment?: string;
  offset?: number;
  limit?: number;
};

export function searchExercises({
  q = "",
  category = "",
  equipment = "",
  offset = 0,
  limit = 24,
}: SearchParams) {
  const exercises = loadExercises();
  const needle = q.trim().toLowerCase();

  const filtered = exercises.filter((ex) => {
    if (category && ex.category !== category) return false;
    if (equipment && ex.equipment !== equipment) return false;
    if (!needle) return true;
    return (
      ex.name.toLowerCase().includes(needle) ||
      ex.target.toLowerCase().includes(needle) ||
      ex.muscle_group.toLowerCase().includes(needle) ||
      ex.category.toLowerCase().includes(needle) ||
      ex.equipment.toLowerCase().includes(needle) ||
      ex.secondary_muscles.some((m) => m.toLowerCase().includes(needle)) ||
      ex.instructions.es.toLowerCase().includes(needle)
    );
  });

  const total = filtered.length;
  const items = filtered.slice(offset, offset + limit).map(toSummary);

  return { total, items };
}

export function getExerciseById(id: string): ExerciseDetail | null {
  const exercises = loadExercises();
  const ex = exercises.find((e) => e.id === id);
  if (!ex) return null;
  return {
    ...toSummary(ex),
    secondary_muscles: ex.secondary_muscles,
    gif_url: ex.gif_url,
    attribution: ex.attribution,
    instructions_es: ex.instructions.es,
    instruction_steps_es: ex.instruction_steps.es,
  };
}
