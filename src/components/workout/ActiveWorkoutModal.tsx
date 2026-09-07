import React, { useState, useEffect, useRef } from "react";
import { WorkoutSession, WorkoutExercise, ExerciseSet, Exercise, SetType } from "../../types";
import { EXERCISE_DATABASE } from "../../data/exerciseLibrary";
import { defaultAIProvider } from "../../services/aiProvider";
import {
  X,
  Play,
  Pause,
  Check,
  Plus,
  Trash2,
  Clock,
  Volume2,
  VolumeX,
  Flame,
  Award,
  Sparkles,
  ChevronDown,
  Info,
} from "lucide-react";

interface ActiveWorkoutModalProps {
  workout: WorkoutSession;
  onUpdateWorkout: (updated: WorkoutSession) => void;
  onFinishWorkout: (completedSession: WorkoutSession) => void;
  onCancelWorkout: () => void;
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({
  workout,
  onUpdateWorkout,
  onFinishWorkout,
  onCancelWorkout,
}) => {
  const [elapsedSec, setElapsedSec] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Rest Timer State
  const [restRemainingSec, setRestRemainingSec] = useState<number | null>(null);
  const [restTotalSec, setRestTotalSec] = useState<number>(90);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // Exercise Picker State
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState("All");

  // Post-workout analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [showFinishSummary, setShowFinishSummary] = useState(false);

  // Audio Context for beep sound
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeep = () => {
    if (!isSoundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  };

  // Workout Duration Timer
  useEffect(() => {
    let timer: any = null;
    if (!isPaused) {
      timer = setInterval(() => {
        setElapsedSec((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPaused]);

  // Rest Timer Countdown
  useEffect(() => {
    let restTimer: any = null;
    if (restRemainingSec !== null && restRemainingSec > 0) {
      restTimer = setInterval(() => {
        setRestRemainingSec((prev) => {
          if (prev === null || prev <= 1) {
            playBeep();
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(restTimer);
  }, [restRemainingSec, isSoundEnabled]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Start rest timer
  const triggerRestTimer = (durationSec = 90) => {
    setRestTotalSec(durationSec);
    setRestRemainingSec(durationSec);
  };

  // Set management
  const handleToggleSetComplete = (exIdx: number, setIdx: number) => {
    const updated = { ...workout };
    const targetSet = updated.exercises[exIdx].sets[setIdx];
    const willBeCompleted = !targetSet.completed;
    targetSet.completed = willBeCompleted;

    // Calculate volume
    recalculateWorkoutMetrics(updated);
    onUpdateWorkout(updated);

    // Auto-trigger rest timer if set is newly completed
    if (willBeCompleted) {
      triggerRestTimer(targetSet.restTimeSec || 90);
    }
  };

  const handleUpdateSetValue = (
    exIdx: number,
    setIdx: number,
    field: "weight" | "reps" | "rpe" | "type",
    value: any
  ) => {
    const updated = { ...workout };
    const targetSet = updated.exercises[exIdx].sets[setIdx];
    (targetSet as any)[field] = value;
    recalculateWorkoutMetrics(updated);
    onUpdateWorkout(updated);
  };

  const handleAddSet = (exIdx: number) => {
    const updated = { ...workout };
    const ex = updated.exercises[exIdx];
    const prevSet = ex.sets[ex.sets.length - 1];
    const newSet: ExerciseSet = {
      id: `s-${Date.now()}-${Math.random()}`,
      setNumber: ex.sets.length + 1,
      type: "working",
      weight: prevSet ? prevSet.weight : 20,
      reps: prevSet ? prevSet.reps : 10,
      completed: false,
      restTimeSec: 90,
    };
    ex.sets.push(newSet);
    recalculateWorkoutMetrics(updated);
    onUpdateWorkout(updated);
  };

  const handleRemoveSet = (exIdx: number, setIdx: number) => {
    const updated = { ...workout };
    updated.exercises[exIdx].sets.splice(setIdx, 1);
    // Renumber sets
    updated.exercises[exIdx].sets.forEach((s, i) => {
      s.setNumber = i + 1;
    });
    recalculateWorkoutMetrics(updated);
    onUpdateWorkout(updated);
  };

  const handleAddExerciseToWorkout = (exercise: Exercise) => {
    const updated = { ...workout };
    const newEx: WorkoutExercise = {
      id: `we-${Date.now()}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      targetMuscle: exercise.primaryMuscle,
      sets: [
        { id: `s-1-${Date.now()}`, setNumber: 1, type: "warmup", weight: 20, reps: 12, completed: false, restTimeSec: 60 },
        { id: `s-2-${Date.now()}`, setNumber: 2, type: "working", weight: 40, reps: 10, completed: false, restTimeSec: 90 },
        { id: `s-3-${Date.now()}`, setNumber: 3, type: "working", weight: 40, reps: 10, completed: false, restTimeSec: 90 },
      ],
    };
    updated.exercises.push(newEx);
    if (!updated.musclesTrained.includes(exercise.primaryMuscle)) {
      updated.musclesTrained.push(exercise.primaryMuscle);
    }
    recalculateWorkoutMetrics(updated);
    onUpdateWorkout(updated);
    setShowExercisePicker(false);
  };

  const handleRemoveExercise = (exIdx: number) => {
    const updated = { ...workout };
    updated.exercises.splice(exIdx, 1);
    recalculateWorkoutMetrics(updated);
    onUpdateWorkout(updated);
  };

  const recalculateWorkoutMetrics = (session: WorkoutSession) => {
    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;

    session.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.completed) {
          totalSets += 1;
          totalReps += Number(s.reps) || 0;
          totalVolume += (Number(s.weight) || 0) * (Number(s.reps) || 0);
        }
      });
    });

    session.totalVolumeKg = Math.round(totalVolume);
    session.totalSets = totalSets;
    session.totalReps = totalReps;
  };

  // Complete Workout Flow
  const handleFinishSession = async () => {
    const finalWorkout = { ...workout };
    finalWorkout.durationMinutes = Math.max(Math.round(elapsedSec / 60), 1);
    finalWorkout.endTime = Date.now();
    finalWorkout.isCompleted = true;
    recalculateWorkoutMetrics(finalWorkout);

    setShowFinishSummary(true);
    setIsAnalyzing(true);

    try {
      const data = await defaultAIProvider.analyzeWorkout({
        workoutSession: finalWorkout,
      });
      finalWorkout.aiAnalysis = data.analysis;
      setAiFeedback(data.analysis);
    } catch {
      setAiFeedback("Workout completed with high intensity and balanced volume!");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const setTypeLabels: Record<SetType, string> = {
    warmup: "W",
    working: "Set",
    drop: "D",
    superset: "S",
    failure: "F",
    giant: "G",
    amrap: "A",
  };

  // Filtered exercises for picker
  const filteredExercises = EXERCISE_DATABASE.filter((ex) => {
    const q = searchQuery.toLowerCase();
    const muscle = ex.targetMuscle || ex.primaryMuscle || "";
    const matchesSearch =
      !q ||
      ex.name.toLowerCase().includes(q) ||
      (ex.hindiName && ex.hindiName.toLowerCase().includes(q)) ||
      muscle.toLowerCase().includes(q);
    const matchesMuscle =
      selectedMuscleFilter === "All" || muscle === selectedMuscleFilter;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#080808] flex flex-col overflow-hidden text-[#F5F5F5]">
      {/* Header Bar */}
      <div className="p-3.5 bg-[#121212] border-b border-[#1A1A1A] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onCancelWorkout}
            className="p-1.5 rounded-full hover:bg-[#181818] text-gray-400 hover:text-white transition-colors"
            title="Minimize or Cancel"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-serif italic font-bold text-[#F5F5F5] tracking-tight">{workout.name}</h2>
            <div className="flex items-center gap-2 text-xs font-serif text-[#E2FF31]">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(elapsedSec)}</span>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-1 text-gray-400 hover:text-white"
                title={isPaused ? "Resume" : "Pause"}
              >
                {isPaused ? <Play className="w-3 h-3 text-[#E2FF31]" /> : <Pause className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Volume</span>
            <p className="text-xs font-serif font-bold text-[#F5F5F5]">{workout.totalVolumeKg} kg</p>
          </div>
          <button
            onClick={handleFinishSession}
            className="px-4 py-2 bg-[#E2FF31] hover:brightness-110 text-[#080808] font-bold text-xs uppercase tracking-wider rounded-full shadow-md shadow-[#E2FF31]/20 transition-all flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Finish</span>
          </button>
        </div>
      </div>

      {/* Rest Timer Floating Banner */}
      {restRemainingSec !== null && (
        <div className="bg-[#121212] border-b border-[#1A1A1A] px-4 py-2.5 flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#E2FF31] animate-ping" />
            <span className="text-gray-400 font-medium">Resting:</span>
            <span className="font-serif font-bold text-[#E2FF31] text-sm">{formatTime(restRemainingSec)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRestRemainingSec((prev) => (prev ? prev + 15 : 15))}
              className="px-2.5 py-1 bg-[#181818] hover:bg-[#222] text-[#E2FF31] border border-[#222] rounded-full font-semibold text-[11px]"
            >
              +15s
            </button>
            <button
              onClick={() => setRestRemainingSec((prev) => (prev ? prev + 30 : 30))}
              className="px-2.5 py-1 bg-[#181818] hover:bg-[#222] text-[#E2FF31] border border-[#222] rounded-full font-semibold text-[11px]"
            >
              +30s
            </button>
            <button
              onClick={() => setRestRemainingSec(null)}
              className="px-2.5 py-1 bg-[#181818] hover:bg-[#222] text-gray-400 rounded-full font-semibold text-[11px]"
            >
              Skip
            </button>
            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className="p-1 text-gray-400 hover:text-white"
              title={isSoundEnabled ? "Mute beep" : "Unmute beep"}
            >
              {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#E2FF31]" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Exercises Scroll Container */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 pb-28">
        {workout.exercises.map((ex, exIdx) => (
          <div
            key={ex.id}
            className="bg-[#121212] border border-[#1A1A1A] rounded-3xl p-4 shadow-sm space-y-3.5"
          >
            {/* Exercise Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-serif italic font-bold text-[#F5F5F5]">{ex.exerciseName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-semibold text-[#E2FF31] bg-[#181818] border border-[#222] px-2 py-0.5 rounded-full">
                    {ex.targetMuscle}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => triggerRestTimer(90)}
                  className="p-1.5 px-2.5 rounded-full bg-[#181818] hover:bg-[#222] border border-[#222] text-gray-300 text-xs flex items-center gap-1"
                  title="Rest Timer"
                >
                  <Clock className="w-3 h-3 text-[#E2FF31]" />
                  <span className="text-[10px]">Rest</span>
                </button>
                <button
                  onClick={() => handleRemoveExercise(exIdx)}
                  className="p-1.5 rounded-full hover:bg-rose-950/40 text-gray-500 hover:text-rose-400 transition-colors"
                  title="Remove Exercise"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sets Table */}
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">
                <span className="col-span-2">Set</span>
                <span className="col-span-3">Prev</span>
                <span className="col-span-3 text-center">Kg</span>
                <span className="col-span-2 text-center">Reps</span>
                <span className="col-span-2 text-center">✓</span>
              </div>

              {ex.sets.map((set, setIdx) => (
                <div
                  key={set.id}
                  className={`grid grid-cols-12 gap-1.5 items-center p-2 rounded-2xl border transition-colors ${
                    set.completed
                      ? "bg-[#181818] border-[#E2FF31]/40"
                      : "bg-[#181818]/60 border-[#222]"
                  }`}
                >
                  {/* Set Type / Number */}
                  <div className="col-span-2 flex items-center gap-1">
                    <select
                      value={set.type}
                      onChange={(e) =>
                        handleUpdateSetValue(exIdx, setIdx, "type", e.target.value as SetType)
                      }
                      className="text-[10px] font-bold bg-[#121212] text-[#F5F5F5] rounded-lg px-1.5 py-1 border border-[#222] focus:outline-none"
                    >
                      <option value="working">{set.setNumber}</option>
                      <option value="warmup">W</option>
                      <option value="drop">D</option>
                      <option value="superset">S</option>
                      <option value="failure">F</option>
                    </select>
                  </div>

                  {/* Previous Info */}
                  <div className="col-span-3 text-[11px] text-gray-500 font-serif">
                    {set.previousWeight ? `${set.previousWeight}k × ${set.previousReps}` : "—"}
                  </div>

                  {/* Weight Input */}
                  <div className="col-span-3">
                    <input
                      type="number"
                      step="0.5"
                      value={set.weight}
                      onChange={(e) =>
                        handleUpdateSetValue(exIdx, setIdx, "weight", Number(e.target.value))
                      }
                      className="w-full text-center text-xs font-serif font-bold bg-[#121212] text-[#F5F5F5] rounded-xl py-1.5 border border-[#222] focus:border-[#E2FF31] focus:outline-none"
                    />
                  </div>

                  {/* Reps Input */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) =>
                        handleUpdateSetValue(exIdx, setIdx, "reps", Number(e.target.value))
                      }
                      className="w-full text-center text-xs font-serif font-bold bg-[#121212] text-[#F5F5F5] rounded-xl py-1.5 border border-[#222] focus:border-[#E2FF31] focus:outline-none"
                    />
                  </div>

                  {/* Complete Checkbox */}
                  <div className="col-span-2 flex justify-center">
                    <button
                      onClick={() => handleToggleSetComplete(exIdx, setIdx)}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                        set.completed
                          ? "bg-[#E2FF31] text-[#080808] font-bold shadow-md shadow-[#E2FF31]/20"
                          : "bg-[#121212] hover:bg-[#222] text-gray-400 border border-[#222]"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Set Button */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => handleAddSet(exIdx)}
                className="text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#181818] hover:bg-[#222] border border-[#222] transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#E2FF31]" />
                <span>Add Set</span>
              </button>
            </div>
          </div>
        ))}

        {/* Add Exercise Button */}
        <button
          onClick={() => setShowExercisePicker(true)}
          className="w-full py-3.5 border-2 border-dashed border-[#222] hover:border-[#E2FF31]/50 rounded-3xl text-xs font-bold text-gray-400 hover:text-[#E2FF31] flex items-center justify-center gap-2 transition-colors uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          <span>Add Exercise to Workout</span>
        </button>
      </div>

      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#121212] border border-[#1A1A1A] w-full max-w-lg h-[80vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#1A1A1A] flex items-center justify-between">
              <div>
                <h3 className="text-base font-serif italic text-[#F5F5F5]">Exercise Library</h3>
                <p className="text-xs text-gray-400">Search 40+ exercises with Hindi names</p>
              </div>
              <button
                onClick={() => setShowExercisePicker(false)}
                className="p-1.5 rounded-full hover:bg-[#181818] text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Muscle Filter */}
            <div className="p-3.5 border-b border-[#1A1A1A] space-y-2.5 bg-[#0E0E0E]">
              <input
                type="text"
                placeholder="Search exercise (e.g. Bench press, Squat, दंड)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#222] rounded-2xl text-xs text-[#F5F5F5] placeholder-gray-500 focus:border-[#E2FF31] focus:outline-none"
              />

              <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {["All", "Chest", "Lats", "Front Delts", "Side Delts", "Biceps", "Triceps", "Quads", "Hamstrings", "Abs"].map(
                  (muscle) => (
                    <button
                      key={muscle}
                      onClick={() => setSelectedMuscleFilter(muscle)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                        selectedMuscleFilter === muscle
                          ? "bg-[#E2FF31] text-[#080808] font-bold"
                          : "bg-[#181818] text-gray-400 hover:text-white border border-[#222]"
                      }`}
                    >
                      {muscle}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Exercise Results List */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
              {filteredExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  onClick={() => handleAddExerciseToWorkout(exercise)}
                  className="p-3.5 bg-[#181818] border border-[#222] rounded-2xl hover:border-[#E2FF31]/50 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-[#F5F5F5]">{exercise.name}</h4>
                    <p className="text-xs text-gray-400">{exercise.hindiName}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] bg-[#121212] text-gray-300 border border-[#222] px-2 py-0.5 rounded-full capitalize">
                        {exercise.equipment}
                      </span>
                      <span className="text-[10px] text-[#E2FF31]">{exercise.primaryMuscle}</span>
                    </div>
                  </div>
                  <Plus className="w-5 h-5 text-[#E2FF31]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Finish Summary Modal */}
      {showFinishSummary && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#1A1A1A] w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-full bg-[#181818] border border-[#222] text-[#E2FF31] flex items-center justify-center mx-auto mb-2">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-serif italic text-[#F5F5F5]">Workout Complete!</h3>
              <p className="text-xs text-gray-400">Excellent effort on your session today</p>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 bg-[#181818] border border-[#222] rounded-2xl">
                <span className="text-[10px] uppercase tracking-widest text-gray-500">Duration</span>
                <p className="text-base font-serif font-bold text-[#F5F5F5]">{Math.round(elapsedSec / 60)} min</p>
              </div>
              <div className="p-3 bg-[#181818] border border-[#222] rounded-2xl">
                <span className="text-[10px] uppercase tracking-widest text-gray-500">Total Volume</span>
                <p className="text-base font-serif font-bold text-[#E2FF31]">{workout.totalVolumeKg} kg</p>
              </div>
              <div className="p-3 bg-[#181818] border border-[#222] rounded-2xl">
                <span className="text-[10px] uppercase tracking-widest text-gray-500">Sets Done</span>
                <p className="text-base font-serif font-bold text-[#F5F5F5]">{workout.totalSets}</p>
              </div>
            </div>

            {/* AI Analysis Box */}
            <div className="p-4 bg-[#181818] border border-[#222] rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-serif italic text-[#E2FF31]">
                <Sparkles className="w-4 h-4" />
                <span>AI Coach Workout Analysis</span>
              </div>
              {isAnalyzing ? (
                <div className="flex items-center gap-2 text-xs text-gray-400 py-1">
                  <div className="w-3 h-3 rounded-full border-2 border-[#E2FF31] border-t-transparent animate-spin" />
                  <span>Generating biomechanical &amp; volume analysis...</span>
                </div>
              ) : (
                <p className="text-xs text-gray-300 leading-relaxed">{aiFeedback}</p>
              )}
            </div>

            <button
              onClick={() => onFinishWorkout(workout)}
              className="w-full py-3.5 bg-[#E2FF31] hover:brightness-110 text-[#080808] font-bold rounded-full text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#E2FF31]/20"
            >
              Save Workout to History &amp; Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
