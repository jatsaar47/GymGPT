export type TabType = "home" | "workout" | "nutrition" | "progress" | "coach";

export type SetType = "warmup" | "working" | "drop" | "superset" | "giant" | "amrap" | "failure";

export type MuscleGroup =
  | "Chest"
  | "Upper Chest"
  | "Lower Chest"
  | "Lats"
  | "Upper Back"
  | "Traps"
  | "Rear Delts"
  | "Front Delts"
  | "Side Delts"
  | "Biceps"
  | "Triceps"
  | "Forearms"
  | "Arms"
  | "Shoulders"
  | "Legs"
  | "Abs"
  | "Obliques"
  | "Lower Back"
  | "Glutes"
  | "Quads"
  | "Hamstrings"
  | "Calves"
  | "Adductors"
  | "Abductors"
  | "Neck"
  | "Cardio"
  | "Full Body";

export type EquipmentType =
  | "Barbell"
  | "Dumbbell"
  | "Cable"
  | "Machine"
  | "Bodyweight"
  | "Kettlebell"
  | "Resistance Band"
  | "Cardio Machine"
  | "None";

export interface ExerciseSet {
  id: string;
  setNumber: number;
  type: SetType;
  weight: number; // in kg or lb
  weightKg?: number;
  reps: number;
  completed: boolean;
  rpe?: number; // 1-10
  restTimeSec?: number;
  isPR?: boolean;
}

export interface WorkoutExerciseItem {
  id: string;
  exerciseId: string;
  exerciseName: string;
  targetMuscle: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  sets: ExerciseSet[];
  notes?: string;
  restTimerSec?: number;
}

export type WorkoutExercise = WorkoutExerciseItem;

export interface WorkoutSession {
  id: string;
  name: string;
  date: string; // ISO date string
  startTime?: number; // timestamp
  endTime?: number;
  durationMinutes: number;
  exercises: WorkoutExerciseItem[];
  totalVolumeKg: number;
  totalSets: number;
  totalReps: number;
  musclesTrained: MuscleGroup[];
  notes?: string;
  isCompleted?: boolean;
  status?: "in_progress" | "completed" | "cancelled";
  aiAnalysis?: string;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  hindiName?: string;
  targetMuscle: MuscleGroup;
  primaryMuscle?: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: EquipmentType;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: "Strength" | "Hypertrophy" | "Cardio" | "Mobility";
  instructions: string[];
  formTips: string[];
  commonMistakes: string[];
  recommendedRepRange: string;
  recommendedRestSec: number;
}

export type Exercise = ExerciseDefinition;

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  maxWeightKg: number;
  maxReps: number;
  estimated1RMKg: number;
  highestVolumeKg: number;
  achievedDate: string;
}

export interface WorkoutSplitDay {
  id: string;
  dayName: string;
  isRestDay: boolean;
  targetMuscles: MuscleGroup[];
  exercises: {
    exerciseId: string;
    exerciseName: string;
    targetSets: number;
    targetReps: string;
    restSec: number;
  }[];
}

export type WorkoutDay = WorkoutSplitDay;

export interface WorkoutSplit {
  id: string;
  name: string;
  description: string;
  isCustom: boolean;
  isActive: boolean;
  days: WorkoutSplitDay[];
}

export interface FoodServingUnit {
  name: string; // "grams", "roti", "bowl / katori", "piece", "tablespoon", "cup", "ml"
  gramsEquivalent: number;
}

export interface FoodItem {
  id: string;
  name: string;
  hindiName: string;
  regionalOrigin?: "Rajasthan" | "Gujarat" | "Maharashtra" | "Punjab" | "South India" | "Bengal" | "Uttar Pradesh" | "Pan-India" | "Custom";
  category: "Staples & Grains" | "Dals & Pulses" | "Dairy" | "Vegetables" | "Rajasthani Specialties" | "Regional Delicacies" | "Snacks & Others";
  servingSizeGrams: number;
  standardServingUnit: string;
  servings: FoodServingUnit[];
  calories: number; // per 100g
  protein: number; // per 100g
  carbs: number; // per 100g
  fat: number; // per 100g
  fiber: number; // per 100g
  sugar?: number;
  sodium?: number;
  isCustom?: boolean;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snacks" | "pre-workout" | "post-workout";

export interface LoggedMealFood {
  id: string;
  foodId: string;
  name: string;
  servingUnit: string;
  quantity: number;
  calculatedGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface MealLog {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  items: LoggedMealFood[];
}

export interface RecipeIngredient {
  foodId: string;
  foodName: string;
  quantity: number;
  unit: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface CustomRecipe {
  id: string;
  name: string;
  servingsCount: number;
  ingredients: RecipeIngredient[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  notes?: string;
}

export interface WaterLog {
  id: string;
  date: string; // YYYY-MM-DD
  amountMl: number;
  timestamp: number;
  container: "glass" | "bottle" | "shaker" | "custom";
}

export interface Supplement {
  id: string;
  name: string;
  brand?: string;
  dosage: string;
  frequency: "Daily" | "Workout Days" | "Twice Daily" | "As Needed";
  timing: "Morning" | "Pre-Workout" | "Post-Workout" | "With Meals" | "Before Bed";
  takenToday: boolean;
  notes?: string;
}

export interface BodyMeasurementEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  bodyFatPercent?: number;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  bicepsCm?: number;
  forearmsCm?: number;
  thighsCm?: number;
  calvesCm?: number;
  neckCm?: number;
  shouldersCm?: number;
}

export interface StepEntry {
  id: string;
  date: string; // YYYY-MM-DD
  steps: number;
  distanceKm: number;
  caloriesBurned?: number;
  activeCalories?: number;
}

export interface HealthConnectStatus {
  isConnected: boolean;
  lastSyncedTimestamp?: number;
  permissionsGranted: {
    steps: boolean;
    exercise: boolean;
    distance: boolean;
    caloriesBurned: boolean;
    heartRate: boolean;
    weight: boolean;
    sleep: boolean;
  };
}

export interface UserProfile {
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  weightGoal: "lose" | "maintain" | "gain";
  activityLevel: "sedentary" | "light" | "moderate" | "very_active" | "extra_active";
  calorieTarget: number;
  proteinTargetGrams: number;
  carbsTargetGrams: number;
  fatTargetGrams: number;
  waterTargetMl: number;
  stepTarget: number;
  regionalPreference: "Rajasthan" | "Pan-India" | "Gujarat" | "Maharashtra" | "Punjab" | "South India";
  isVegetarian: boolean;
}

export type AppLanguage = "en" | "hi";
export type AppTheme = "dark-neon" | "midnight-blue" | "dark-amber" | "clean-light";

export interface UserSettings {
  profile: UserProfile;
  language: AppLanguage;
  weightUnit: "kg" | "lb";
  lengthUnit: "cm" | "in";
  waterUnit: "ml" | "oz";
  distanceUnit: "km" | "mi";
  defaultRestSec: number;
  autoStartRestTimer: boolean;
  restTimerSound: boolean;
  restTimerVibration: boolean;
  trackRpe: boolean;
  allowAiAccessFitnessData: boolean;
  enableAiChatMemory: boolean;
  theme: AppTheme | "dark" | "light" | "system";
  accentColor: string; // hex code
  visibleDashboardCards: {
    activity: boolean;
    nutrition: boolean;
    water: boolean;
    workout: boolean;
    weeklyProgress: boolean;
    streak: boolean;
    healthConnect: boolean;
  };
}

export interface AIMessage {
  id: string;
  sender?: "user" | "assistant";
  role?: "user" | "assistant";
  content?: string;
  text?: string;
  timestamp: number;
  isActionable?: boolean;
  actionData?: any;
}
