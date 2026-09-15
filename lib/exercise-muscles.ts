export const MUSCLE_GROUPS = [
  { label: "Pecho", muscles: ["chest"] },
  { label: "Espalda", muscles: ["lower back", "upper back", "rhomboids", "latissimus dorsi", "lats", "traps", "trapezius"] },
  { label: "Hombros", muscles: ["shoulders", "deltoids", "rotator cuff"] },
  { label: "Bíceps", muscles: ["biceps"] },
  { label: "Tríceps", muscles: ["triceps"] },
  { label: "Antebrazos y manos", muscles: ["forearms", "wrist flexors", "wrist extensors", "wrists", "hands"] },
  { label: "Abdomen", muscles: ["core", "abdominals", "obliques"] },
  { label: "Glúteos", muscles: ["glutes"] },
  { label: "Cuádriceps", muscles: ["quadriceps"] },
  { label: "Isquiotibiales", muscles: ["hamstrings"] },
  { label: "Cadera", muscles: ["hip flexors"] },
  { label: "Pantorrillas y tobillos", muscles: ["calves", "soleus", "ankle stabilizers", "ankles"] },
];

export function normalizeExerciseSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function muscleGroupLabel(muscle: string) {
  return MUSCLE_GROUPS.find((group) => group.muscles.includes(muscle))?.label ?? muscle;
}
