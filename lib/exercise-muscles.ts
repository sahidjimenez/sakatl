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

// Keep the original group options so existing custom exercises remain editable.
export const ASSISTING_MUSCLES = [
  ...MUSCLE_GROUPS.map(group => ({ label: group.label, value: group.muscles[0], group: group.label })),
  { label: "Pectoral mayor", value: "pectoralis major", group: "Pecho" },
  { label: "Pectoral menor", value: "pectoralis minor", group: "Pecho" },
  { label: "Dorsal ancho", value: "latissimus dorsi", group: "Espalda" },
  { label: "Trapecio", value: "trapezius", group: "Espalda" },
  { label: "Romboides", value: "rhomboids", group: "Espalda" },
  { label: "Erectores espinales", value: "erector spinae", group: "Espalda" },
  { label: "Deltoides anterior", value: "anterior deltoid", group: "Hombros" },
  { label: "Deltoides lateral", value: "lateral deltoid", group: "Hombros" },
  { label: "Deltoides posterior", value: "posterior deltoid", group: "Hombros" },
  { label: "Manguito rotador", value: "rotator cuff", group: "Hombros" },
  { label: "Serrato anterior", value: "serratus anterior", group: "Pecho" },
  { label: "Braquial", value: "brachialis", group: "Bíceps" },
  { label: "Braquiorradial", value: "brachioradialis", group: "Antebrazos y manos" },
  { label: "Flexores de la muñeca", value: "wrist flexors", group: "Antebrazos y manos" },
  { label: "Extensores de la muñeca", value: "wrist extensors", group: "Antebrazos y manos" },
  { label: "Recto abdominal", value: "rectus abdominis", group: "Abdomen" },
  { label: "Oblicuos", value: "obliques", group: "Abdomen" },
  { label: "Transverso abdominal", value: "transversus abdominis", group: "Abdomen" },
  { label: "Glúteo mayor", value: "gluteus maximus", group: "Glúteos" },
  { label: "Glúteo medio", value: "gluteus medius", group: "Glúteos" },
  { label: "Glúteo menor", value: "gluteus minimus", group: "Glúteos" },
  { label: "Aductores", value: "adductors", group: "Cadera" },
  { label: "Abductores de cadera", value: "hip abductors", group: "Cadera" },
  { label: "Iliopsoas", value: "iliopsoas", group: "Cadera" },
  { label: "Tensor de la fascia lata", value: "tensor fasciae latae", group: "Cadera" },
  { label: "Recto femoral", value: "rectus femoris", group: "Cuádriceps" },
  { label: "Vasto medial", value: "vastus medialis", group: "Cuádriceps" },
  { label: "Vasto lateral", value: "vastus lateralis", group: "Cuádriceps" },
  { label: "Bíceps femoral", value: "biceps femoris", group: "Isquiotibiales" },
  { label: "Semitendinoso", value: "semitendinosus", group: "Isquiotibiales" },
  { label: "Semimembranoso", value: "semimembranosus", group: "Isquiotibiales" },
  { label: "Gastrocnemio (gemelos)", value: "gastrocnemius", group: "Pantorrillas y tobillos" },
  { label: "Sóleo", value: "soleus", group: "Pantorrillas y tobillos" },
  { label: "Tibial anterior", value: "tibialis anterior", group: "Pantorrillas y tobillos" },
];

export function assistingMuscleLabel(value: string) {
  return ASSISTING_MUSCLES.find(muscle => muscle.value === value)?.label ?? muscleGroupLabel(value);
}

export function canAssist(label: string, primaryGroup: string) {
  return ASSISTING_MUSCLES.some(muscle => muscle.label === label && muscle.group !== primaryGroup);
}

export function normalizeExerciseSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function muscleGroupLabel(muscle: string) {
  return MUSCLE_GROUPS.find((group) => group.muscles.includes(muscle))?.label ?? muscle;
}
