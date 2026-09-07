import {
  UserProfile,
  UserSettings,
  WorkoutSession,
  WorkoutSplit,
  FoodItem,
  MealLog,
  CustomRecipe,
  WaterLog,
  Supplement,
  BodyMeasurementEntry,
  StepEntry,
  HealthConnectStatus,
  AIMessage,
  PersonalRecord,
} from "../types";
import { INDIAN_FOOD_DATABASE } from "../data/foodDatabase";
import { PRESET_WORKOUT_SPLITS } from "../data/presetSplits";

const STORAGE_KEYS = {
  SETTINGS: "arogya_settings_v1",
  WORKOUT_SESSIONS: "arogya_workout_sessions_v1",
  ACTIVE_WORKOUT: "arogya_active_workout_v1",
  WORKOUT_SPLITS: "arogya_workout_splits_v1",
  CUSTOM_FOODS: "arogya_custom_foods_v1",
  MEAL_LOGS: "arogya_meal_logs_v1",
  RECIPES: "arogya_recipes_v1",
  WATER_LOGS: "arogya_water_logs_v1",
  SUPPLEMENTS: "arogya_supplements_v1",
  BODY_MEASUREMENTS: "arogya_measurements_v1",
  STEP_ENTRIES: "arogya_steps_v1",
  HEALTH_CONNECT: "arogya_health_connect_v1",
  AI_MESSAGES: "arogya_ai_messages_v1",
  PERSONAL_RECORDS: "arogya_prs_v1",
};

export const DEFAULT_SETTINGS: UserSettings = {
  profile: {
    name: "Vikram Sharma",
    age: 26,
    gender: "male",
    heightCm: 176,
    currentWeightKg: 72.5,
    targetWeightKg: 75.0,
    weightGoal: "gain",
    activityLevel: "moderate",
    calorieTarget: 2450,
    proteinTargetGrams: 140,
    carbsTargetGrams: 310,
    fatTargetGrams: 65,
    waterTargetMl: 3200,
    stepTarget: 10000,
    regionalPreference: "Rajasthan",
    isVegetarian: true,
  },
  language: "en",
  weightUnit: "kg",
  lengthUnit: "cm",
  waterUnit: "ml",
  distanceUnit: "km",
  defaultRestSec: 90,
  autoStartRestTimer: true,
  restTimerSound: true,
  restTimerVibration: true,
  trackRpe: true,
  allowAiAccessFitnessData: true,
  enableAiChatMemory: true,
  theme: "dark-neon",
  accentColor: "#E2FF31",
  visibleDashboardCards: {
    activity: true,
    nutrition: true,
    water: true,
    workout: true,
    weeklyProgress: true,
    streak: true,
    healthConnect: true,
  },
};

// Seed initial historical data for immediate rich visual charts
export function initializeSeedData(): void {
  if (typeof window === "undefined") return;

  // Initialize Settings if missing
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  }

  // Initialize Splits
  if (!localStorage.getItem(STORAGE_KEYS.WORKOUT_SPLITS)) {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_SPLITS, JSON.stringify(PRESET_WORKOUT_SPLITS));
  }

  // Initialize Supplements
  if (!localStorage.getItem(STORAGE_KEYS.SUPPLEMENTS)) {
    const seedSupplements: Supplement[] = [
      {
        id: "supp-whey",
        name: "Plant / Whey Protein Isolate",
        brand: "MuscleBlaze Biozyme",
        dosage: "1 scoop (32g - 25g protein)",
        frequency: "Daily",
        timing: "Post-Workout",
        takenToday: true,
        notes: "Mixed with 250ml water or toned milk",
      },
      {
        id: "supp-creatine",
        name: "Creatine Monohydrate",
        brand: "Creapure",
        dosage: "3-5g",
        frequency: "Daily",
        timing: "Morning",
        takenToday: true,
        notes: "Helps ATP regeneration and muscle fullness",
      },
      {
        id: "supp-vit-d",
        name: "Vitamin D3 + K2",
        brand: "Tata 1mg",
        dosage: "2000 IU",
        frequency: "Daily",
        timing: "Morning",
        takenToday: false,
        notes: "Crucial for Indian vegetarians with limited sun exposure",
      },
    ];
    localStorage.setItem(STORAGE_KEYS.SUPPLEMENTS, JSON.stringify(seedSupplements));
  }

  // Initialize PRs
  if (!localStorage.getItem(STORAGE_KEYS.PERSONAL_RECORDS)) {
    const seedPRs: PersonalRecord[] = [
      {
        id: "pr-bench",
        exerciseId: "barbell-bench-press",
        exerciseName: "Barbell Bench Press",
        maxWeightKg: 85,
        maxReps: 6,
        estimated1RMKg: 102,
        highestVolumeKg: 2450,
        achievedDate: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0],
      },
      {
        id: "pr-squat",
        exerciseId: "barbell-squat",
        exerciseName: "Barbell Back Squat",
        maxWeightKg: 110,
        maxReps: 5,
        estimated1RMKg: 128,
        highestVolumeKg: 3100,
        achievedDate: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
      },
      {
        id: "pr-deadlift",
        exerciseId: "deadlift",
        exerciseName: "Conventional Deadlift",
        maxWeightKg: 135,
        maxReps: 5,
        estimated1RMKg: 157,
        highestVolumeKg: 2025,
        achievedDate: new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0],
      },
    ];
    localStorage.setItem(STORAGE_KEYS.PERSONAL_RECORDS, JSON.stringify(seedPRs));
  }

  // Initialize Body Measurements history (last 5 weeks)
  if (!localStorage.getItem(STORAGE_KEYS.BODY_MEASUREMENTS)) {
    const now = Date.now();
    const seedMeasurements: BodyMeasurementEntry[] = [
      {
        id: "m-1",
        date: new Date(now - 28 * 86400000).toISOString().split("T")[0],
        weightKg: 70.8,
        bodyFatPercent: 16.5,
        chestCm: 99,
        waistCm: 82,
        bicepsCm: 34.5,
        thighsCm: 56,
      },
      {
        id: "m-2",
        date: new Date(now - 21 * 86400000).toISOString().split("T")[0],
        weightKg: 71.2,
        bodyFatPercent: 16.2,
        chestCm: 99.5,
        waistCm: 81.8,
        bicepsCm: 35.0,
        thighsCm: 56.5,
      },
      {
        id: "m-3",
        date: new Date(now - 14 * 86400000).toISOString().split("T")[0],
        weightKg: 71.8,
        bodyFatPercent: 16.0,
        chestCm: 100.2,
        waistCm: 81.5,
        bicepsCm: 35.4,
        thighsCm: 57.0,
      },
      {
        id: "m-4",
        date: new Date(now - 7 * 86400000).toISOString().split("T")[0],
        weightKg: 72.1,
        bodyFatPercent: 15.8,
        chestCm: 101.0,
        waistCm: 81.2,
        bicepsCm: 35.8,
        thighsCm: 57.5,
      },
      {
        id: "m-5",
        date: new Date().toISOString().split("T")[0],
        weightKg: 72.5,
        bodyFatPercent: 15.6,
        chestCm: 101.5,
        waistCm: 81.0,
        bicepsCm: 36.2,
        thighsCm: 58.0,
      },
    ];
    localStorage.setItem(STORAGE_KEYS.BODY_MEASUREMENTS, JSON.stringify(seedMeasurements));
  }

  // Initialize Steps history (last 7 days)
  if (!localStorage.getItem(STORAGE_KEYS.STEP_ENTRIES)) {
    const seedSteps: StepEntry[] = [];
    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000).toISOString().split("T")[0];
      const steps = i === 0 ? 8420 : 7500 + Math.floor(Math.random() * 4000);
      seedSteps.push({
        id: `step-${d}`,
        date: d,
        steps,
        distanceKm: +(steps * 0.00078).toFixed(2),
        caloriesBurned: Math.round(steps * 0.042),
      });
    }
    localStorage.setItem(STORAGE_KEYS.STEP_ENTRIES, JSON.stringify(seedSteps));
  }

  // Initialize Water Logs for today
  if (!localStorage.getItem(STORAGE_KEYS.WATER_LOGS)) {
    const today = new Date().toISOString().split("T")[0];
    const seedWater: WaterLog[] = [
      { id: "w-1", date: today, amountMl: 500, timestamp: Date.now() - 5 * 3600000, container: "bottle" },
      { id: "w-2", date: today, amountMl: 250, timestamp: Date.now() - 3 * 3600000, container: "glass" },
      { id: "w-3", date: today, amountMl: 750, timestamp: Date.now() - 1 * 3600000, container: "shaker" },
      { id: "w-4", date: today, amountMl: 500, timestamp: Date.now() - 30 * 60000, container: "bottle" },
    ];
    localStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(seedWater));
  }

  // Initialize Today's Meals with delicious Rajasthani and Indian items
  if (!localStorage.getItem(STORAGE_KEYS.MEAL_LOGS)) {
    const today = new Date().toISOString().split("T")[0];
    const seedMeals: MealLog[] = [
      {
        id: "m-b",
        date: today,
        mealType: "breakfast",
        items: [
          {
            id: "mi-1",
            foodId: "vegetable-dalia",
            name: "Vegetable Dalia",
            servingUnit: "katori / bowl",
            quantity: 1,
            calculatedGrams: 180,
            calories: 171,
            protein: 6.3,
            carbs: 32.4,
            fat: 2.7,
            fiber: 7.5,
          },
          {
            id: "mi-2",
            foodId: "fresh-curd",
            name: "Fresh Homemade Curd / Dahi",
            servingUnit: "katori / bowl",
            quantity: 1,
            calculatedGrams: 150,
            calories: 98,
            protein: 5.7,
            carbs: 7.0,
            fat: 5.2,
            fiber: 0,
          },
        ],
      },
      {
        id: "m-l",
        date: today,
        mealType: "lunch",
        items: [
          {
            id: "mi-3",
            foodId: "bajra-roti",
            name: "Bajra Roti (Pearl Millet Flatbread)",
            servingUnit: "roti",
            quantity: 2,
            calculatedGrams: 120,
            calories: 234,
            protein: 6.6,
            carbs: 45.6,
            fat: 3.3,
            fiber: 7.4,
          },
          {
            id: "mi-4",
            foodId: "panchmel-dal",
            name: "Panchmel Dal (5-Lentil Rajasthani Mix)",
            servingUnit: "katori / bowl",
            quantity: 1,
            calculatedGrams: 160,
            calories: 216,
            protein: 13.4,
            carbs: 31.2,
            fat: 5.1,
            fiber: 8.9,
          },
          {
            id: "mi-5",
            foodId: "ker-sangri",
            name: "Ker Sangri",
            servingUnit: "katori / bowl",
            quantity: 1,
            calculatedGrams: 100,
            calories: 165,
            protein: 7.4,
            carbs: 18.0,
            fat: 7.5,
            fiber: 8.5,
          },
          {
            id: "mi-6",
            foodId: "chaas-buttermilk",
            name: "Plain Chaas / Spiced Buttermilk",
            servingUnit: "glass",
            quantity: 1,
            calculatedGrams: 250,
            calories: 70,
            protein: 4.5,
            carbs: 6.5,
            fat: 2.5,
            fiber: 0,
          },
        ],
      },
      {
        id: "m-s",
        date: today,
        mealType: "snacks",
        items: [
          {
            id: "mi-7",
            foodId: "roasted-chana",
            name: "Roasted Chana / Bhuna Chana",
            servingUnit: "handful",
            quantity: 1,
            calculatedGrams: 35,
            calories: 126,
            protein: 6.8,
            carbs: 20.3,
            fat: 1.8,
            fiber: 5.1,
          },
        ],
      },
    ];
    localStorage.setItem(STORAGE_KEYS.MEAL_LOGS, JSON.stringify(seedMeals));
  }

  // Initialize Past Workout Sessions
  if (!localStorage.getItem(STORAGE_KEYS.WORKOUT_SESSIONS)) {
    const now = Date.now();
    const seedWorkouts: WorkoutSession[] = [
      {
        id: "ws-1",
        name: "Push Day — Chest & Triceps",
        date: new Date(now - 3 * 86400000).toISOString(),
        startTime: now - 3 * 86400000 - 3600000,
        endTime: now - 3 * 86400000,
        durationMinutes: 58,
        totalVolumeKg: 5820,
        totalSets: 17,
        totalReps: 162,
        musclesTrained: ["Chest", "Upper Chest", "Side Delts", "Triceps"],
        isCompleted: true,
        aiAnalysis: "Great intensity on the bench press! Progressive overload achieved with 85kg x 6 reps. Good chest volume.",
        exercises: [
          {
            id: "we-1",
            exerciseId: "barbell-bench-press",
            exerciseName: "Barbell Bench Press",
            targetMuscle: "Chest",
            sets: [
              { id: "s-1", setNumber: 1, type: "warmup", weight: 50, reps: 12, completed: true, restTimeSec: 90 },
              { id: "s-2", setNumber: 2, type: "working", weight: 75, reps: 8, completed: true, restTimeSec: 120 },
              { id: "s-3", setNumber: 3, type: "working", weight: 80, reps: 8, completed: true, restTimeSec: 120 },
              { id: "s-4", setNumber: 4, type: "working", weight: 85, reps: 6, completed: true, restTimeSec: 120, isPR: true },
            ],
          },
          {
            id: "we-2",
            exerciseId: "incline-dumbbell-press",
            exerciseName: "Incline Dumbbell Press",
            targetMuscle: "Upper Chest",
            sets: [
              { id: "s-5", setNumber: 1, type: "working", weight: 26, reps: 10, completed: true, restTimeSec: 90 },
              { id: "s-6", setNumber: 2, type: "working", weight: 28, reps: 8, completed: true, restTimeSec: 90 },
              { id: "s-7", setNumber: 3, type: "working", weight: 28, reps: 8, completed: true, restTimeSec: 90 },
            ],
          },
          {
            id: "we-3",
            exerciseId: "dumbbell-lateral-raise",
            exerciseName: "Dumbbell Lateral Raise",
            targetMuscle: "Side Delts",
            sets: [
              { id: "s-8", setNumber: 1, type: "working", weight: 10, reps: 15, completed: true, restTimeSec: 60 },
              { id: "s-9", setNumber: 2, type: "working", weight: 12, reps: 12, completed: true, restTimeSec: 60 },
              { id: "s-10", setNumber: 3, type: "drop", weight: 8, reps: 15, completed: true, restTimeSec: 60 },
            ],
          },
        ],
      },
      {
        id: "ws-2",
        name: "Pull Day — Lats & Biceps",
        date: new Date(now - 1 * 86400000).toISOString(),
        startTime: now - 1 * 86400000 - 3200000,
        endTime: now - 1 * 86400000,
        durationMinutes: 52,
        totalVolumeKg: 6420,
        totalSets: 16,
        totalReps: 154,
        musclesTrained: ["Lats", "Upper Back", "Biceps", "Rear Delts"],
        isCompleted: true,
        aiAnalysis: "Consistent back volume. Lat pulldown and bent-over rows showed solid rep control. Bicep peaks responded well to incline curls.",
        exercises: [
          {
            id: "we-4",
            exerciseId: "lat-pulldown",
            exerciseName: "Lat Pulldown",
            targetMuscle: "Lats",
            sets: [
              { id: "s-11", setNumber: 1, type: "working", weight: 55, reps: 10, completed: true },
              { id: "s-12", setNumber: 2, type: "working", weight: 60, reps: 10, completed: true },
              { id: "s-13", setNumber: 3, type: "working", weight: 65, reps: 8, completed: true },
            ],
          },
        ],
      },
    ];
    localStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify(seedWorkouts));
  }

  // Initialize Health Connect status
  if (!localStorage.getItem(STORAGE_KEYS.HEALTH_CONNECT)) {
    const defaultHC: HealthConnectStatus = {
      isConnected: true,
      lastSyncedTimestamp: Date.now() - 15 * 60000,
      permissionsGranted: {
        steps: true,
        exercise: true,
        distance: true,
        caloriesBurned: true,
        heartRate: true,
        weight: true,
        sleep: true,
      },
    };
    localStorage.setItem(STORAGE_KEYS.HEALTH_CONNECT, JSON.stringify(defaultHC));
  }
}

// Storage Helpers
export const StorageService = {
  // SETTINGS
  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        language: parsed.language === "hi" ? "hi" : "en",
        theme: parsed.theme === "dark" ? "dark-neon" : (parsed.theme || "dark-neon"),
        profile: { ...DEFAULT_SETTINGS.profile, ...(parsed.profile || {}) },
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },
  saveSettings(settings: UserSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // WORKOUT SESSIONS
  getWorkoutSessions(): WorkoutSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKOUT_SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveWorkoutSession(session: WorkoutSession): void {
    const list = this.getWorkoutSessions();
    const existingIndex = list.findIndex((s) => s.id === session.id);
    if (existingIndex >= 0) {
      list[existingIndex] = session;
    } else {
      list.unshift(session);
    }
    localStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify(list));
  },
  deleteWorkoutSession(id: string): void {
    const list = this.getWorkoutSessions().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify(list));
  },

  // ACTIVE WORKOUT DRAFT
  getActiveWorkout(): WorkoutSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  saveActiveWorkout(workout: WorkoutSession | null): void {
    if (workout) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(workout));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    }
  },

  // WORKOUT SPLITS
  getWorkoutSplits(): WorkoutSplit[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKOUT_SPLITS);
      if (!data) return PRESET_WORKOUT_SPLITS;
      const storedSplits: WorkoutSplit[] = JSON.parse(data);
      const has6Day = storedSplits.some((s) => s.id === "ppl-6day-hypertrophy");
      if (!has6Day) {
        const customSplits = storedSplits.filter((s) => s.isCustom);
        const merged = [...PRESET_WORKOUT_SPLITS, ...customSplits];
        localStorage.setItem(STORAGE_KEYS.WORKOUT_SPLITS, JSON.stringify(merged));
        return merged;
      }
      return storedSplits;
    } catch {
      return PRESET_WORKOUT_SPLITS;
    }
  },
  saveWorkoutSplits(splits: WorkoutSplit[]): void {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_SPLITS, JSON.stringify(splits));
  },

  // FOODS & RECIPES
  getAllFoods(): FoodItem[] {
    try {
      const custom = localStorage.getItem(STORAGE_KEYS.CUSTOM_FOODS);
      const customFoods: FoodItem[] = custom ? JSON.parse(custom) : [];
      return [...INDIAN_FOOD_DATABASE, ...customFoods];
    } catch {
      return INDIAN_FOOD_DATABASE;
    }
  },
  saveCustomFood(food: FoodItem): void {
    const custom = localStorage.getItem(STORAGE_KEYS.CUSTOM_FOODS);
    const customFoods: FoodItem[] = custom ? JSON.parse(custom) : [];
    customFoods.unshift(food);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FOODS, JSON.stringify(customFoods));
  },
  getRecipes(): CustomRecipe[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECIPES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveRecipe(recipe: CustomRecipe): void {
    const recipes = this.getRecipes();
    const idx = recipes.findIndex((r) => r.id === recipe.id);
    if (idx >= 0) recipes[idx] = recipe;
    else recipes.unshift(recipe);
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
  },

  // MEAL LOGS
  getMealLogs(dateStr?: string): MealLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEAL_LOGS);
      const all: MealLog[] = data ? JSON.parse(data) : [];
      if (dateStr) {
        return all.filter((m) => m.date === dateStr);
      }
      return all;
    } catch {
      return [];
    }
  },
  saveMealLog(mealLog: MealLog): void {
    const all = this.getMealLogs();
    const idx = all.findIndex((m) => m.id === mealLog.id);
    if (idx >= 0) all[idx] = mealLog;
    else all.push(mealLog);
    localStorage.setItem(STORAGE_KEYS.MEAL_LOGS, JSON.stringify(all));
  },
  deleteMealLog(id: string): void {
    const all = this.getMealLogs().filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEAL_LOGS, JSON.stringify(all));
  },

  // WATER LOGS
  getWaterLogs(dateStr?: string): WaterLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WATER_LOGS);
      const all: WaterLog[] = data ? JSON.parse(data) : [];
      if (dateStr) {
        return all.filter((w) => w.date === dateStr);
      }
      return all;
    } catch {
      return [];
    }
  },
  addWaterLog(log: WaterLog): void {
    const all = this.getWaterLogs();
    all.push(log);
    localStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(all));
  },
  removeWaterLog(id: string): void {
    const all = this.getWaterLogs().filter((w) => w.id !== id);
    localStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(all));
  },

  // SUPPLEMENTS
  getSupplements(): Supplement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUPPLEMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveSupplements(supplements: Supplement[]): void {
    localStorage.setItem(STORAGE_KEYS.SUPPLEMENTS, JSON.stringify(supplements));
  },

  // MEASUREMENTS
  getBodyMeasurements(): BodyMeasurementEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BODY_MEASUREMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveBodyMeasurement(entry: BodyMeasurementEntry): void {
    const list = this.getBodyMeasurements();
    const idx = list.findIndex((m) => m.date === entry.date);
    if (idx >= 0) list[idx] = entry;
    else list.push(entry);
    list.sort((a, b) => a.date.localeCompare(b.date));
    localStorage.setItem(STORAGE_KEYS.BODY_MEASUREMENTS, JSON.stringify(list));
  },

  // STEPS
  getStepEntries(): StepEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STEP_ENTRIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveStepEntry(entry: StepEntry): void {
    const list = this.getStepEntries();
    const idx = list.findIndex((s) => s.date === entry.date);
    if (idx >= 0) list[idx] = entry;
    else list.push(entry);
    list.sort((a, b) => a.date.localeCompare(b.date));
    localStorage.setItem(STORAGE_KEYS.STEP_ENTRIES, JSON.stringify(list));
  },

  // HEALTH CONNECT
  getHealthConnectStatus(): HealthConnectStatus {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HEALTH_CONNECT);
      return data
        ? JSON.parse(data)
        : {
            isConnected: false,
            permissionsGranted: {
              steps: false,
              exercise: false,
              distance: false,
              caloriesBurned: false,
              heartRate: false,
              weight: false,
              sleep: false,
            },
          };
    } catch {
      return {
        isConnected: false,
        permissionsGranted: {
          steps: false,
          exercise: false,
          distance: false,
          caloriesBurned: false,
          heartRate: false,
          weight: false,
          sleep: false,
        },
      };
    }
  },
  saveHealthConnectStatus(status: HealthConnectStatus): void {
    localStorage.setItem(STORAGE_KEYS.HEALTH_CONNECT, JSON.stringify(status));
  },

  // PERSONAL RECORDS
  getPersonalRecords(): PersonalRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PERSONAL_RECORDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  savePersonalRecords(prs: PersonalRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.PERSONAL_RECORDS, JSON.stringify(prs));
  },
  updatePersonalRecord(pr: PersonalRecord): void {
    const list = this.getPersonalRecords();
    const idx = list.findIndex((p) => p.exerciseId === pr.exerciseId);
    if (idx >= 0) {
      list[idx] = pr;
    } else {
      list.push(pr);
    }
    localStorage.setItem(STORAGE_KEYS.PERSONAL_RECORDS, JSON.stringify(list));
  },

  // WORKOUT SESSIONS & HISTORY ALIASES
  getWorkoutHistory(): WorkoutSession[] {
    return this.getWorkoutSessions();
  },
  saveWorkoutHistory(sessions: WorkoutSession[]): void {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify(sessions));
  },

  // MEAL & WATER LOG ARRAY SAVERS
  saveMealLogs(logs: MealLog[]): void {
    localStorage.setItem(STORAGE_KEYS.MEAL_LOGS, JSON.stringify(logs));
  },
  saveWaterLogs(logs: WaterLog[]): void {
    localStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(logs));
  },
  saveBodyMeasurements(entries: BodyMeasurementEntry[]): void {
    localStorage.setItem(STORAGE_KEYS.BODY_MEASUREMENTS, JSON.stringify(entries));
  },

  // AI MESSAGES & CHAT ALIASES
  getAiMessages(): AIMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AI_MESSAGES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  getAIChatHistory(): AIMessage[] {
    return this.getAiMessages();
  },
  saveAiMessages(msgs: AIMessage[]): void {
    localStorage.setItem(STORAGE_KEYS.AI_MESSAGES, JSON.stringify(msgs));
  },
  saveAIChatHistory(msgs: AIMessage[]): void {
    this.saveAiMessages(msgs);
  },
  clearAiMessages(): void {
    localStorage.removeItem(STORAGE_KEYS.AI_MESSAGES);
  },

  // BACKUP & RESTORE
  exportFullBackupJSON(): string {
    const backup = {
      version: 1,
      exportTimestamp: new Date().toISOString(),
      settings: this.getSettings(),
      workoutSessions: this.getWorkoutSessions(),
      splits: this.getWorkoutSplits(),
      mealLogs: this.getMealLogs(),
      waterLogs: this.getWaterLogs(),
      supplements: this.getSupplements(),
      bodyMeasurements: this.getBodyMeasurements(),
      stepEntries: this.getStepEntries(),
      personalRecords: this.getPersonalRecords(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackupJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.settings) this.saveSettings(data.settings);
      if (data.workoutSessions) localStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify(data.workoutSessions));
      if (data.splits) this.saveWorkoutSplits(data.splits);
      if (data.mealLogs) localStorage.setItem(STORAGE_KEYS.MEAL_LOGS, JSON.stringify(data.mealLogs));
      if (data.waterLogs) localStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(data.waterLogs));
      if (data.supplements) this.saveSupplements(data.supplements);
      if (data.bodyMeasurements) localStorage.setItem(STORAGE_KEYS.BODY_MEASUREMENTS, JSON.stringify(data.bodyMeasurements));
      if (data.stepEntries) localStorage.setItem(STORAGE_KEYS.STEP_ENTRIES, JSON.stringify(data.stepEntries));
      if (data.personalRecords) localStorage.setItem(STORAGE_KEYS.PERSONAL_RECORDS, JSON.stringify(data.personalRecords));
      return true;
    } catch (e) {
      console.error("Failed to import backup:", e);
      return false;
    }
  },

  exportWorkoutsCSV(): string {
    const workouts = this.getWorkoutSessions();
    const rows = [
      ["Date", "Workout Name", "Duration (min)", "Total Sets", "Total Reps", "Total Volume (kg)", "Muscles Trained"].join(","),
    ];
    workouts.forEach((w) => {
      rows.push(
        [
          w.date.split("T")[0],
          `"${w.name.replace(/"/g, '""')}"`,
          w.durationMinutes,
          w.totalSets,
          w.totalReps,
          w.totalVolumeKg,
          `"${w.musclesTrained.join(", ")}"`,
        ].join(",")
      );
    });
    return rows.join("\n");
  },
};
