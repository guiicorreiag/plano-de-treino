export type SeedExercise = {
  name: string
  category: string
  instructions?: string
  safetyNotes?: string
}

export type SeedWorkoutExercise = {
  exercise: string
  sets: number
  repsMin?: number
  repsMax?: number
  durationSeconds?: number
  restSeconds: number
  notes?: string
  safetyNotes?: string
}

export type SeedWorkout = {
  code: 'A' | 'B' | 'C' | 'D' | 'E'
  name: string
  weekday: number
  optional: boolean
  description: string
  exercises: SeedWorkoutExercise[]
}

export const seedExercises: SeedExercise[] = [
  { name: 'Esteira ou bicicleta', category: 'aquecimento', instructions: 'Ritmo confortável para elevar gradualmente a temperatura corporal.' },
  { name: 'Chest press / supino máquina', category: 'peito', instructions: 'Movimento controlado, mantendo o tronco apoiado.' },
  { name: 'Puxada frontal', category: 'costas', instructions: 'Usar pegada confortável e evitar impulso do tronco.' },
  { name: 'Remada baixa sentada com apoio', category: 'costas', safetyNotes: 'Não sustentar o tronco inclinado.' },
  { name: 'Supino inclinado com halteres', category: 'peito', instructions: 'Usar carga conservadora durante a readaptação.' },
  { name: 'Elevação lateral', category: 'ombros', instructions: 'Executar sem balanço excessivo.' },
  { name: 'Rosca direta na polia', category: 'biceps' },
  { name: 'Tríceps corda', category: 'triceps' },
  { name: 'Pallof press', category: 'core', instructions: 'Resistir à rotação e manter o tronco estável.' },
  { name: 'Cardio leve/moderado', category: 'cardio', instructions: 'Respirar mais forte, mas ainda conseguir conversar.' },
  { name: 'Cadeira extensora', category: 'quadriceps' },
  { name: 'Mesa ou cadeira flexora', category: 'posteriores' },
  { name: 'Leg press 90° ou 45°', category: 'quadriceps', safetyNotes: 'Descer somente enquanto lombar e quadril permanecerem apoiados, sem retroversão excessiva da pelve.' },
  { name: 'Elevação pélvica máquina', category: 'gluteos' },
  { name: 'Abdução de quadril na polia baixa', category: 'gluteos', instructions: 'Alternativa: miniband, 2 × 15–20 por lado.' },
  { name: 'Panturrilha em máquina ou leg press', category: 'panturrilhas' },
  { name: 'Bird-dog', category: 'core', instructions: 'Priorizar controle, estabilidade e coluna neutra.' },
  { name: 'Supino inclinado máquina', category: 'peito' },
  { name: 'Remada articulada com apoio de peito', category: 'costas', safetyNotes: 'Evitar sustentação inclinada do tronco.' },
  { name: 'Peck deck / crucifixo máquina', category: 'peito' },
  { name: 'Desenvolvimento de ombros em máquina', category: 'ombros', safetyNotes: 'Usar encosto; não substituir por desenvolvimento militar pesado em pé nesta fase.' },
  { name: 'Rosca Scott máquina', category: 'biceps' },
  { name: 'Tríceps máquina ou barra na polia', category: 'triceps' },
  { name: 'Step-up baixo com apoio', category: 'quadriceps', instructions: 'Priorizar estabilidade, não altura.' },
  { name: 'Prancha lateral modificada', category: 'core', instructions: 'Inicialmente com os joelhos apoiados.' },
  { name: 'Rosca martelo com halteres', category: 'biceps' },
  { name: 'Face pull', category: 'ombros' },
]

const warmup: SeedWorkoutExercise = { exercise: 'Esteira ou bicicleta', sets: 1, durationSeconds: 480, restSeconds: 0, notes: '7–8 minutos em ritmo confortável.' }
const cardio: SeedWorkoutExercise = { exercise: 'Cardio leve/moderado', sets: 1, durationSeconds: 900, restSeconds: 0, notes: 'Ajustar de 10 a 20 minutos conforme a semana de progressão.' }

export const seedWorkouts: SeedWorkout[] = [
  {
    code: 'A', name: 'Superior 1', weekday: 1, optional: false,
    description: 'Peito, costas, ombros, braços, core e cardio.',
    exercises: [
      warmup,
      { exercise: 'Chest press / supino máquina', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90 },
      { exercise: 'Puxada frontal', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90, notes: 'Pegada neutra.' },
      { exercise: 'Remada baixa sentada com apoio', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90 },
      { exercise: 'Supino inclinado com halteres', sets: 2, repsMin: 10, repsMax: 12, restSeconds: 75 },
      { exercise: 'Elevação lateral', sets: 2, repsMin: 12, repsMax: 15, restSeconds: 60 },
      { exercise: 'Rosca direta na polia', sets: 2, repsMin: 10, repsMax: 12, restSeconds: 60 },
      { exercise: 'Tríceps corda', sets: 2, repsMin: 10, repsMax: 12, restSeconds: 60 },
      { exercise: 'Pallof press', sets: 2, repsMin: 10, repsMax: 12, restSeconds: 60, notes: 'Por lado.' },
      cardio,
    ],
  },
  {
    code: 'B', name: 'Inferior 1', weekday: 2, optional: false,
    description: 'Pernas, glúteos, estabilidade do tronco e cardio.',
    exercises: [
      warmup,
      { exercise: 'Cadeira extensora', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 75 },
      { exercise: 'Mesa ou cadeira flexora', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 75 },
      { exercise: 'Leg press 90° ou 45°', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90 },
      { exercise: 'Elevação pélvica máquina', sets: 2, repsMin: 10, repsMax: 12, restSeconds: 90 },
      { exercise: 'Abdução de quadril na polia baixa', sets: 2, repsMin: 12, repsMax: 15, restSeconds: 60, notes: 'Por perna.' },
      { exercise: 'Panturrilha em máquina ou leg press', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
      { exercise: 'Bird-dog', sets: 2, repsMin: 6, repsMax: 8, restSeconds: 45, notes: 'Por lado.' },
      cardio,
    ],
  },
  {
    code: 'C', name: 'Superior 2', weekday: 4, optional: false,
    description: 'Segundo estímulo de superiores, core e cardio.',
    exercises: [
      warmup,
      { exercise: 'Supino inclinado máquina', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90 },
      { exercise: 'Puxada frontal', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90, notes: 'Pegada confortável.' },
      { exercise: 'Remada articulada com apoio de peito', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90 },
      { exercise: 'Peck deck / crucifixo máquina', sets: 2, repsMin: 12, repsMax: 15, restSeconds: 75 },
      { exercise: 'Desenvolvimento de ombros em máquina', sets: 2, repsMin: 10, repsMax: 12, restSeconds: 75 },
      { exercise: 'Rosca Scott máquina', sets: 2, repsMin: 10, repsMax: 12, restSeconds: 60 },
      { exercise: 'Tríceps máquina ou barra na polia', sets: 2, repsMin: 10, repsMax: 12, restSeconds: 60 },
      { exercise: 'Pallof press', sets: 2, repsMin: 10, repsMax: 10, restSeconds: 60, notes: 'Por lado.' },
      cardio,
    ],
  },
  {
    code: 'D', name: 'Inferior 2', weekday: 5, optional: false,
    description: 'Segundo estímulo de inferiores com foco em estabilidade.',
    exercises: [
      warmup,
      { exercise: 'Mesa ou cadeira flexora', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 75 },
      { exercise: 'Cadeira extensora', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 75 },
      { exercise: 'Leg press 90° ou 45°', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90 },
      { exercise: 'Step-up baixo com apoio', sets: 2, repsMin: 8, repsMax: 10, restSeconds: 75, notes: 'Por perna.' },
      { exercise: 'Elevação pélvica máquina', sets: 2, repsMin: 10, repsMax: 12, restSeconds: 90 },
      { exercise: 'Panturrilha em máquina ou leg press', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60 },
      { exercise: 'Bird-dog', sets: 2, repsMin: 6, repsMax: 8, restSeconds: 45, notes: 'Por lado.' },
      { exercise: 'Prancha lateral modificada', sets: 2, durationSeconds: 20, restSeconds: 45, notes: '15–25 segundos por lado.' },
      cardio,
    ],
  },
  {
    code: 'E', name: 'Cardio + core + braços', weekday: 3, optional: true,
    description: 'Sessão opcional moderada; não substitui A/B/C/D.',
    exercises: [
      { exercise: 'Cardio leve/moderado', sets: 1, durationSeconds: 1500, restSeconds: 0, notes: '20–30 minutos. Sem HIIT no primeiro mês.' },
      { exercise: 'Rosca martelo com halteres', sets: 2, repsMin: 12, repsMax: 12, restSeconds: 60 },
      { exercise: 'Tríceps corda', sets: 2, repsMin: 12, repsMax: 12, restSeconds: 60 },
      { exercise: 'Elevação lateral', sets: 2, repsMin: 15, repsMax: 15, restSeconds: 60 },
      { exercise: 'Face pull', sets: 2, repsMin: 15, repsMax: 15, restSeconds: 60 },
      { exercise: 'Pallof press', sets: 2, repsMin: 10, repsMax: 10, restSeconds: 60, notes: 'Por lado.' },
      { exercise: 'Bird-dog', sets: 2, repsMin: 6, repsMax: 8, restSeconds: 45, notes: 'Por lado.' },
      { exercise: 'Prancha lateral modificada', sets: 2, durationSeconds: 20, restSeconds: 45, notes: '15–25 segundos por lado.' },
    ],
  },
]
