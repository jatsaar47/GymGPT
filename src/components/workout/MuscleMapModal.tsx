import React, { useState } from "react";
import { MuscleGroup, Exercise, AppLanguage } from "../../types";
import { EXERCISE_DATABASE } from "../../data/exerciseLibrary";
import { X, Dumbbell, ShieldCheck, ChevronRight, Info } from "lucide-react";
import { getMuscleName } from "../../utils/i18n";

interface MuscleMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise?: (exercise: Exercise) => void;
  language?: AppLanguage;
}

export const MuscleMapModal: React.FC<MuscleMapModalProps> = ({
  isOpen,
  onClose,
  onSelectExercise,
  language = "en",
}) => {
  const [view, setView] = useState<"anterior" | "posterior">("anterior");
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup>("Chest");

  if (!isOpen) return null;

  const isHindi = language === "hi";

  // Filter exercises targeting this muscle
  const matchingExercises = EXERCISE_DATABASE.filter(
    (e) =>
      e.targetMuscle === selectedMuscle ||
      e.primaryMuscle === selectedMuscle ||
      (e.secondaryMuscles && e.secondaryMuscles.includes(selectedMuscle))
  );

  const muscleHindiNames: Partial<Record<MuscleGroup, string>> = {
    Chest: "छाती (Pectoralis)",
    "Upper Chest": "ऊपरी छाती (Clavicular Pectoralis)",
    "Lower Chest": "निचली छाती (Lower Pectoralis)",
    Lats: "पीठ (Latissimus Dorsi)",
    "Upper Back": "ऊपरी पीठ (Rhomboids & Traps)",
    "Lower Back": "निचली पीठ (Erector Spinae)",
    "Front Delts": "कंधा अगला भाग (Anterior Deltoid)",
    "Side Delts": "कंधा पार्श्व भाग (Lateral Deltoid)",
    "Rear Delts": "कंधा पिछला भाग (Posterior Deltoid)",
    Traps: "गर्दन व कंधे (Trapezius)",
    Biceps: "डोले / बाइसेप्स (Biceps Brachii)",
    Triceps: "ट्राइसेप्स (Triceps Brachii)",
    Forearms: "कलाई व अग्रभुजा (Forearms)",
    Arms: "बाजू (Arms)",
    Shoulders: "कंधे (Shoulders)",
    Legs: "पैर (Legs)",
    Abs: "पेट की मांसपेशियां (Abdominals)",
    Obliques: "कमर के बाजू (Obliques)",
    Quads: "जांघ का अगला हिस्सा (Quadriceps)",
    Hamstrings: "जांघ का पिछला हिस्सा (Hamstrings)",
    Glutes: "कूल्हे (Gluteus Maximus)",
    Calves: "पिंडली (Gastrocnemius & Soleus)",
    Adductors: "अंदरूनी जांघ (Adductors)",
    Abductors: "बाहरी जांघ (Abductors)",
    Neck: "गर्दन (Neck)",
    Cardio: "ह्रदय व सहनशक्ति (Cardiovascular)",
    "Full Body": "संपूर्ण शरीर (Full Body)",
  };

  // Simulated muscle recovery status based on past workout logs
  const recoveryInfo: Partial<Record<MuscleGroup, { recovery: number; lastTrained: string }>> = {
    Chest: { recovery: 85, lastTrained: "3 days ago" },
    "Upper Chest": { recovery: 85, lastTrained: "3 days ago" },
    Lats: { recovery: 60, lastTrained: "1 day ago" },
    "Upper Back": { recovery: 60, lastTrained: "1 day ago" },
    "Lower Back": { recovery: 95, lastTrained: "5 days ago" },
    "Front Delts": { recovery: 80, lastTrained: "3 days ago" },
    "Side Delts": { recovery: 75, lastTrained: "3 days ago" },
    "Rear Delts": { recovery: 60, lastTrained: "1 day ago" },
    Traps: { recovery: 90, lastTrained: "4 days ago" },
    Biceps: { recovery: 60, lastTrained: "1 day ago" },
    Triceps: { recovery: 80, lastTrained: "3 days ago" },
    Forearms: { recovery: 95, lastTrained: "4 days ago" },
    Abs: { recovery: 100, lastTrained: "5 days ago" },
    Obliques: { recovery: 100, lastTrained: "5 days ago" },
    Quads: { recovery: 95, lastTrained: "6 days ago" },
    Hamstrings: { recovery: 90, lastTrained: "6 days ago" },
    Glutes: { recovery: 95, lastTrained: "6 days ago" },
    Calves: { recovery: 90, lastTrained: "6 days ago" },
  };

  const currentRecovery = recoveryInfo[selectedMuscle] || { recovery: 100, lastTrained: "Fully Rested" };

  const ACTIVE_COLOR = "#E2FF31";
  const INACTIVE_PRIMARY = "#2C2C2C";
  const INACTIVE_SECONDARY = "#202020";

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 text-[#F5F5F5]">
      <div className="bg-[#121212] border border-[#1A1A1A] w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1A1A1A]">
          <div>
            <h3 className="text-base font-serif italic text-[#F5F5F5]">
              {isHindi ? "मांसपेशी शारीरिक संरचना (Muscle Map)" : "Interactive Muscle Anatomy Map"}
            </h3>
            <p className="text-xs text-gray-400">
              {isHindi
                ? "रिकवरी स्थिति व लक्षित व्यायाम देखने के लिए मांसपेशी पर टैप करें"
                : "Tap a muscle to check recovery status and target exercises"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#181818] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Anterior / Posterior Switcher */}
        <div className="flex bg-[#0E0E0E] p-1.5 mx-4 mt-3 rounded-2xl border border-[#1A1A1A]">
          <button
            onClick={() => setView("anterior")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              view === "anterior"
                ? "bg-[#E2FF31] text-[#080808] font-bold shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {isHindi ? "सामने का भाग (Anterior)" : "Anterior (Front View)"}
          </button>
          <button
            onClick={() => setView("posterior")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              view === "posterior"
                ? "bg-[#E2FF31] text-[#080808] font-bold shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {isHindi ? "पीछे का भाग (Posterior)" : "Posterior (Back View)"}
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Interactive SVG Muscle Map Canvas */}
          <div className="bg-[#0E0E0E] border border-[#1A1A1A] rounded-3xl p-4 flex flex-col items-center justify-center relative min-h-[260px]">
            <svg
              viewBox="0 0 240 380"
              className="w-48 h-72 drop-shadow-md select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Neutral Head */}
              <ellipse cx="120" cy="35" rx="16" ry="20" fill="#1C1C1C" />
              {/* Neck */}
              <rect x="114" y="55" width="12" height="12" fill="#1C1C1C" />

              {view === "anterior" ? (
                // ANTERIOR VIEW
                <g>
                  {/* Shoulders / Front Delts */}
                  <path
                    d="M 90 70 Q 75 75 70 95 Q 85 95 92 82 Z"
                    fill={selectedMuscle === "Front Delts" ? ACTIVE_COLOR : INACTIVE_PRIMARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Front Delts")}
                  />
                  <path
                    d="M 150 70 Q 165 75 170 95 Q 155 95 148 82 Z"
                    fill={selectedMuscle === "Front Delts" ? ACTIVE_COLOR : INACTIVE_PRIMARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Front Delts")}
                  />

                  {/* Upper Chest */}
                  <path
                    d="M 94 70 Q 120 72 146 70 L 144 82 Q 120 84 96 82 Z"
                    fill={selectedMuscle === "Upper Chest" ? ACTIVE_COLOR : INACTIVE_SECONDARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Upper Chest")}
                  />

                  {/* Main Chest */}
                  <path
                    d="M 95 83 Q 120 85 145 83 L 143 112 Q 120 118 97 112 Z"
                    fill={selectedMuscle === "Chest" ? ACTIVE_COLOR : INACTIVE_PRIMARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Chest")}
                  />

                  {/* Biceps */}
                  <ellipse
                    cx="68"
                    cy="118"
                    rx="9"
                    ry="20"
                    fill={selectedMuscle === "Biceps" ? ACTIVE_COLOR : INACTIVE_PRIMARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Biceps")}
                  />
                  <ellipse
                    cx="172"
                    cy="118"
                    rx="9"
                    ry="20"
                    fill={selectedMuscle === "Biceps" ? ACTIVE_COLOR : INACTIVE_PRIMARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Biceps")}
                  />

                  {/* Forearms */}
                  <ellipse
                    cx="62"
                    cy="165"
                    rx="7"
                    ry="22"
                    fill={selectedMuscle === "Forearms" ? ACTIVE_COLOR : INACTIVE_SECONDARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Forearms")}
                  />
                  <ellipse
                    cx="178"
                    cy="165"
                    rx="7"
                    ry="22"
                    fill={selectedMuscle === "Forearms" ? ACTIVE_COLOR : INACTIVE_SECONDARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Forearms")}
                  />

                  {/* Rectus Abdominis (Abs) */}
                  <rect
                    x="106"
                    y="118"
                    width="28"
                    height="58"
                    rx="4"
                    fill={selectedMuscle === "Abs" ? ACTIVE_COLOR : INACTIVE_PRIMARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Abs")}
                  />

                  {/* Obliques */}
                  <path
                    d="M 97 116 L 104 118 L 104 175 L 94 165 Z"
                    fill={selectedMuscle === "Obliques" ? ACTIVE_COLOR : INACTIVE_SECONDARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Obliques")}
                  />
                  <path
                    d="M 143 116 L 136 118 L 136 175 L 146 165 Z"
                    fill={selectedMuscle === "Obliques" ? ACTIVE_COLOR : INACTIVE_SECONDARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Obliques")}
                  />

                  {/* Quads (Quadriceps) */}
                  <ellipse
                    cx="103"
                    cy="235"
                    rx="15"
                    ry="45"
                    fill={selectedMuscle === "Quads" ? ACTIVE_COLOR : INACTIVE_PRIMARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Quads")}
                  />
                  <ellipse
                    cx="137"
                    cy="235"
                    rx="15"
                    ry="45"
                    fill={selectedMuscle === "Quads" ? ACTIVE_COLOR : INACTIVE_PRIMARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Quads")}
                  />

                  {/* Calves (Anterior Tibialis & Calves) */}
                  <ellipse
                    cx="101"
                    cy="325"
                    rx="10"
                    ry="35"
                    fill={selectedMuscle === "Calves" ? ACTIVE_COLOR : INACTIVE_SECONDARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Calves")}
                  />
                  <ellipse
                    cx="139"
                    cy="325"
                    rx="10"
                    ry="35"
                    fill={selectedMuscle === "Calves" ? ACTIVE_COLOR : INACTIVE_SECONDARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Calves")}
                  />
                </g>
              ) : (
                // POSTERIOR VIEW
                <g>
                  {/* Traps */}
                  <polygon
                    points="120,60 100,75 140,75"
                    fill={selectedMuscle === "Traps" ? ACTIVE_COLOR : INACTIVE_PRIMARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Traps")}
                  />

                  {/* Rear Delts */}
                  <ellipse
                    cx="78"
                    cy="85"
                    rx="10"
                    ry="12"
                    fill={selectedMuscle === "Rear Delts" ? ACTIVE_COLOR : INACTIVE_PRIMARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Rear Delts")}
                  />
                  <ellipse
                    cx="162"
                    cy="85"
                    rx="10"
                    ry="12"
                    fill={selectedMuscle === "Rear Delts" ? ACTIVE_COLOR : INACTIVE_PRIMARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Rear Delts")}
                  />

                  {/* Triceps */}
                  <ellipse
                    cx="68"
                    cy="118"
                    rx="9"
                    ry="20"
                    fill={selectedMuscle === "Triceps" ? ACTIVE_COLOR : INACTIVE_PRIMARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Triceps")}
                  />
                  <ellipse
                    cx="172"
                    cy="118"
                    rx="9"
                    ry="20"
                    fill={selectedMuscle === "Triceps" ? ACTIVE_COLOR : INACTIVE_PRIMARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Triceps")}
                  />

                  {/* Upper Back (Rhomboids) */}
                  <polygon
                    points="120,78 95,95 145,95"
                    fill={selectedMuscle === "Upper Back" ? ACTIVE_COLOR : INACTIVE_PRIMARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Upper Back")}
                  />

                  {/* Latissimus Dorsi (Lats) */}
                  <path
                    d="M 94 96 Q 80 130 98 145 L 120 148 L 142 145 Q 160 130 146 96 Z"
                    fill={selectedMuscle === "Lats" ? ACTIVE_COLOR : INACTIVE_PRIMARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Lats")}
                  />

                  {/* Lower Back */}
                  <rect
                    x="108"
                    y="148"
                    width="24"
                    height="25"
                    rx="3"
                    fill={selectedMuscle === "Lower Back" ? ACTIVE_COLOR : INACTIVE_SECONDARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Lower Back")}
                  />

                  {/* Glutes */}
                  <ellipse
                    cx="103"
                    cy="195"
                    rx="16"
                    ry="18"
                    fill={selectedMuscle === "Glutes" ? ACTIVE_COLOR : INACTIVE_PRIMARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Glutes")}
                  />
                  <ellipse
                    cx="137"
                    cy="195"
                    rx="16"
                    ry="18"
                    fill={selectedMuscle === "Glutes" ? ACTIVE_COLOR : INACTIVE_PRIMARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Glutes")}
                  />

                  {/* Hamstrings */}
                  <ellipse
                    cx="103"
                    cy="250"
                    rx="14"
                    ry="35"
                    fill={selectedMuscle === "Hamstrings" ? ACTIVE_COLOR : INACTIVE_PRIMARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Hamstrings")}
                  />
                  <ellipse
                    cx="137"
                    cy="250"
                    rx="14"
                    ry="35"
                    fill={selectedMuscle === "Hamstrings" ? ACTIVE_COLOR : INACTIVE_PRIMARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Hamstrings")}
                  />

                  {/* Calves (Gastrocnemius) */}
                  <ellipse
                    cx="101"
                    cy="325"
                    rx="11"
                    ry="30"
                    fill={selectedMuscle === "Calves" ? ACTIVE_COLOR : INACTIVE_PRIMARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Calves")}
                  />
                  <ellipse
                    cx="139"
                    cy="325"
                    rx="11"
                    ry="30"
                    fill={selectedMuscle === "Calves" ? ACTIVE_COLOR : INACTIVE_PRIMARY}
                    className="cursor-pointer hover:opacity-80 transition-colors"
                    onClick={() => setSelectedMuscle("Calves")}
                  />
                </g>
              )}
            </svg>
            <p className="text-[11px] text-gray-500 mt-2">Tap any muscle group on the anatomy figure</p>
          </div>

          {/* Muscle Detail & Recovery Card */}
          <div className="bg-[#181818] border border-[#222] rounded-3xl p-4 space-y-2.5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#E2FF31]">
                  {isHindi ? "चयनित मांसपेशी" : "Selected Muscle"}
                </span>
                <h4 className="text-base font-serif italic text-[#F5F5F5]">
                  {isHindi ? (muscleHindiNames[selectedMuscle] || selectedMuscle) : selectedMuscle}
                </h4>
                {isHindi ? (
                  <p className="text-xs text-gray-400">{selectedMuscle}</p>
                ) : (
                  <p className="text-xs text-gray-400">Target Muscle Group</p>
                )}
              </div>

              <div className="text-right">
                <span className="text-sm font-serif font-bold text-[#E2FF31]">{currentRecovery.recovery}%</span>
                <p className="text-[10px] text-gray-500">{isHindi ? "रिकवरी स्थिति" : "Recovery Status"}</p>
              </div>
            </div>

            {/* Recovery Progress Bar */}
            <div className="w-full h-1.5 bg-[#121212] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  currentRecovery.recovery >= 85
                    ? "bg-[#E2FF31]"
                    : currentRecovery.recovery >= 65
                    ? "bg-amber-400"
                    : "bg-rose-400"
                }`}
                style={{ width: `${currentRecovery.recovery}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
              <span>Last Trained: <strong className="text-gray-200">{currentRecovery.lastTrained}</strong></span>
              <span className="text-[#E2FF31] font-semibold">
                {currentRecovery.recovery >= 80 ? "Ready to Train" : "Recovering"}
              </span>
            </div>
          </div>

          {/* Matching Exercises List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Recommended Exercises ({matchingExercises.length})
              </h5>
            </div>

            <div className="space-y-2">
              {matchingExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="p-3 bg-[#181818] border border-[#222] rounded-2xl hover:border-[#333] transition-colors flex items-center justify-between"
                >
                  <div>
                    <h6 className="text-sm font-semibold text-[#F5F5F5]">{exercise.name}</h6>
                    <p className="text-xs text-gray-400">{exercise.hindiName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-[#121212] text-gray-300 border border-[#222] px-2 py-0.5 rounded-full capitalize">
                        {exercise.equipment}
                      </span>
                      <span className="text-[10px] text-[#E2FF31]">{exercise.category}</span>
                    </div>
                  </div>

                  {onSelectExercise && (
                    <button
                      onClick={() => {
                        onSelectExercise(exercise);
                        onClose();
                      }}
                      className="text-xs font-bold bg-[#E2FF31] hover:brightness-110 text-[#080808] px-3 py-1.5 rounded-full uppercase tracking-wider transition-colors flex items-center gap-1.5"
                    >
                      <Dumbbell className="w-3.5 h-3.5" />
                      <span>Select</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
