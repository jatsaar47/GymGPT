import React, { useState } from "react";
import {
  UserProfile,
  UserSettings,
  MealLog,
  WaterLog,
  StepEntry,
  WorkoutSession,
  HealthConnectStatus,
} from "../../types";
import {
  Flame,
  Footprints,
  Droplet,
  Dumbbell,
  Calendar,
  Sparkles,
  Plus,
  ArrowRight,
  SlidersHorizontal,
  ChevronRight,
  Heart,
  Moon,
  Trophy,
} from "lucide-react";
import { translations, getTranslations } from "../../utils/i18n";

interface HomeDashboardProps {
  settings: UserSettings;
  mealLogs: MealLog[];
  waterLogs: WaterLog[];
  stepEntries: StepEntry[];
  workoutSessions: WorkoutSession[];
  healthConnect: HealthConnectStatus;
  onNavigateTab: (tab: "home" | "workout" | "nutrition" | "progress" | "coach") => void;
  onQuickAddWater: (amountMl: number) => void;
  onStartWorkout: () => void;
  onOpenFoodSearch: (mealType?: string) => void;
  onOpenSettings: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  settings,
  mealLogs,
  waterLogs,
  stepEntries,
  workoutSessions,
  healthConnect,
  onNavigateTab,
  onQuickAddWater,
  onStartWorkout,
  onOpenFoodSearch,
  onOpenSettings,
}) => {
  const dict = getTranslations(settings?.language);
  const lang = settings?.language === "hi" ? "hi" : "en";
  const isHindi = lang === "hi";
  const tHome = dict.home;
  const common = dict.common;

  const [showCardCustomizer, setShowCardCustomizer] = useState(false);
  const [visibleCards, setVisibleCards] = useState(settings.visibleDashboardCards);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayMeals = mealLogs.filter((m) => m.date === todayStr);
  const todayWater = waterLogs.filter((w) => w.date === todayStr);
  const totalWaterMl = todayWater.reduce((acc, curr) => acc + curr.amountMl, 0);

  const todayStepsEntry = stepEntries.find((s) => s.date === todayStr) || {
    steps: 8420,
    distanceKm: 6.57,
    caloriesBurned: 354,
    date: todayStr,
    id: "step-today",
  };

  // Nutrition calculations
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;

  todayMeals.forEach((meal) => {
    meal.items.forEach((item) => {
      totalCalories += item.calories;
      totalProtein += item.protein;
      totalCarbs += item.carbs;
      totalFat += item.fat;
      totalFiber += item.fiber;
    });
  });

  const calTarget = settings.profile.calorieTarget;
  const calPercent = Math.min(Math.round((totalCalories / calTarget) * 100), 100);
  const remainingCalories = Math.max(calTarget - totalCalories, 0);

  const proteinTarget = settings.profile.proteinTargetGrams;
  const carbsTarget = settings.profile.carbsTargetGrams;
  const fatTarget = settings.profile.fatTargetGrams;

  const waterTarget = settings.profile.waterTargetMl;
  const waterPercent = Math.min(Math.round((totalWaterMl / waterTarget) * 100), 100);

  const stepsTarget = settings.profile.stepTarget;
  const stepsPercent = Math.min(Math.round((todayStepsEntry.steps / stepsTarget) * 100), 100);

  // Weekly workouts calculation
  const oneWeekAgo = Date.now() - 7 * 86400000;
  const weeklyWorkouts = workoutSessions.filter((w) => new Date(w.date).getTime() >= oneWeekAgo);

  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];
  const completedDays = [0, 1, 3, 5]; // Mon, Tue, Thu, Sat simulated completed

  return (
    <div className="space-y-4 pb-24">
      {/* Top Greeting & Status Pill */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-2xl font-serif italic tracking-tight font-semibold text-[#F5F5F5]">
            {isHindi ? `नमस्ते, ${settings.profile.name.split(" ")[0]}` : `Welcome back, ${settings.profile.name.split(" ")[0]}`}
          </h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">
            {settings.profile.regionalPreference || "Jaipur, RJ"} • {new Date().toLocaleDateString(isHindi ? "hi-IN" : "en-IN", { weekday: "short", month: "short", day: "numeric" })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              {isHindi ? "लगातार दिन" : "Streak"}
            </p>
            <p className="text-lg font-bold text-[#E2FF31] leading-none">6 Days</p>
          </div>
          <button
            onClick={() => setShowCardCustomizer(!showCardCustomizer)}
            className="w-9 h-9 rounded-full border border-neutral-800 bg-[#121212] flex items-center justify-center text-neutral-400 hover:text-[#E2FF31] hover:border-[#E2FF31]/40 transition-colors"
            title="Customize Cards"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card Customizer Drawer / Modal */}
      {showCardCustomizer && (
        <div className="p-4 bg-[#121212] border border-[#1A1A1A] rounded-3xl text-xs space-y-2.5 shadow-xl">
          <div className="flex items-center justify-between font-serif italic text-sm text-[#F5F5F5]">
            <span>Customize Dashboard Cards</span>
            <button
              onClick={() => setShowCardCustomizer(false)}
              className="text-[#E2FF31] font-sans text-xs uppercase tracking-wider font-bold hover:underline"
            >
              Done
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-neutral-300">
            {Object.keys(visibleCards).map((cardKey) => (
              <label key={cardKey} className="flex items-center gap-2 cursor-pointer capitalize">
                <input
                  type="checkbox"
                  checked={(visibleCards as any)[cardKey]}
                  onChange={(e) =>
                    setVisibleCards({ ...visibleCards, [cardKey]: e.target.checked })
                  }
                  className="rounded accent-[#E2FF31]"
                />
                <span className="text-xs text-gray-400">{cardKey.replace(/([A-Z])/g, " $1")}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* TODAY'S ACTIVITY CARD (Health Connect / Steps) */}
      {visibleCards.activity && (
        <section className="bg-[#121212] border border-[#1A1A1A] rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">Daily Steps • Pedometer</p>
            <span className="text-xs font-semibold text-[#E2FF31] bg-[#E2FF31]/10 px-2.5 py-0.5 rounded-full border border-[#E2FF31]/20">
              {stepsPercent}%
            </span>
          </div>

          <div className="flex items-baseline space-x-2 mb-3">
            <span className="text-3xl font-bold font-serif text-[#F5F5F5]">
              {todayStepsEntry.steps.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500 font-sans">/ {stepsTarget.toLocaleString()}</span>
          </div>

          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mb-3">
            <div
              className="bg-[#E2FF31] h-full rounded-full transition-all duration-700"
              style={{ width: `${stepsPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-[#1A1A1A]">
            <div className="flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5 text-[#E2FF31]" />
              <span><strong className="text-[#F5F5F5]">{todayStepsEntry.distanceKm}</strong> km walked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span><strong className="text-[#F5F5F5]">{todayStepsEntry.caloriesBurned}</strong> kcal burned</span>
            </div>
          </div>
        </section>
      )}

      {/* NUTRITION & MACROS CARD */}
      {visibleCards.nutrition && (
        <section className="bg-[#121212] border border-[#1A1A1A] rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Nutrition • Vegetarian</p>
              <h3 className="text-base font-serif italic text-[#F5F5F5]">Rajasthani &amp; Indian Diet</h3>
            </div>

            <button
              onClick={() => onOpenFoodSearch("lunch")}
              className="flex items-center gap-1 text-xs font-bold text-[#080808] bg-[#E2FF31] hover:brightness-110 px-3.5 py-1.5 rounded-full uppercase tracking-wider transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Food</span>
            </button>
          </div>

          {/* Calorie Stats */}
          <div className="grid grid-cols-3 gap-2.5 mb-4 text-center">
            <div className="p-3 bg-[#181818] rounded-2xl border border-[#222]">
              <p className="text-[10px] uppercase tracking-widest text-gray-500">Consumed</p>
              <p className="text-xl font-bold text-[#F5F5F5] font-serif">{Math.round(totalCalories)}</p>
              <p className="text-[10px] text-gray-500">kcal</p>
            </div>
            <div className="p-3 bg-[#181818] rounded-2xl border border-[#E2FF31]/40">
              <p className="text-[10px] uppercase tracking-widest text-[#E2FF31]">Remaining</p>
              <p className="text-xl font-bold text-[#E2FF31] font-serif">{Math.round(remainingCalories)}</p>
              <p className="text-[10px] text-gray-500">kcal</p>
            </div>
            <div className="p-3 bg-[#181818] rounded-2xl border border-[#222]">
              <p className="text-[10px] uppercase tracking-widest text-gray-500">Target</p>
              <p className="text-xl font-bold text-[#F5F5F5] font-serif">{calTarget}</p>
              <p className="text-[10px] text-gray-500">kcal</p>
            </div>
          </div>

          {/* Macro Progress Bars */}
          <div className="space-y-3">
            {/* Protein */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">
                  Protein <span className="text-[10px] text-gray-500">(Paneer, Soya, Dal, Curd)</span>
                </span>
                <span className="font-mono text-[#E2FF31] font-semibold">
                  {Math.round(totalProtein)} / {proteinTarget} g
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#E2FF31] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalProtein / proteinTarget) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">
                  Carbs <span className="text-[10px] text-gray-500">(Bajra, Roti, Rice)</span>
                </span>
                <span className="font-mono text-amber-400 font-semibold">
                  {Math.round(totalCarbs)} / {carbsTarget} g
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalCarbs / carbsTarget) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Fats */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">
                  Healthy Fats <span className="text-[10px] text-gray-500">(Ghee, Nuts, Dairy)</span>
                </span>
                <span className="font-mono text-cyan-400 font-semibold">
                  {Math.round(totalFat)} / {fatTarget} g
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalFat / fatTarget) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TODAY'S WORKOUT CARD */}
      {visibleCards.workout && (
        <section className="bg-[#121212] border border-[#1A1A1A] rounded-3xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-serif italic text-[#F5F5F5]">Today's Session: Push A</h2>
              <p className="text-xs text-gray-500 mt-0.5">Hypertrophy • Chest, Shoulders, Triceps</p>
            </div>
            <button
              onClick={onStartWorkout}
              className="bg-[#E2FF31] text-[#080808] px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-md shadow-[#E2FF31]/20"
            >
              {tHome.startWorkout}
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3.5 bg-[#181818] rounded-2xl border border-[#222]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center font-bold text-gray-400 text-xs font-mono">
                  01
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F5F5F5]">Barbell Bench Press</p>
                  <p className="text-xs text-gray-500">4 Sets • 8-12 Reps</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 italic">Last: 85kg x 10</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#181818] rounded-2xl border border-[#222]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center font-bold text-gray-400 text-xs font-mono">
                  02
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F5F5F5]">Overhead Press (Dumbbell)</p>
                  <p className="text-xs text-gray-500">3 Sets • 10-12 Reps</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 italic">Target: 22kg</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#181818] rounded-2xl border border-[#222]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center font-bold text-gray-400 text-xs font-mono">
                  03
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F5F5F5]">Lateral Raise (Cable)</p>
                  <p className="text-xs text-gray-500">3 Sets • 15 Reps</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab("workout")}
                className="text-xs text-[#E2FF31] hover:underline"
              >
                +2 more
              </button>
            </div>
          </div>
        </section>
      )}

      {/* WATER HYDRATION CARD */}
      {visibleCards.water && (
        <section className="bg-[#121212] border border-[#1A1A1A] rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 uppercase tracking-widest">Hydration • Desert Climate</p>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl font-bold font-serif text-[#F5F5F5]">{(totalWaterMl / 1000).toFixed(1)}</span>
              <span className="text-xs text-gray-500">/ {(waterTarget / 1000).toFixed(1)}L</span>
            </div>
          </div>

          <div className="flex space-x-1.5 my-3">
            <div className={`h-1.5 w-full rounded-full transition-all ${waterPercent >= 33 ? "bg-[#E2FF31]" : "bg-neutral-800"}`} />
            <div className={`h-1.5 w-full rounded-full transition-all ${waterPercent >= 66 ? "bg-[#E2FF31]" : "bg-neutral-800"}`} />
            <div className={`h-1.5 w-full rounded-full transition-all ${waterPercent >= 95 ? "bg-[#E2FF31]" : "bg-neutral-800"}`} />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onQuickAddWater(250)}
              className="flex-1 py-2 bg-[#181818] hover:bg-[#222] border border-[#222] hover:border-[#E2FF31]/50 text-gray-300 rounded-2xl text-xs font-medium transition-colors"
            >
              +250 ml (Glass)
            </button>
            <button
              onClick={() => onQuickAddWater(500)}
              className="flex-1 py-2 bg-[#181818] hover:bg-[#222] border border-[#222] hover:border-[#E2FF31]/50 text-gray-300 rounded-2xl text-xs font-medium transition-colors"
            >
              +500 ml (Bottle)
            </button>
            <button
              onClick={() => onQuickAddWater(750)}
              className="flex-1 py-2 bg-[#181818] hover:bg-[#222] border border-[#222] hover:border-[#E2FF31]/50 text-gray-300 rounded-2xl text-xs font-medium transition-colors"
            >
              +750 ml (Matka)
            </button>
          </div>
        </section>
      )}

      {/* AI COACH PROMPT CARD */}
      <section className="bg-[#121212] p-5 rounded-3xl border border-[#1A1A1A] shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-serif italic text-[#F5F5F5]">
              {isHindi ? "एआई कोच परामर्श" : "AI Coach Insight"}
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab("coach")}
            className="text-xs text-[#E2FF31] hover:underline font-bold uppercase tracking-wider"
          >
            {isHindi ? "कोच से पूछें →" : "Ask Coach →"}
          </button>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed italic">
          {isHindi
            ? "\"आपके डेटा के अनुसार, आपकी अपर चेस्ट रिकवरी 94% है। आज भारी कंपाउंड एक्सरसाइज पर ध्यान दें। आपके शाकाहारी आहार में ल्यूसीन बढ़ाने हेतु पोस्ट-वर्कआउट में अतिरिक्त पनीर या भुना चना शामिल करें।\""
            : "\"Based on your data, your recovery in the upper chest is at 94%. Today's plan focus on heavy compounds. Your current vegetarian diet is slightly low on leucine; consider adding extra Paneer or roasted Chana to your post-workout meal.\""}
        </p>
      </section>

      {/* WEEKLY PROGRESS & HEALTH CONNECT RECOVERY */}
      {visibleCards.weeklyProgress && (
        <section className="bg-[#121212] border border-[#1A1A1A] rounded-3xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#E2FF31]" />
              <h3 className="text-sm font-serif italic text-[#F5F5F5]">
                {isHindi ? "साप्ताहिक निरंतरता" : "Weekly Consistency"}
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab("progress")}
              className="text-xs text-[#E2FF31] hover:underline flex items-center gap-0.5 font-medium"
            >
              <span>{isHindi ? "प्रगति देखें" : "Trends"}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Days badges */}
          <div className="flex items-center justify-between px-1">
            {daysOfWeek.map((day, idx) => {
              const isDone = completedDays.includes(idx);
              const isToday = idx === 6; // Sunday
              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-500 uppercase">{day}</span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? "bg-[#E2FF31] text-[#080808]"
                        : isToday
                        ? "border-2 border-[#E2FF31] text-[#E2FF31]"
                        : "bg-neutral-800 text-gray-500"
                    }`}
                  >
                    {isDone ? "✓" : isToday ? "•" : ""}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Health Connect Live recovery chip */}
          {healthConnect.isConnected && (
            <div className="p-3 bg-[#181818] rounded-2xl border border-[#222] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Sleep: 7h 25m (Deep 1h 45m)</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-300">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                <span>Resting HR: 62 bpm</span>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
