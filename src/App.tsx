import React, { useState, useEffect } from "react";
import {
  TabType,
  UserSettings,
  WorkoutSession,
  WorkoutSplit,
  WorkoutDay,
  MealLog,
  WaterLog,
  StepEntry,
  Supplement,
  BodyMeasurementEntry,
  PersonalRecord,
  HealthConnectStatus,
  AIMessage,
  FoodItem,
  MealType,
  AppLanguage,
} from "./types";
import { StorageService } from "./services/storage";
import { HealthConnectService } from "./services/healthConnect";
import { NativeBridgeService } from "./services/nativeBridge";
import { AndroidStatusBar } from "./components/layout/AndroidStatusBar";
import { BottomNavigation } from "./components/layout/BottomNavigation";
import { OfflineIndicator } from "./components/common/OfflineIndicator";
import { HomeDashboard } from "./components/home/HomeDashboard";
import { WorkoutHub } from "./components/workout/WorkoutHub";
import { NutritionHub } from "./components/nutrition/NutritionHub";
import { ProgressDashboard } from "./components/progress/ProgressDashboard";
import { AICoachScreen } from "./components/coach/AICoachScreen";
import { ActiveWorkoutModal } from "./components/workout/ActiveWorkoutModal";
import { SettingsModal } from "./components/settings/SettingsModal";
import { FoodSearchModal } from "./components/nutrition/FoodSearchModal";
import {
  X,
  Dumbbell,
  Utensils,
  Droplet,
  Scale,
  Sparkles,
  Plus,
} from "lucide-react";

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<TabType>("home");

  // Core State loaded from Local Persistence (Room/SQLite simulation)
  const [settings, setSettings] = useState<UserSettings>(() => StorageService.getSettings());
  const [splits, setSplits] = useState<WorkoutSplit[]>(() => StorageService.getWorkoutSplits());
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>(() =>
    StorageService.getWorkoutHistory()
  );
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>(() =>
    StorageService.getPersonalRecords()
  );
  const [mealLogs, setMealLogs] = useState<MealLog[]>(() => StorageService.getMealLogs());
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(() => StorageService.getWaterLogs());
  const [stepEntries, setStepEntries] = useState<StepEntry[]>(() => StorageService.getStepEntries());
  const [supplements, setSupplements] = useState<Supplement[]>(() => StorageService.getSupplements());
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurementEntry[]>(() =>
    StorageService.getBodyMeasurements()
  );
  const [healthConnect, setHealthConnect] = useState<HealthConnectStatus>(() =>
    StorageService.getHealthConnectStatus()
  );
  const [aiMessages, setAiMessages] = useState<AIMessage[]>(() => StorageService.getAIChatHistory());

  // Active Workout State
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(() =>
    StorageService.getActiveWorkout()
  );
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddFoodMeal, setQuickAddFoodMeal] = useState<MealType | null>(null);

  // Health Connect Sync state
  const [isSyncingHC, setIsSyncingHC] = useState(false);

  // Sync state to local storage whenever modified
  useEffect(() => {
    StorageService.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    StorageService.saveWorkoutSplits(splits);
  }, [splits]);

  useEffect(() => {
    StorageService.saveWorkoutHistory(workoutHistory);
  }, [workoutHistory]);

  useEffect(() => {
    StorageService.savePersonalRecords(personalRecords);
  }, [personalRecords]);

  useEffect(() => {
    StorageService.saveMealLogs(mealLogs);
  }, [mealLogs]);

  useEffect(() => {
    StorageService.saveWaterLogs(waterLogs);
  }, [waterLogs]);

  useEffect(() => {
    StorageService.saveSupplements(supplements);
  }, [supplements]);

  useEffect(() => {
    StorageService.saveBodyMeasurements(bodyMeasurements);
  }, [bodyMeasurements]);

  useEffect(() => {
    StorageService.saveHealthConnectStatus(healthConnect);
  }, [healthConnect]);

  useEffect(() => {
    StorageService.saveAIChatHistory(aiMessages);
  }, [aiMessages]);

  // Apply theme to root element
  useEffect(() => {
    const theme = settings.theme || "dark-neon";
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.className = `theme-${theme}`;
  }, [settings.theme]);

  useEffect(() => {
    StorageService.saveActiveWorkout(activeWorkout);
  }, [activeWorkout]);

  // Initialize Native Android Bridge (Status bar, Splash screen, Back button, Notifications)
  useEffect(() => {
    NativeBridgeService.init({
      onHardwareBack: () => {
        if (quickAddFoodMeal) {
          setQuickAddFoodMeal(null);
          return true;
        }
        if (isQuickAddOpen) {
          setIsQuickAddOpen(false);
          return true;
        }
        if (isWorkoutModalOpen) {
          setIsWorkoutModalOpen(false);
          return true;
        }
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
          return true;
        }
        if (currentTab !== "home") {
          setCurrentTab("home");
          return true;
        }
        return false;
      },
    });

    if (settings.notifications?.workoutReminders) {
      NativeBridgeService.scheduleWorkoutReminder(18, 0);
    }
    if (settings.notifications?.waterReminders) {
      NativeBridgeService.scheduleWaterReminder();
    }
  }, [quickAddFoodMeal, isQuickAddOpen, isWorkoutModalOpen, isSettingsOpen, currentTab, settings.notifications]);

  // Health Connect Sync Handler
  const handleSyncHealthConnect = async () => {
    setIsSyncingHC(true);
    try {
      const result = await HealthConnectService.syncData();
      setHealthConnect(result.status);
      if (result.stepsToday > 0) {
        const todayStr = new Date().toISOString().split("T")[0];
        const updatedSteps = [...stepEntries];
        const existingIdx = updatedSteps.findIndex((s) => s.date === todayStr);
        if (existingIdx >= 0) {
          updatedSteps[existingIdx].steps = result.stepsToday;
          updatedSteps[existingIdx].distanceKm = +(result.stepsToday * 0.00078).toFixed(2);
          updatedSteps[existingIdx].activeCalories = Math.round(result.stepsToday * 0.04);
        } else {
          updatedSteps.unshift({
            date: todayStr,
            steps: result.stepsToday,
            distanceKm: +(result.stepsToday * 0.00078).toFixed(2),
            activeCalories: Math.round(result.stepsToday * 0.04),
          });
        }
        setStepEntries(updatedSteps);
      }
    } finally {
      setIsSyncingHC(false);
    }
  };

  // Workout Handlers
  const handleStartEmptyWorkout = () => {
    const newSession: WorkoutSession = {
      id: `w-${Date.now()}`,
      name: "Freestyle Training",
      date: new Date().toISOString(),
      durationMinutes: 0,
      totalVolumeKg: 0,
      totalSets: 0,
      totalReps: 0,
      exercises: [],
      musclesTrained: [],
      status: "in_progress",
    };
    setActiveWorkout(newSession);
    setIsWorkoutModalOpen(true);
  };

  const handleStartSplitDay = (split: WorkoutSplit, day: WorkoutDay) => {
    const newSession: WorkoutSession = {
      id: `w-${Date.now()}`,
      name: `${split.name} - ${day.dayName}`,
      date: new Date().toISOString(),
      durationMinutes: 0,
      totalVolumeKg: 0,
      totalSets: 0,
      totalReps: 0,
      exercises: day.exercises.map((de) => ({
        id: `we-${Date.now()}-${de.exerciseId}`,
        exerciseId: de.exerciseId,
        exerciseName: de.exerciseName,
        targetMuscle: day.targetMuscles[0] || "Full Body",
        sets: Array.from({ length: de.targetSets }).map((_, idx) => ({
          id: `s-${Date.now()}-${idx}`,
          setNumber: idx + 1,
          type: "working" as const,
          weight: 0,
          weightKg: 0,
          reps: 10,
          completed: false,
        })),
      })),
      musclesTrained: day.targetMuscles,
      status: "in_progress",
    };
    setActiveWorkout(newSession);
    setIsWorkoutModalOpen(true);
  };

  const handleFinishWorkout = (completed: WorkoutSession) => {
    const updatedHistory = [completed, ...workoutHistory];
    setWorkoutHistory(updatedHistory);
    setActiveWorkout(null);
    setIsWorkoutModalOpen(false);

    // Recalculate PRs
    const updatedPRs = [...personalRecords];
    completed.exercises.forEach((ex) => {
      let maxW = 0;
      let maxR = 0;
      let totalExVol = 0;

      ex.sets.forEach((set) => {
        const w = set.weight ?? set.weightKg ?? 0;
        if (set.completed && w > 0) {
          totalExVol += w * set.reps;
          if (w > maxW) {
            maxW = w;
            maxR = set.reps;
          }
        }
      });

      if (maxW > 0) {
        const est1RM = Math.round(maxW * (1 + maxR / 30));
        const prIdx = updatedPRs.findIndex((p) => p.exerciseId === ex.exerciseId);
        if (prIdx >= 0) {
          if (est1RM > updatedPRs[prIdx].estimated1RMKg || maxW > updatedPRs[prIdx].maxWeightKg) {
            updatedPRs[prIdx] = {
              ...updatedPRs[prIdx],
              maxWeightKg: Math.max(maxW, updatedPRs[prIdx].maxWeightKg),
              maxReps: maxW >= updatedPRs[prIdx].maxWeightKg ? maxR : updatedPRs[prIdx].maxReps,
              estimated1RMKg: Math.max(est1RM, updatedPRs[prIdx].estimated1RMKg),
              highestVolumeKg: Math.max(totalExVol, updatedPRs[prIdx].highestVolumeKg),
              achievedDate: new Date().toISOString().split("T")[0],
            };
          }
        } else {
          updatedPRs.push({
            id: `pr-${Date.now()}-${ex.exerciseId}`,
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            maxWeightKg: maxW,
            maxReps: maxR,
            estimated1RMKg: est1RM,
            highestVolumeKg: totalExVol,
            achievedDate: new Date().toISOString().split("T")[0],
          });
        }
      }
    });
    setPersonalRecords(updatedPRs);
  };

  // Water Log Quick Handler
  const handleQuickAddWater = (amountMl: number) => {
    const newLog: WaterLog = {
      id: `w-${Date.now()}-${Math.random()}`,
      date: new Date().toISOString().split("T")[0],
      amountMl,
      timestamp: Date.now(),
      container: "glass",
    };
    setWaterLogs((prev) => [...prev, newLog]);
  };

  // Meal Log Handler
  const handleSaveMealLog = (log: MealLog) => {
    setMealLogs((prev) => {
      const idx = prev.findIndex((m) => m.id === log.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = log;
        return copy;
      }
      return [...prev, log];
    });
  };

  const handleDeleteMealLog = (id: string) => {
    setMealLogs((prev) => prev.filter((m) => m.id !== id));
  };

  // Backup handlers
  const handleExportJSON = () => {
    const fullBackup = {
      version: 1,
      exportDate: new Date().toISOString(),
      settings,
      splits,
      workoutHistory,
      personalRecords,
      mealLogs,
      waterLogs,
      stepEntries,
      supplements,
      bodyMeasurements,
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gymgpt-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    let csv = "Date,WorkoutName,DurationMin,TotalVolumeKg,TotalSets,TotalReps,MusclesTrained\n";
    workoutHistory.forEach((w) => {
      csv += `"${w.date}","${w.name}",${w.durationMinutes},${w.totalVolumeKg},${w.totalSets},${w.totalReps},"${w.musclesTrained.join(";")}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gymgpt-workouts-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.settings) setSettings(data.settings);
      if (data.splits) setSplits(data.splits);
      if (data.workoutHistory) setWorkoutHistory(data.workoutHistory);
      if (data.personalRecords) setPersonalRecords(data.personalRecords);
      if (data.mealLogs) setMealLogs(data.mealLogs);
      if (data.waterLogs) setWaterLogs(data.waterLogs);
      if (data.bodyMeasurements) setBodyMeasurements(data.bodyMeasurements);
      if (data.supplements) setSupplements(data.supplements);
      return true;
    } catch {
      return false;
    }
  };

  const appLang: AppLanguage = settings?.language === "hi" ? "hi" : "en";

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex justify-center transition-colors duration-200">
      <OfflineIndicator />
      {/* Mobile-first Android Container */}
      <div className="w-full max-w-md min-h-screen bg-[var(--bg-main)] flex flex-col relative shadow-2xl border-x border-[var(--card-border)] overflow-x-hidden transition-colors duration-200">
        {/* Android Status Bar */}
        <AndroidStatusBar
          healthConnect={healthConnect}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onSyncHealthConnect={handleSyncHealthConnect}
          isSyncingHC={isSyncingHC}
          language={appLang}
        />

        {/* Dynamic Screen Content */}
        <main className="flex-1 px-3 pt-3 overflow-y-auto">
          {currentTab === "home" && (
            <HomeDashboard
              settings={settings}
              mealLogs={mealLogs}
              waterLogs={waterLogs}
              stepEntries={stepEntries}
              workoutSessions={workoutHistory}
              healthConnect={healthConnect}
              onNavigateTab={(tab) => setCurrentTab(tab as TabType)}
              onQuickAddWater={handleQuickAddWater}
              onStartWorkout={handleStartEmptyWorkout}
              onOpenFoodSearch={(mealType) => {
                setQuickAddFoodMeal((mealType as MealType) || "lunch");
              }}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}

          {currentTab === "workout" && (
            <WorkoutHub
              splits={splits}
              workoutHistory={workoutHistory}
              personalRecords={personalRecords}
              onStartEmptyWorkout={handleStartEmptyWorkout}
              onStartSplitDay={handleStartSplitDay}
              onSaveSplits={(updated) => setSplits(updated)}
              language={appLang}
            />
          )}

          {currentTab === "nutrition" && (
            <NutritionHub
              settings={settings}
              mealLogs={mealLogs}
              waterLogs={waterLogs}
              supplements={supplements}
              onSaveMealLog={handleSaveMealLog}
              onDeleteMealLog={handleDeleteMealLog}
              onAddWaterLog={(w) => setWaterLogs((prev) => [...prev, w])}
              onRemoveWaterLog={(id) => setWaterLogs((prev) => prev.filter((w) => w.id !== id))}
              onSaveSupplements={(updated) => setSupplements(updated)}
              onSaveCustomFood={(food) => StorageService.saveCustomFood(food)}
            />
          )}

          {currentTab === "progress" && (
            <ProgressDashboard
              settings={settings}
              workoutSessions={workoutHistory}
              measurements={bodyMeasurements}
              personalRecords={personalRecords}
              onSaveMeasurement={(entry) => setBodyMeasurements((prev) => [...prev, entry])}
              language={appLang}
            />
          )}

          {currentTab === "coach" && (
            <AICoachScreen
              settings={settings}
              workoutSessions={workoutHistory}
              mealLogs={mealLogs}
              messages={aiMessages}
              onSendMessage={(msg) => setAiMessages((prev) => [...prev, msg])}
              onClearChat={() => setAiMessages([])}
              language={appLang}
            />
          )}
        </main>

        {/* Android Bottom Navigation with Active Workout floating banner */}
        <BottomNavigation
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          hasActiveWorkout={!!activeWorkout}
          onOpenActiveWorkout={() => setIsWorkoutModalOpen(true)}
          language={appLang}
        />

        {/* QUICK ACTION BOTTOM SHEET */}
        {isQuickAddOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center p-0">
            <div className="bg-[#121212] border-t border-[#1A1A1A] w-full max-w-md rounded-t-3xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-serif italic text-[#F5F5F5]">Quick Actions</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">GymGPT Fast Log</p>
                </div>
                <button
                  onClick={() => setIsQuickAddOpen(false)}
                  className="w-8 h-8 rounded-full border border-neutral-800 bg-[#181818] flex items-center justify-center text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    setIsQuickAddOpen(false);
                    handleStartEmptyWorkout();
                  }}
                  className="p-3.5 bg-[#181818] hover:bg-[#222] border border-[#222] hover:border-[#E2FF31]/50 rounded-2xl flex items-center gap-3 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#E2FF31]/15 text-[#E2FF31] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#F5F5F5] block">Start Workout</span>
                    <span className="text-[10px] text-gray-500">Log empty or split session</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsQuickAddOpen(false);
                    setQuickAddFoodMeal("lunch");
                  }}
                  className="p-3.5 bg-[#181818] hover:bg-[#222] border border-[#222] hover:border-[#E2FF31]/50 rounded-2xl flex items-center gap-3 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#F5F5F5] block">Log Food</span>
                    <span className="text-[10px] text-gray-500">Indian &amp; Rajasthani dishes</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    handleQuickAddWater(250);
                    setIsQuickAddOpen(false);
                  }}
                  className="p-3.5 bg-[#181818] hover:bg-[#222] border border-[#222] hover:border-[#E2FF31]/50 rounded-2xl flex items-center gap-3 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Droplet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#F5F5F5] block">+250ml Water</span>
                    <span className="text-[10px] text-gray-500">One glass hydration</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsQuickAddOpen(false);
                    setCurrentTab("coach");
                  }}
                  className="p-3.5 bg-[#181818] hover:bg-[#222] border border-[#222] hover:border-[#E2FF31]/50 rounded-2xl flex items-center gap-3 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#F5F5F5] block">Ask AI Coach</span>
                    <span className="text-[10px] text-gray-500">Vegetarian fitness advice</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE WORKOUT MODAL */}
        {isWorkoutModalOpen && activeWorkout && (
          <ActiveWorkoutModal
            workout={activeWorkout}
            onUpdateWorkout={(updated) => setActiveWorkout(updated)}
            onFinishWorkout={handleFinishWorkout}
            onCancelWorkout={() => {
              if (confirm("Discard this workout session?")) {
                setActiveWorkout(null);
                setIsWorkoutModalOpen(false);
              }
            }}
          />
        )}

        {/* SETTINGS & HEALTH CONNECT MODAL */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          healthConnect={healthConnect}
          onSaveSettings={(s) => setSettings(s)}
          onToggleHCPermission={(key) => {
            const updated = HealthConnectService.togglePermission(key);
            setHealthConnect(updated);
          }}
          onConnectHC={() => {
            const updated = HealthConnectService.connect();
            setHealthConnect(updated);
          }}
          onDisconnectHC={() => {
            const updated = HealthConnectService.disconnect();
            setHealthConnect(updated);
          }}
          onSyncHC={handleSyncHealthConnect}
          isSyncingHC={isSyncingHC}
          onExportJSON={handleExportJSON}
          onExportCSV={handleExportCSV}
          onImportJSON={handleImportJSON}
        />

        {/* QUICK FOOD SEARCH MODAL */}
        {quickAddFoodMeal && (
          <FoodSearchModal
            isOpen={true}
            mealType={quickAddFoodMeal}
            onClose={() => setQuickAddFoodMeal(null)}
            onAddFoodItem={(mealType, foodItem, qty, unit) => {
              const matchedServing = foodItem.servings.find((s) => s.name === unit);
              const gramsPerUnit = matchedServing
                ? matchedServing.gramsEquivalent
                : foodItem.servingSizeGrams;
              const totalGrams = gramsPerUnit * qty;

              const cals = Math.round((foodItem.calories * totalGrams) / 100);
              const p = +((foodItem.protein * totalGrams) / 100).toFixed(1);
              const c = +((foodItem.carbs * totalGrams) / 100).toFixed(1);
              const f = +((foodItem.fat * totalGrams) / 100).toFixed(1);

              const todayStr = new Date().toISOString().split("T")[0];
              const existingMeal = mealLogs.find(
                (m) => m.date === todayStr && m.mealType === mealType
              );

              const newItem = {
                id: `mi-${Date.now()}-${Math.random()}`,
                foodId: foodItem.id,
                name: foodItem.name,
                servingUnit: unit,
                quantity: qty,
                calculatedGrams: totalGrams,
                calories: cals,
                protein: p,
                carbs: c,
                fat: f,
                fiber: foodItem.fiber || 1,
              };

              if (existingMeal) {
                handleSaveMealLog({
                  ...existingMeal,
                  items: [...existingMeal.items, newItem],
                });
              } else {
                handleSaveMealLog({
                  id: `m-${Date.now()}`,
                  date: todayStr,
                  mealType,
                  items: [newItem],
                });
              }
              setQuickAddFoodMeal(null);
            }}
            onAddNewCustomFood={(food) => StorageService.saveCustomFood(food)}
          />
        )}
      </div>
    </div>
  );
}
