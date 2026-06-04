// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface Exercise {
  id: string;
  name: string;
  category: string;
}

export interface PR {
  weight: number;
  reps: number;
}

export interface WorkoutLog {
  exercise: Exercise;
  sets: number;
  reps: number;
  weight: number;
  date: string;
}

export interface ProgressDataPoint {
  week: string;
  weight: number;
  volume: number;
  oneRM: number;
}

export interface UserData {
  name: string;
  bodyWeight: number;
  unit: "kg" | "lbs";
  exercises: Exercise[];
  prs: Record<string, PR>;
  progressData: ProgressDataPoint[];
  completedDays: Record<string, boolean>;
  logs: WorkoutLog[];
}

export interface Rank {
  name: string;
  color: string;
  glow: string;
  threshold: number;
  icon: string;
}

// ─── EXERCISE LIBRARY ─────────────────────────────────────────────────────────

export const EXERCISE_LIBRARY: Record<string, Exercise[]> = {
  Chest: [
    { id: "peck_deck", name: "Peck Deck Machine Fly", category: "Chest" },
    { id: "smith_incline", name: "Smith Machine Incline Press", category: "Chest" },
    { id: "db_flat", name: "Dumbbell Flat Bench Press", category: "Chest" },
  ],
  "Shoulders & Arms": [
    { id: "cable_lateral", name: "Cable Lateral Raise", category: "Shoulders & Arms" },
    { id: "db_shoulder", name: "Dumbbell Shoulder Press", category: "Shoulders & Arms" },
    { id: "rear_delt", name: "Rear Delt Fly Machine", category: "Shoulders & Arms" },
    { id: "preacher_curl", name: "Preacher Curl", category: "Shoulders & Arms" },
    { id: "preacher_hammer", name: "Preacher Hammer Curl", category: "Shoulders & Arms" },
  ],
  "Back (Day 1)": [
    { id: "lat_pulldown", name: "Lat Pull Down", category: "Back" },
    { id: "chest_row_1", name: "Chest Supported Row", category: "Back" },
    { id: "wide_grip_row", name: "Wide Grip Row", category: "Back" },
    { id: "tricep_push", name: "Tricep Pushdown", category: "Back" },
  ],
  "Back (Day 2)": [
    { id: "close_grip_row", name: "Close Grip Row", category: "Back" },
    { id: "chest_row_2", name: "Chest Supported Row (Wide Grip)", category: "Back" },
    { id: "lat_push", name: "Lat Pushdown", category: "Back" },
  ],
  Cardio: [
    { id: "treadmill", name: "Treadmill Sprinting", category: "Cardio" },
  ],
};

// ─── RANKS ───────────────────────────────────────────────────────────────────

export const RANKS: Rank[] = [
  { name: "Bronze",   color: "#cd7f32", glow: "#cd7f3244", threshold: 0,    icon: "🥉" },
  { name: "Silver",   color: "#c0c0c0", glow: "#c0c0c044", threshold: 0.5,  icon: "🥈" },
  { name: "Gold",     color: "#ffd700", glow: "#ffd70044", threshold: 0.8,  icon: "🥇" },
  { name: "Platinum", color: "#e5e4e2", glow: "#e5e4e244", threshold: 1.0,  icon: "💠" },
  { name: "Emerald",  color: "#50c878", glow: "#50c87844", threshold: 1.25, icon: "💚" },
  { name: "Ruby",     color: "#e0115f", glow: "#e0115f44", threshold: 1.5,  icon: "❤️‍🔥" },
  { name: "Diamond",  color: "#b9f2ff", glow: "#b9f2ff44", threshold: 2.0,  icon: "💎" },
];

// ─── TRAINING SPLIT ───────────────────────────────────────────────────────────

export const SPLIT = [
  { day: "Mon", muscle: "Chest",            color: "#ef4444" },
  { day: "Tue", muscle: "Back (Day 1)",     color: "#3b82f6" },
  { day: "Wed", muscle: "Shoulders & Arms", color: "#a855f7" },
  { day: "Thu", muscle: "Back (Day 2)",     color: "#22d3ee" },
  { day: "Fri", muscle: "Chest + Cardio",   color: "#f97316" },
  { day: "Sat", muscle: "Rest",             color: "#4b5563" },
  { day: "Sun", muscle: "Rest",             color: "#4b5563" },
];

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── RANK ENGINE ─────────────────────────────────────────────────────────────

export function calcRelativeStrength(prWeight: number, bodyWeight: number): number {
  if (!bodyWeight || bodyWeight === 0) return 0;
  return prWeight / bodyWeight;
}

export function getRank(relativeStrength: number): Rank {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (relativeStrength >= r.threshold) rank = r;
  }
  return rank;
}

export function getGroupRank(
  exercises: Exercise[],
  prs: Record<string, PR>,
  bodyWeight: number
): Rank {
  if (!exercises || exercises.length === 0) return RANKS[0];
  const ratios = exercises.map((ex) => {
    const pr = prs[ex.id];
    if (!pr) return 0;
    return calcRelativeStrength(pr.weight, bodyWeight);
  });
  const avg = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  return getRank(avg);
}

export function calc1RM(weight: number, reps: number): number {
  if (!weight || !reps) return 0;
  return Math.round(weight * (1 + reps / 30));
}

// ─── MOCK PROGRESS GENERATOR ──────────────────────────────────────────────────

export function generateProgressData(
  baseWeight: number,
  weeks = 12
): ProgressDataPoint[] {
  const data: ProgressDataPoint[] = [];
  let w = baseWeight;
  for (let i = 0; i < weeks; i++) {
    w += Math.random() * 5 - 1;
    data.push({
      week: `W${i + 1}`,
      weight: Math.round(w * 10) / 10,
      volume: Math.round(1200 + i * 80 + Math.random() * 200),
      oneRM: Math.round(baseWeight * 1.1 + i * 2.5 + Math.random() * 5),
    });
  }
  return data;
}
