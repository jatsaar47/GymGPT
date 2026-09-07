import React, { useState } from "react";
import {
  MealLog,
  MealType,
  FoodItem,
  WaterLog,
  Supplement,
  UserProfile,
  UserSettings,
} from "../../types";
import {
  Flame,
  Plus,
  Trash2,
  Mic,
  MicOff,
  Sparkles,
  Droplet,
  Check,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Pill,
  BookOpen,
} from "lucide-react";
import { FoodSearchModal } from "./FoodSearchModal";
import { translations, getTranslations, getMealName } from "../../utils/i18n";
import { defaultAIProvider } from "../../services/aiProvider";

interface NutritionHubProps {
  settings: UserSettings;
  mealLogs: MealLog[];
  waterLogs: WaterLog[];
  supplements: Supplement[];
  onSaveMealLog: (mealLog: MealLog) => void;
  onDeleteMealLog: (id: string) => void;
  onAddWaterLog: (log: WaterLog) => void;
  onRemoveWaterLog: (id: string) => void;
  onSaveSupplements: (supplements: Supplement[]) => void;
  onSaveCustomFood: (food: FoodItem) => void;
}

export const NutritionHub: React.FC<NutritionHubProps> = ({
  settings,
  mealLogs,
  waterLogs,
  supplements,
  onSaveMealLog,
  onDeleteMealLog,
  onAddWaterLog,
  onRemoveWaterLog,
  onSaveSupplements,
  onSaveCustomFood,
}) => {
  const dict = getTranslations(settings?.language);
  const lang = settings?.language === "hi" ? "hi" : "en";
  const isHindi = lang === "hi";
  const tNut = dict.nutrition;
  const common = dict.common;

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [activeMealSearch, setActiveMealSearch] = useState<MealType | null>(null);

  // Natural Language & Speech AI Input State
  const [aiInputText, setAiInputText] = useState("");
  const [isParsingAi, setIsParsingAi] = useState(false);
  const [aiTargetMeal, setAiTargetMeal] = useState<MealType>("lunch");
  const [isListening, setIsListening] = useState(false);

  // Filter logs for selected date
  const dateMeals = mealLogs.filter((m) => m.date === selectedDate);
  const dateWater = waterLogs.filter((w) => w.date === selectedDate);
  const totalWaterMl = dateWater.reduce((acc, curr) => acc + curr.amountMl, 0);

  // Daily totals calculation
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;

  dateMeals.forEach((meal) => {
    meal.items.forEach((item) => {
      totalCalories += item.calories;
      totalProtein += item.protein;
      totalCarbs += item.carbs;
      totalFat += item.fat;
      totalFiber += item.fiber;
    });
  });

  const calTarget = settings.profile.calorieTarget;
  const remainingCalories = Math.max(calTarget - totalCalories, 0);

  const mealTypes: { type: MealType; label: string; icon: string }[] = [
    { type: "breakfast", label: getMealName("breakfast", lang), icon: "🌅" },
    { type: "lunch", label: getMealName("lunch", lang), icon: "☀️" },
    { type: "snacks", label: getMealName("snacks", lang), icon: "☕" },
    { type: "dinner", label: getMealName("dinner", lang), icon: "🌙" },
    { type: "pre-workout", label: getMealName("pre-workout", lang), icon: "⚡" },
    { type: "post-workout", label: getMealName("post-workout", lang), icon: "💪" },
  ];

  // Speech Recognition support
  const handleToggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        isHindi
          ? "आपके ब्राउज़र में स्पीच पहचान उपलब्ध नहीं है। कृपया टाइप करें।"
          : "Speech recognition is not supported in this browser. Please type your meal description."
      );
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = isHindi ? "hi-IN" : "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setAiInputText(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Natural Language AI Food Logging
  const handleParseFoodWithAi = async () => {
    if (!aiInputText.trim()) return;
    setIsParsingAi(true);

    try {
      const data = await defaultAIProvider.parseFood({
        text: aiInputText,
        mealType: aiTargetMeal,
      });

      const parsedItems = data.items || [];
      if (parsedItems.length > 0) {
        // Add to existing or create new meal log
        const existingMeal = dateMeals.find((m) => m.mealType === aiTargetMeal);
        const newMeal: MealLog = existingMeal
          ? {
              ...existingMeal,
              items: [
                ...existingMeal.items,
                ...parsedItems.map((p: any) => ({
                  id: `mi-${Date.now()}-${Math.random()}`,
                  foodId: (p.foodName || p.name || "food").toLowerCase().replace(/\s+/g, "-"),
                  name: p.foodName || p.name || "Custom Food",
                  servingUnit: p.servingUnit || p.unit || "serving",
                  quantity: p.quantity || 1,
                  calculatedGrams: p.estimatedGrams || 100,
                  calories: p.calories || 200,
                  protein: p.protein || 10,
                  carbs: p.carbs || 25,
                  fat: p.fat || 5,
                  fiber: p.fiber || 2,
                })),
              ],
            }
          : {
              id: `m-${Date.now()}`,
              date: selectedDate,
              mealType: aiTargetMeal,
              items: parsedItems.map((p: any) => ({
                id: `mi-${Date.now()}-${Math.random()}`,
                foodId: (p.foodName || p.name || "food").toLowerCase().replace(/\s+/g, "-"),
                name: p.foodName || p.name || "Custom Food",
                servingUnit: p.servingUnit || p.unit || "serving",
                quantity: p.quantity || 1,
                calculatedGrams: p.estimatedGrams || 100,
                calories: p.calories || 200,
                protein: p.protein || 10,
                carbs: p.carbs || 25,
                fat: p.fat || 5,
                fiber: p.fiber || 2,
              })),
            };

        onSaveMealLog(newMeal);
        setAiInputText("");
      } else {
        alert(
          isHindi
            ? "भोजन का विश्लेषण नहीं हो सका। कृपया मैनुअल खोज का उपयोग करें।"
            : "Could not parse food text. Please try standard food search."
        );
      }
    } catch {
      alert(
        isHindi
          ? "एआई सेवा त्रुटि। कृपया भोजन खोजें बटन का उपयोग करें।"
          : "AI service error. Please try logging manually via the Add Food button."
      );
    } finally {
      setIsParsingAi(false);
    }
  };

  // Add item from food search modal
  const handleAddFoodItem = (
    mealType: MealType,
    food: FoodItem,
    quantity: number,
    servingUnit: string
  ) => {
    const matchedServing = food.servings.find((s) => s.name === servingUnit);
    const gramsPerUnit = matchedServing ? matchedServing.gramsEquivalent : food.servingSizeGrams;
    const calculatedGrams = gramsPerUnit * quantity;

    const newItem = {
      id: `item-${Date.now()}`,
      foodId: food.id,
      name: isHindi && food.hindiName ? food.hindiName : food.name,
      servingUnit,
      quantity,
      calculatedGrams,
      calories: Math.round((food.calories * calculatedGrams) / 100),
      protein: +((food.protein * calculatedGrams) / 100).toFixed(1),
      carbs: +((food.carbs * calculatedGrams) / 100).toFixed(1),
      fat: +((food.fat * calculatedGrams) / 100).toFixed(1),
      fiber: +((food.fiber * calculatedGrams) / 100).toFixed(1),
    };

    const existingMeal = dateMeals.find((m) => m.mealType === mealType);
    const updatedMeal: MealLog = existingMeal
      ? { ...existingMeal, items: [...existingMeal.items, newItem] }
      : { id: `m-${Date.now()}`, date: selectedDate, mealType, items: [newItem] };

    onSaveMealLog(updatedMeal);
  };

  // Remove individual item from meal
  const handleRemoveMealItem = (mealId: string, itemId: string) => {
    const targetMeal = dateMeals.find((m) => m.id === mealId);
    if (!targetMeal) return;
    const remaining = targetMeal.items.filter((i) => i.id !== itemId);
    if (remaining.length === 0) {
      onDeleteMealLog(mealId);
    } else {
      onSaveMealLog({ ...targetMeal, items: remaining });
    }
  };

  // Toggle Supplement checklist
  const handleToggleSupplement = (id: string) => {
    const updated = supplements.map((s) =>
      s.id === id ? { ...s, takenToday: !s.takenToday } : s
    );
    onSaveSupplements(updated);
  };

  return (
    <div className="space-y-4 pb-24 text-[#F5F5F5]">
      {/* Date Bar */}
      <div className="flex items-center justify-between bg-[#121212] border border-[#1A1A1A] rounded-2xl p-2 px-3 shadow-md">
        <button
          onClick={() => {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() - 1);
            setSelectedDate(d.toISOString().split("T")[0]);
          }}
          className="p-1 rounded-xl hover:bg-[#181818] text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F5F5]">
          <Calendar className="w-4 h-4 text-[#E2FF31]" />
          <span>
            {new Date(selectedDate).toLocaleDateString(isHindi ? "hi-IN" : "en-IN", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
          {selectedDate === new Date().toISOString().split("T")[0] && (
            <span className="text-[10px] bg-[#E2FF31]/15 text-[#E2FF31] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {common.today}
            </span>
          )}
        </div>

        <button
          onClick={() => {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() + 1);
            setSelectedDate(d.toISOString().split("T")[0]);
          }}
          className="p-1 rounded-xl hover:bg-[#181818] text-gray-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Daily Calories & Macros Summary Card */}
      <div className="bg-[#121212] border border-[#1A1A1A] rounded-3xl p-5 shadow-lg space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#E2FF31]">
              {tNut.dailyNutrition}
            </span>
            <h3 className="text-xl font-serif italic text-[#F5F5F5]">
              {Math.round(totalCalories)} <span className="text-sm font-sans text-gray-500 font-normal">/ {calTarget} kcal</span>
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-[#E2FF31] bg-[#181818] px-3 py-1.5 rounded-full border border-[#E2FF31]/40 shadow-sm">
            {Math.round(remainingCalories)} kcal {tNut.left}
          </span>
        </div>

        {/* Macros Breakdown */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-3 bg-[#181818] rounded-2xl border border-[#222]">
            <span className="text-[10px] text-gray-500 block uppercase tracking-wider">{tNut.protein}</span>
            <p className="text-base font-bold font-serif text-[#E2FF31]">
              {Math.round(totalProtein)}g
            </p>
            <span className="text-[9px] text-gray-500">/ {settings.profile.proteinTargetGrams}g</span>
          </div>

          <div className="p-3 bg-[#181818] rounded-2xl border border-[#222]">
            <span className="text-[10px] text-gray-500 block uppercase tracking-wider">{tNut.carbs}</span>
            <p className="text-base font-bold font-serif text-amber-400">
              {Math.round(totalCarbs)}g
            </p>
            <span className="text-[9px] text-gray-500">/ {settings.profile.carbsTargetGrams}g</span>
          </div>

          <div className="p-3 bg-[#181818] rounded-2xl border border-[#222]">
            <span className="text-[10px] text-gray-500 block uppercase tracking-wider">{tNut.fat}</span>
            <p className="text-base font-bold font-serif text-cyan-400">
              {Math.round(totalFat)}g
            </p>
            <span className="text-[9px] text-gray-500">/ {settings.profile.fatTargetGrams}g</span>
          </div>

          <div className="p-3 bg-[#181818] rounded-2xl border border-[#222]">
            <span className="text-[10px] text-gray-500 block uppercase tracking-wider">Fiber</span>
            <p className="text-base font-bold font-serif text-emerald-400">
              {Math.round(totalFiber)}g
            </p>
            <span className="text-[9px] text-gray-500">/ 35g</span>
          </div>
        </div>
      </div>

      {/* NATURAL LANGUAGE & SPEECH AI FOOD LOGGING BOX */}
      <div className="bg-[#121212] border border-[#1A1A1A] rounded-3xl p-5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#E2FF31]">
            <Sparkles className="w-4 h-4" />
            <span className="font-serif italic text-sm text-[#F5F5F5]">{tNut.aiMealLogger}</span>
          </div>

          <select
            value={aiTargetMeal}
            onChange={(e) => setAiTargetMeal(e.target.value as MealType)}
            className="text-[11px] font-medium bg-[#181818] text-[#E2FF31] rounded-full px-3 py-1 border border-[#222] focus:outline-none capitalize"
          >
            {mealTypes.map((m) => (
              <option key={m.type} value={m.type}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-[#181818] border border-[#222] rounded-2xl p-1.5 pr-2">
          <input
            type="text"
            placeholder={tNut.aiMealPlaceholder}
            value={aiInputText}
            onChange={(e) => setAiInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleParseFoodWithAi()}
            className="flex-1 bg-transparent px-3 text-xs text-[#F5F5F5] placeholder-gray-500 focus:outline-none"
          />

          <button
            onClick={handleToggleVoiceInput}
            className={`p-2 rounded-xl transition-colors ${
              isListening
                ? "bg-rose-500 text-white animate-pulse"
                : "text-gray-400 hover:text-white"
            }`}
            title="Speech Recognition"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#E2FF31]" />}
          </button>

          <button
            onClick={handleParseFoodWithAi}
            disabled={isParsingAi || !aiInputText.trim()}
            className="px-4 py-2 bg-[#E2FF31] hover:brightness-110 disabled:opacity-50 text-[#080808] font-bold text-xs rounded-full uppercase tracking-wider transition-all flex items-center gap-1 shadow-md shadow-[#E2FF31]/20"
          >
            {isParsingAi ? (
              <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{tNut.logMeal}</span>
            )}
          </button>
        </div>
      </div>

      {/* MEALS LIST */}
      <div className="space-y-3">
        {mealTypes.map(({ type, label, icon }) => {
          const mealLog = dateMeals.find((m) => m.mealType === type);
          const mealCalories = mealLog
            ? mealLog.items.reduce((acc, curr) => acc + curr.calories, 0)
            : 0;
          const mealProtein = mealLog
            ? mealLog.items.reduce((acc, curr) => acc + curr.protein, 0)
            : 0;

          return (
            <div
              key={type}
              className="bg-[#121212] border border-[#1A1A1A] rounded-3xl p-4.5 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{icon}</span>
                  <div>
                    <h4 className="text-base font-serif italic text-[#F5F5F5]">{label}</h4>
                    {mealLog && mealLog.items.length > 0 && (
                      <p className="text-xs text-gray-400">
                        {Math.round(mealCalories)} kcal •{" "}
                        <strong className="text-[#E2FF31]">{Math.round(mealProtein)}g {tNut.protein}</strong>
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setActiveMealSearch(type)}
                  className="flex items-center gap-1 text-xs font-bold text-[#E2FF31] hover:brightness-110 bg-[#181818] border border-[#222] hover:border-[#E2FF31]/50 px-3.5 py-1.5 rounded-full uppercase tracking-wider transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{tNut.addFood}</span>
                </button>
              </div>

              {/* Logged Items */}
              {mealLog && mealLog.items.length > 0 ? (
                <div className="space-y-2 pt-2 border-t border-[#1A1A1A]">
                  {mealLog.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-[#181818] border border-[#222] rounded-2xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-medium text-[#F5F5F5]">{item.name}</p>
                        <p className="text-[11px] text-gray-400">
                          {item.quantity} {item.servingUnit} ({item.calculatedGrams}g) •{" "}
                          <span className="text-[#E2FF31] font-mono">{item.protein}g P</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-[#F5F5F5]">{item.calories} kcal</span>
                        <button
                          onClick={() => handleRemoveMealItem(mealLog.id, item.id)}
                          className="p-1.5 text-gray-500 hover:text-rose-400 transition-colors"
                          title="Delete food item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">
                  {isHindi ? "अभी तक कोई भोजन नहीं जोड़ा गया" : "No food logged yet"}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* WATER TRACKER SECTION */}
      <div className="bg-[#121212] border border-[#1A1A1A] rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-cyan-500/15 flex items-center justify-center text-cyan-400">
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base font-serif italic text-[#F5F5F5]">{tNut.waterHydration}</h4>
              <p className="text-xs text-gray-500">
                {isHindi ? "लक्ष्य" : "Target"}: {settings.profile.waterTargetMl} ml
              </p>
            </div>
          </div>
          <span className="text-base font-serif font-bold text-cyan-400">{totalWaterMl} ml</span>
        </div>

        {/* Quick Log Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "+250ml", amount: 250 },
            { label: "+500ml", amount: 500 },
            { label: "+750ml", amount: 750 },
            { label: "+1000ml", amount: 1000 },
          ].map((c) => (
            <button
              key={c.amount}
              onClick={() =>
                onAddWaterLog({
                  id: `water-${Date.now()}-${c.amount}`,
                  date: selectedDate,
                  amountMl: c.amount,
                  timestamp: new Date().toISOString(),
                })
              }
              className="py-2 px-1 bg-[#181818] border border-[#222] hover:border-cyan-500/50 rounded-2xl text-xs font-mono font-semibold text-cyan-400 transition-colors"
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUPPLEMENTS & AYURVEDIC CHECKLIST */}
      <div className="bg-[#121212] border border-[#1A1A1A] rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-[#E2FF31]" />
            <h4 className="text-base font-serif italic text-[#F5F5F5]">{tNut.supplements}</h4>
          </div>
          <span className="text-xs text-gray-400">
            {supplements.filter((s) => s.takenToday).length}/{supplements.length} {common.done}
          </span>
        </div>

        <div className="space-y-2">
          {supplements.map((supp) => (
            <div
              key={supp.id}
              onClick={() => handleToggleSupplement(supp.id)}
              className="p-3 bg-[#181818] border border-[#222] rounded-2xl flex items-center justify-between cursor-pointer hover:border-[#333] transition-colors"
            >
              <div>
                <h5 className="text-xs font-semibold text-[#F5F5F5]">{supp.name}</h5>
                <p className="text-[11px] text-gray-400">
                  {supp.dosage} • {supp.timing}
                </p>
              </div>

              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  supp.takenToday
                    ? "bg-[#E2FF31] text-[#080808] font-bold shadow-sm"
                    : "border border-neutral-700 text-transparent"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Food Search Modal */}
      {activeMealSearch && (
        <FoodSearchModal
          isOpen={true}
          mealType={activeMealSearch}
          onClose={() => setActiveMealSearch(null)}
          onAddFoodItem={handleAddFoodItem}
          onAddNewCustomFood={onSaveCustomFood}
          language={lang}
        />
      )}
    </div>
  );
};
