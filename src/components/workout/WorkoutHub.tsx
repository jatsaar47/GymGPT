import React, { useState } from "react";
import {
  WorkoutSession,
  WorkoutSplit,
  WorkoutDay,
  PersonalRecord,
  AppLanguage,
} from "../../types";
import {
  Plus,
  Play,
  Calendar,
  Clock,
  Dumbbell,
  Flame,
  Award,
  Layers,
  MapPin,
  ChevronRight,
  Sparkles,
  Search,
} from "lucide-react";
import { MuscleMapModal } from "./MuscleMapModal";
import { WorkoutSplitPlanner } from "./WorkoutSplitPlanner";
import { translations, getTranslations } from "../../utils/i18n";

interface WorkoutHubProps {
  splits: WorkoutSplit[];
  workoutHistory: WorkoutSession[];
  personalRecords: PersonalRecord[];
  onStartEmptyWorkout: () => void;
  onStartSplitDay: (split: WorkoutSplit, day: WorkoutDay) => void;
  onSaveSplits: (splits: WorkoutSplit[]) => void;
  language?: AppLanguage;
}

export const WorkoutHub: React.FC<WorkoutHubProps> = ({
  splits,
  workoutHistory,
  personalRecords,
  onStartEmptyWorkout,
  onStartSplitDay,
  onSaveSplits,
  language = "en",
}) => {
  const dict = getTranslations(language);
  const isHindi = language === "hi";
  const tW = dict.workout;

  const [activeTab, setActiveTab] = useState<"routines" | "history" | "prs">("routines");
  const [showMuscleMap, setShowMuscleMap] = useState(false);
  const [showSplitPlanner, setShowSplitPlanner] = useState(false);

  const activeSplit = splits.find((s) => s.isActive) || splits[0];

  return (
    <div className="space-y-4 pb-24 text-[#F5F5F5]">
      {/* Top Banner & Quick Start */}
      <div className="bg-[#121212] border border-[#1A1A1A] rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#E2FF31]">Workout Tracker</span>
            <h2 className="text-xl font-serif italic text-[#F5F5F5] font-semibold">Log Training Session</h2>
            <p className="text-xs text-gray-500">Track sets, reps, weight, RPE and progressive overload</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#E2FF31]/15 text-[#E2FF31] flex items-center justify-center">
            <Dumbbell className="w-5 h-5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onStartEmptyWorkout}
            className="py-2.5 px-4 bg-[#E2FF31] hover:brightness-110 text-[#080808] font-bold text-xs rounded-full flex items-center justify-center gap-1.5 shadow-md shadow-[#E2FF31]/20 uppercase tracking-wider transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Empty Workout</span>
          </button>
          <button
            onClick={() => setShowMuscleMap(true)}
            className="py-2.5 px-4 bg-[#181818] hover:bg-[#222] text-[#F5F5F5] font-semibold text-xs rounded-full flex items-center justify-center gap-1.5 border border-[#222] hover:border-[#E2FF31]/40 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-[#E2FF31]" />
            <span>Muscle Anatomy</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher: Routines, History, PRs */}
      <div className="flex bg-[#121212] p-1.5 rounded-2xl border border-[#1A1A1A]">
        <button
          onClick={() => setActiveTab("routines")}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === "routines" ? "bg-[#181818] text-[#E2FF31] font-bold border border-[#222]" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          {tW.activeSplit}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === "history" ? "bg-[#181818] text-[#E2FF31] font-bold border border-[#222]" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          {tW.history} ({workoutHistory.length})
        </button>
        <button
          onClick={() => setActiveTab("prs")}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === "prs" ? "bg-[#181818] text-[#E2FF31] font-bold border border-[#222]" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          {tW.prs}
        </button>
      </div>

      {/* TAB 1: ACTIVE ROUTINES */}
      {activeTab === "routines" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-sm font-serif italic text-[#F5F5F5]">{activeSplit?.name || "Active Split"}</h3>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider">Select today's scheduled workout day</p>
            </div>
            <button
              onClick={() => setShowSplitPlanner(true)}
              className="text-xs text-[#E2FF31] hover:underline flex items-center gap-1 font-bold uppercase tracking-wider"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Change Split</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {activeSplit?.days.map((day) => (
              <div
                key={day.id}
                className={`p-4 rounded-3xl border transition-colors ${
                  day.isRestDay
                    ? "bg-[#121212]/50 border-[#1A1A1A] text-neutral-600"
                    : "bg-[#121212] border-[#1A1A1A] hover:border-[#222] text-[#F5F5F5] shadow-lg"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-base font-serif italic text-[#F5F5F5]">{day.dayName}</h4>
                    {!day.isRestDay ? (
                      <p className="text-xs text-[#E2FF31] font-medium">
                        {day.targetMuscles.join(" • ")}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">Rest &amp; active recovery</p>
                    )}
                  </div>

                  {!day.isRestDay && (
                    <button
                      onClick={() => onStartSplitDay(activeSplit, day)}
                      className="px-4 py-1.5 bg-[#E2FF31] hover:brightness-110 text-[#080808] font-bold rounded-full text-xs flex items-center gap-1 transition-colors shadow-md shadow-[#E2FF31]/20 uppercase tracking-wider"
                    >
                      <Play className="w-3 h-3 fill-[#080808]" />
                      <span>Start</span>
                    </button>
                  )}
                </div>

                {!day.isRestDay && (
                  <div className="pt-2.5 border-t border-[#1A1A1A] flex items-center justify-between text-xs text-gray-400">
                    <span>{day.exercises.length} Exercises Planned</span>
                    <span className="font-mono text-gray-500">
                      {day.exercises.reduce((acc, curr) => acc + curr.targetSets, 0)} Total Sets
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: WORKOUT HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-3">
          {workoutHistory.length === 0 ? (
            <div className="p-8 text-center bg-[#121212] border border-[#1A1A1A] rounded-3xl space-y-2">
              <Dumbbell className="w-8 h-8 text-neutral-700 mx-auto" />
              <p className="text-sm font-semibold text-neutral-300">No logged workouts yet</p>
              <p className="text-xs text-neutral-500">Complete a workout to view full set breakdown and volume trends.</p>
            </div>
          ) : (
            workoutHistory.map((workout) => (
              <div
                key={workout.id}
                className="bg-[#121212] border border-[#1A1A1A] rounded-3xl p-4.5 shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-mono text-gray-500">
                      {new Date(workout.date).toLocaleDateString("en-IN", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <h4 className="text-base font-serif italic text-[#F5F5F5]">{workout.name}</h4>
                    <p className="text-xs text-[#E2FF31] font-medium">{workout.musclesTrained.join(" • ")}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-serif font-bold text-[#E2FF31]">{workout.totalVolumeKg} kg</span>
                    <p className="text-[10px] text-gray-500 font-mono">{workout.durationMinutes} min</p>
                  </div>
                </div>

                {/* Workout stats bar */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-[#181818] rounded-2xl border border-[#222] font-mono">
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase">Sets</span>
                    <strong className="text-neutral-200">{workout.totalSets}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase">Reps</span>
                    <strong className="text-neutral-200">{workout.totalReps}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase">Exercises</span>
                    <strong className="text-neutral-200">{workout.exercises.length}</strong>
                  </div>
                </div>

                {/* AI Analysis Note */}
                {workout.aiAnalysis && (
                  <div className="p-3 bg-[#181818] border border-[#222] rounded-2xl flex items-start gap-2.5 text-xs text-neutral-300">
                    <Sparkles className="w-3.5 h-3.5 text-[#E2FF31] shrink-0 mt-0.5" />
                    <p className="leading-snug italic">{workout.aiAnalysis}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: PERSONAL RECORDS (PRs) */}
      {activeTab === "prs" && (
        <div className="space-y-3">
          <div className="px-1">
            <h3 className="text-sm font-serif italic text-[#F5F5F5]">Hall of Personal Records</h3>
            <p className="text-[11px] text-gray-500 uppercase tracking-widest">Calculated 1RM &amp; max weight progression</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {personalRecords.map((pr) => (
              <div
                key={pr.id}
                className="p-4 bg-[#121212] border border-[#1A1A1A] rounded-3xl space-y-2.5 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#F5F5F5]">{pr.exerciseName}</span>
                  <div className="w-6 h-6 rounded-full bg-[#E2FF31]/15 text-[#E2FF31] flex items-center justify-center">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-bold font-serif text-[#F5F5F5] tracking-tight">
                      {pr.maxWeightKg} kg
                    </span>
                    <span className="text-xs text-gray-400 ml-1">× {pr.maxReps} reps</span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-serif font-bold text-[#E2FF31]">{pr.estimated1RMKg} kg</span>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Estimated 1RM</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-[#1A1A1A]">
                  <span>Volume PR: <strong className="text-neutral-300">{pr.highestVolumeKg} kg</strong></span>
                  <span>{pr.achievedDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <MuscleMapModal
        isOpen={showMuscleMap}
        onClose={() => setShowMuscleMap(false)}
        language={language}
      />

      <WorkoutSplitPlanner
        isOpen={showSplitPlanner}
        onClose={() => setShowSplitPlanner(false)}
        splits={splits}
        onSaveSplits={onSaveSplits}
        onStartSplitDay={onStartSplitDay}
      />
    </div>
  );
};
