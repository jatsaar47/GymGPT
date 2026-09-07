/**
 * GymGPT Modular AI Provider Architecture.
 *
 * All AI interactions go through this provider abstraction to ensure:
 * 1. Zero exposure of API keys on the Android client APK.
 * 2. Pluggable backend/model providers (Gemini, OpenAI, future offline LLM).
 * 3. Graceful offline-first fallback when gym connection is unavailable.
 */

export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CoachRequest {
  message: string;
  context?: any;
  userContext?: any;
  chatHistory?: AIChatMessage[];
  conversationHistory?: AIChatMessage[];
  language?: "en" | "hi";
}

export interface CoachResponse {
  reply: string;
  isFallback: boolean;
}

export interface FoodItemResult {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface ParseFoodRequest {
  text: string;
  mealType?: string;
}

export interface ParseFoodResponse {
  items: FoodItemResult[];
  mealType?: string;
  totalCalories?: number;
  totalProtein?: number;
  isFallback?: boolean;
}

export interface SplitExercise {
  name: string;
  sets: number;
  reps: string;
  restSec: number;
}

export interface SplitDay {
  dayName: string;
  targetMuscles: string[];
  exercises: SplitExercise[];
}

export interface GenerateSplitRequest {
  goal: string;
  experience: string;
  daysPerWeek: number;
  durationMin: number;
  equipment: string;
  limitations?: string;
  priorityMuscles?: string;
}

export interface GenerateSplitResponse {
  name: string;
  rationale: string;
  days: SplitDay[];
  isFallback?: boolean;
}

export interface WorkoutAnalysisRequest {
  workoutSession: any;
  previousVolume?: number;
}

export interface WorkoutAnalysisResponse {
  analysis: string;
  isFallback?: boolean;
}

export interface AIProvider {
  readonly name: string;
  chatWithCoach(req: CoachRequest): Promise<CoachResponse>;
  parseFood(req: ParseFoodRequest): Promise<ParseFoodResponse>;
  generateSplit(req: GenerateSplitRequest): Promise<GenerateSplitResponse>;
  analyzeWorkout(req: WorkoutAnalysisRequest): Promise<WorkoutAnalysisResponse>;
}

/**
 * Gemini Server-Proxied Implementation.
 * Secures the GEMINI_API_KEY on the backend server, shielding Android APK decompilation.
 */
export class GeminiServerProvider implements AIProvider {
  readonly name = "Gemini AI (Server-Proxied)";

  private getBaseUrl(): string {
    // In web and production builds, use relative URL or configured API base
    if (typeof window !== "undefined") {
      const customBase = (import.meta as any).env?.VITE_API_BASE_URL;
      if (customBase) return customBase.replace(/\/$/, "");
    }
    return "";
  }

  async chatWithCoach(req: CoachRequest): Promise<CoachResponse> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/gemini/coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn("GymGPT AI Coach Offline Fallback:", err);
      const isHi = req.language === "hi";
      return {
        reply: isHi
          ? `नमस्ते! GymGPT इस समय ऑफलाइन मोड में काम कर रहा है।\n\n- **पोषण**: प्रोटीन लक्ष्य (1.6g-2g प्रति किग्रा) पूरा करने के लिए पनीर, अंकुरित मूंग, भुना चना और दही का सेवन करें।\n- **प्रोग्रेसिव ओवरलोड**: पिछले वर्कआउट से 1 रेप या 2.5kg वजन बढ़ाने पर ध्यान दें।\n- **रिकवरी**: 7-8 घंटे की नींद लें और पर्याप्त पानी पिएं।`
          : `Hello! GymGPT is running in offline-first mode.\n\n- **Progressive Overload**: Focus on adding 1 rep or +2.5kg to your working compound sets today.\n- **Indian Vegetarian Nutrition**: Prioritize paneer, Greek curd, sattu, roasted chana, and sprouted moong to secure your 1.6-2.0g/kg protein target.\n- **Recovery**: Rest 2-3 minutes between heavy sets and hydrate well!`,
        isFallback: true,
      };
    }
  }

  async parseFood(req: ParseFoodRequest): Promise<ParseFoodResponse> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/gemini/parse-food`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn("GymGPT Parse Food Offline Fallback:", err);
      return {
        items: [
          {
            name: req.text || "Custom Indian Food",
            quantity: 1,
            unit: "serving",
            calories: 320,
            protein: 14,
            carbs: 42,
            fat: 7,
            fiber: 6,
          },
        ],
        mealType: req.mealType || "lunch",
        totalCalories: 320,
        totalProtein: 14,
        isFallback: true,
      };
    }
  }

  async generateSplit(req: GenerateSplitRequest): Promise<GenerateSplitResponse> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/gemini/generate-split`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn("GymGPT Generate Split Offline Fallback:", err);
      return {
        name: `${req.daysPerWeek || 4}-Day Progressive Overload Split`,
        rationale: "Engineered for optimal hypertrophy, joint recovery, and progressive overload pacing.",
        days: [
          {
            dayName: "Day 1 - Chest & Triceps (Push)",
            targetMuscles: ["Chest", "Triceps", "Front delts"],
            exercises: [
              { name: "Barbell Bench Press", sets: 4, reps: "8-10", restSec: 120 },
              { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", restSec: 90 },
              { name: "Cable Chest Fly", sets: 3, reps: "12-15", restSec: 60 },
              { name: "Rope Triceps Pushdown", sets: 4, reps: "12-15", restSec: 60 },
            ],
          },
          {
            dayName: "Day 2 - Back & Biceps (Pull)",
            targetMuscles: ["Lats", "Upper back", "Biceps"],
            exercises: [
              { name: "Lat Pulldown / Pull-ups", sets: 4, reps: "8-10", restSec: 90 },
              { name: "Barbell Bent-Over Row", sets: 4, reps: "8-10", restSec: 90 },
              { name: "Face Pull", sets: 3, reps: "15", restSec: 60 },
              { name: "Dumbbell Bicep Curl", sets: 4, reps: "10-12", restSec: 60 },
            ],
          },
          {
            dayName: "Day 3 - Legs & Core",
            targetMuscles: ["Quads", "Hamstrings", "Glutes", "Calves"],
            exercises: [
              { name: "Barbell Back Squat", sets: 4, reps: "8-10", restSec: 120 },
              { name: "Romanian Deadlift", sets: 3, reps: "10-12", restSec: 90 },
              { name: "Leg Press", sets: 3, reps: "12-15", restSec: 90 },
              { name: "Standing Calf Raise", sets: 4, reps: "15", restSec: 60 },
            ],
          },
          {
            dayName: "Day 4 - Shoulders & Arms",
            targetMuscles: ["Delts", "Biceps", "Triceps"],
            exercises: [
              { name: "Overhead Dumbbell Press", sets: 4, reps: "8-10", restSec: 90 },
              { name: "Dumbbell Lateral Raise", sets: 4, reps: "12-15", restSec: 60 },
              { name: "Incline Dumbbell Curl", sets: 3, reps: "10-12", restSec: 60 },
              { name: "Close-Grip Bench Press", sets: 3, reps: "10-12", restSec: 90 },
            ],
          },
        ],
        isFallback: true,
      };
    }
  }

  async analyzeWorkout(req: WorkoutAnalysisRequest): Promise<WorkoutAnalysisResponse> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/gemini/workout-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn("GymGPT Workout Analysis Offline Fallback:", err);
      return {
        analysis: `Solid session! You completed ${req.workoutSession?.exercises?.length || 4} exercises. Prioritize hydration and take 30-40g protein (paneer bhurji, curd, or protein shake) within 2 hours to optimize muscle repair.`,
        isFallback: true,
      };
    }
  }
}

// Default singleton instance using Gemini Server Provider
export const defaultAIProvider: AIProvider = new GeminiServerProvider();
