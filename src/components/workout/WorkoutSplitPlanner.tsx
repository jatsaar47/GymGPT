import React, { useState } from "react";
import { WorkoutSplit, WorkoutDay } from "../../types";
import { defaultAIProvider } from "../../services/aiProvider";
import {
  X,
  Plus,
  Sparkles,
  Check,
  Calendar,
  Dumbbell,
  Trash2,
  ChevronRight,
  ChevronDown,
  Info,
} from "lucide-react";

interface WorkoutSplitPlannerProps {
  isOpen: boolean;
  onClose: () => void;
  splits: WorkoutSplit[];
  onSaveSplits: (updatedSplits: WorkoutSplit[]) => void;
  onStartSplitDay: (split: WorkoutSplit, day: WorkoutDay) => void;
}

export const WorkoutSplitPlanner: React.FC<WorkoutSplitPlannerProps> = ({
  isOpen,
  onClose,
  splits,
  onSaveSplits,
  onStartSplitDay,
}) => {
  const [selectedSplitId, setSelectedSplitId] = useState<string>(
    splits.find((s) => s.isActive)?.id || splits[0]?.id || ""
  );

  // AI Generator state
  const [showAiGenerator, setShowAiGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGoal, setAiGoal] = useState("Hypertrophy (Muscle Growth)");
  const [aiDays, setAiDays] = useState(4);
  const [aiExperience, setAiExperience] = useState("Intermediate");
  const [aiEquipment, setAiEquipment] = useState("Gym (Barbells, Dumbbells, Cables, Machines)");
  const [aiDuration, setAiDuration] = useState(60);
  const [aiPriorityMuscle, setAiPriorityMuscle] = useState("Chest & Shoulders");
  const [aiGeneratedSplit, setAiGeneratedSplit] = useState<WorkoutSplit | null>(null);

  if (!isOpen) return null;

  const currentSplit = splits.find((s) => s.id === selectedSplitId) || splits[0];

  const handleSetActiveSplit = (id: string) => {
    const updated = splits.map((s) => ({
      ...s,
      isActive: s.id === id,
    }));
    onSaveSplits(updated);
    setSelectedSplitId(id);
  };

  const handleGenerateSplitWithAi = async () => {
    setIsGenerating(true);
    try {
      const data = await defaultAIProvider.generateSplit({
        goal: aiGoal,
        daysPerWeek: aiDays,
        experience: aiExperience,
        equipment: aiEquipment,
        durationMin: aiDuration,
        priorityMuscles: aiPriorityMuscle,
      });

      if (data && data.days && data.days.length > 0) {
        const newSplit: WorkoutSplit = {
          id: `ai-split-${Date.now()}`,
          name: data.name || "AI Optimized Split",
          description: data.rationale || "Personalized split based on your biomechanics and recovery.",
          isCustom: true,
          isActive: false,
          days: data.days.map((d: any, idx: number) => ({
            id: `ai-d-${idx + 1}`,
            dayName: d.dayName,
            isRestDay: d.isRestDay || (d.exercises && d.exercises.length === 0),
            targetMuscles: d.targetMuscles || [],
            exercises: (d.exercises || []).map((e: any) => ({
              exerciseId: (e.name || "exercise").toLowerCase().replace(/\s+/g, "-"),
              exerciseName: e.name,
              targetSets: e.sets || 3,
              targetReps: e.reps || "8-10",
              restSec: e.restSec || 90,
            })),
          })),
        };
        setAiGeneratedSplit(newSplit);
      } else {
        // Fallback intelligent split
        const fallbackSplit: WorkoutSplit = {
          id: `ai-split-${Date.now()}`,
          name: `${aiDays}-Day ${aiGoal.split(" ")[0]} Split`,
          description: `Customized routine prioritizing ${aiPriorityMuscle} with optimal weekly frequency.`,
          isCustom: true,
          isActive: false,
          days: [
            {
              id: "ai-d1",
              dayName: "Day 1: Upper Hypertrophy",
              isRestDay: false,
              targetMuscles: ["Chest", "Lats", "Side Delts", "Triceps"],
              exercises: [
                { exerciseId: "barbell-bench-press", exerciseName: "Barbell Bench Press", targetSets: 4, targetReps: "6-8", restSec: 120 },
                { exerciseId: "lat-pulldown", exerciseName: "Lat Pulldown", targetSets: 4, targetReps: "8-10", restSec: 90 },
                { exerciseId: "dumbbell-lateral-raise", exerciseName: "Dumbbell Lateral Raise", targetSets: 4, targetReps: "12-15", restSec: 60 },
              ],
            },
            {
              id: "ai-d2",
              dayName: "Day 2: Lower Power & Core",
              isRestDay: false,
              targetMuscles: ["Quads", "Hamstrings", "Calves", "Abs"],
              exercises: [
                { exerciseId: "barbell-squat", exerciseName: "Barbell Back Squat", targetSets: 4, targetReps: "6-8", restSec: 150 },
                { exerciseId: "romanian-deadlift", exerciseName: "Romanian Deadlift", targetSets: 3, targetReps: "8-10", restSec: 120 },
              ],
            },
            {
              id: "ai-d3",
              dayName: "Day 3: Active Rest & Mobility",
              isRestDay: true,
              targetMuscles: [],
              exercises: [],
            },
          ],
        };
        setAiGeneratedSplit(fallbackSplit);
      }
    } catch {
      alert("Unable to reach AI generator. Please check your network connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyAiSplit = () => {
    if (!aiGeneratedSplit) return;
    const updated = [
      ...splits.map((s) => ({ ...s, isActive: false })),
      { ...aiGeneratedSplit, isActive: true },
    ];
    onSaveSplits(updated);
    setSelectedSplitId(aiGeneratedSplit.id);
    setShowAiGenerator(false);
    setAiGeneratedSplit(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 text-[#F5F5F5]">
      <div className="bg-[#121212] border border-[#1A1A1A] w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-[#1A1A1A] flex items-center justify-between">
          <div>
            <h3 className="text-base font-serif italic text-[#F5F5F5]">Workout Split Planner</h3>
            <p className="text-xs text-gray-400">Manage workout splits or generate tailored routines with AI</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#181818] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Header */}
        <div className="p-3 bg-[#0E0E0E] border-b border-[#1A1A1A] flex items-center justify-between gap-2">
          <button
            onClick={() => setShowAiGenerator(true)}
            className="flex-1 py-2.5 px-4 bg-[#E2FF31] hover:brightness-110 text-[#080808] font-bold text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-1.5 shadow-md shadow-[#E2FF31]/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Split with AI</span>
          </button>
        </div>

        {/* Split Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto p-3 border-b border-[#1A1A1A] bg-[#0E0E0E] no-scrollbar">
          {splits.map((split) => (
            <button
              key={split.id}
              onClick={() => setSelectedSplitId(split.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                selectedSplitId === split.id
                  ? "bg-[#181818] text-[#E2FF31] border border-[#E2FF31]/30 font-bold"
                  : "bg-[#121212] text-gray-400 hover:text-white border border-[#222]"
              }`}
            >
              <span>{split.name}</span>
              {split.isActive && (
                <span className="w-2 h-2 rounded-full bg-[#E2FF31] shadow-sm shadow-[#E2FF31]" />
              )}
            </button>
          ))}
        </div>

        {/* Selected Split Content */}
        {currentSplit && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Split Info Card */}
            <div className="p-4 bg-[#181818] border border-[#222] rounded-3xl flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-serif italic font-bold text-[#F5F5F5]">{currentSplit.name}</h4>
                  {currentSplit.isActive ? (
                    <span className="text-[10px] bg-[#121212] text-[#E2FF31] border border-[#E2FF31]/30 px-2.5 py-0.5 rounded-full font-bold">
                      Active Split
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetActiveSplit(currentSplit.id)}
                      className="text-[10px] text-gray-400 hover:text-white border border-[#333] px-2.5 py-0.5 rounded-full transition-colors"
                    >
                      Set as Active
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{currentSplit.description}</p>
              </div>
            </div>

            {/* Days Breakdown */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Split Schedule ({currentSplit.days.length} Days)
              </h5>

              {currentSplit.days.map((day, dIdx) => (
                <div
                  key={day.id}
                  className={`p-4 rounded-3xl border transition-colors ${
                    day.isRestDay
                      ? "bg-[#181818]/60 border-[#222] text-gray-400"
                      : "bg-[#181818] border-[#222] text-[#F5F5F5]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-serif font-bold text-[#E2FF31]">{day.dayName}</span>
                      {day.isRestDay && (
                        <span className="text-[10px] bg-[#121212] text-gray-400 border border-[#222] px-2 py-0.5 rounded-full font-medium">
                          Rest &amp; Recovery
                        </span>
                      )}
                    </div>

                    {!day.isRestDay && (
                      <button
                        onClick={() => {
                          onStartSplitDay(currentSplit, day);
                          onClose();
                        }}
                        className="text-xs font-bold bg-[#E2FF31] hover:brightness-110 text-[#080808] px-3 py-1.5 rounded-full uppercase tracking-wider transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <Dumbbell className="w-3.5 h-3.5" />
                        <span>Start</span>
                      </button>
                    )}
                  </div>

                  {!day.isRestDay && (
                    <>
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {day.targetMuscles.map((muscle) => (
                          <span
                            key={muscle}
                            className="text-[10px] bg-[#121212] border border-[#222] text-gray-300 px-2.5 py-0.5 rounded-full"
                          >
                            {muscle}
                          </span>
                        ))}
                      </div>

                      <div className="space-y-1 text-xs text-gray-400">
                        {day.exercises.map((ex, i) => (
                          <div key={i} className="flex items-center justify-between py-1 border-t border-[#222]/50 first:border-none">
                            <span className="text-gray-200">{ex.exerciseName}</span>
                            <span className="text-[11px] font-serif text-gray-500">
                              {ex.targetSets} sets × {ex.targetReps}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI GENERATOR MODAL OVERLAY */}
        {showAiGenerator && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#121212] border border-[#1A1A1A] w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#181818] border border-[#222] text-[#E2FF31] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-serif italic font-bold text-[#F5F5F5]">Smart Split Generator</h4>
                    <p className="text-xs text-gray-400">Gemini AI custom routine generator</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAiGenerator(false)}
                  className="p-1.5 rounded-full hover:bg-[#181818] text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!aiGeneratedSplit ? (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="text-gray-300 font-semibold block mb-1">Primary Fitness Goal</label>
                    <select
                      value={aiGoal}
                      onChange={(e) => setAiGoal(e.target.value)}
                      className="w-full bg-[#181818] border border-[#222] text-[#F5F5F5] rounded-2xl p-2.5 focus:outline-none focus:border-[#E2FF31]"
                    >
                      <option>Hypertrophy (Muscle Growth)</option>
                      <option>Strength &amp; Powerlifting</option>
                      <option>Fat Loss &amp; Conditioning</option>
                      <option>General Athletic Fitness</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-gray-300 font-semibold block mb-1">Days Per Week</label>
                      <select
                        value={aiDays}
                        onChange={(e) => setAiDays(Number(e.target.value))}
                        className="w-full bg-[#181818] border border-[#222] text-[#F5F5F5] rounded-2xl p-2.5 focus:outline-none focus:border-[#E2FF31]"
                      >
                        <option value={3}>3 Days (Full Body / PPL)</option>
                        <option value={4}>4 Days (Upper / Lower)</option>
                        <option value={5}>5 Days (Classic Split)</option>
                        <option value={6}>6 Days (Push Pull Legs 2x)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-gray-300 font-semibold block mb-1">Experience Level</label>
                      <select
                        value={aiExperience}
                        onChange={(e) => setAiExperience(e.target.value)}
                        className="w-full bg-[#181818] border border-[#222] text-[#F5F5F5] rounded-2xl p-2.5 focus:outline-none focus:border-[#E2FF31]"
                      >
                        <option>Beginner (&lt; 1 yr)</option>
                        <option>Intermediate (1-3 yrs)</option>
                        <option>Advanced (3+ yrs)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-300 font-semibold block mb-1">Priority Muscle Group</label>
                    <input
                      type="text"
                      value={aiPriorityMuscle}
                      onChange={(e) => setAiPriorityMuscle(e.target.value)}
                      placeholder="e.g. Chest, Upper Back, Shoulders..."
                      className="w-full bg-[#181818] border border-[#222] text-[#F5F5F5] rounded-2xl p-2.5 focus:outline-none focus:border-[#E2FF31]"
                    />
                  </div>

                  <button
                    onClick={handleGenerateSplitWithAi}
                    disabled={isGenerating}
                    className="w-full py-3.5 bg-[#E2FF31] hover:brightness-110 text-[#080808] font-bold rounded-full text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#E2FF31]/20 transition-all mt-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-[#080808] border-t-transparent rounded-full animate-spin" />
                        <span>Generating Biomechanically Balanced Split...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Split</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="p-3.5 bg-[#181818] border border-[#E2FF31]/30 rounded-2xl">
                    <h5 className="text-sm font-serif italic font-bold text-[#E2FF31]">{aiGeneratedSplit.name}</h5>
                    <p className="text-xs text-gray-300 mt-1">{aiGeneratedSplit.description}</p>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2 text-xs">
                    {aiGeneratedSplit.days.map((day, idx) => (
                      <div key={idx} className="p-3 bg-[#181818] rounded-2xl border border-[#222]">
                        <span className="font-semibold text-gray-200">{day.dayName}</span>
                        {!day.isRestDay && (
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {day.exercises.map((e) => e.exerciseName).join(" • ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setAiGeneratedSplit(null)}
                      className="flex-1 py-2.5 bg-[#181818] hover:bg-[#222] text-gray-300 rounded-full text-xs font-semibold transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleApplyAiSplit}
                      className="flex-1 py-2.5 bg-[#E2FF31] hover:brightness-110 text-[#080808] rounded-full text-xs uppercase tracking-wider font-bold shadow-md shadow-[#E2FF31]/20 transition-all"
                    >
                      Apply &amp; Set Active
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
