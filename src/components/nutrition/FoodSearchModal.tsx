import React, { useState } from "react";
import { FoodItem, MealType, AppLanguage } from "../../types";
import { INDIAN_FOOD_DATABASE } from "../../data/foodDatabase";
import { X, Search, Plus, Check, ChevronDown } from "lucide-react";
import { getMealName } from "../../utils/i18n";

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: MealType;
  onAddFoodItem: (mealType: MealType, foodItem: FoodItem, quantity: number, servingUnit: string) => void;
  onAddNewCustomFood?: (food: FoodItem) => void;
  language?: AppLanguage;
}

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({
  isOpen,
  onClose,
  mealType,
  onAddFoodItem,
  onAddNewCustomFood,
  language = "en",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedUnit, setSelectedUnit] = useState<string>("");

  // Custom Food Form state
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customHindi, setCustomHindi] = useState("");
  const [customCals, setCustomCals] = useState<number>(150);
  const [customProtein, setCustomProtein] = useState<number>(8);
  const [customCarbs, setCustomCarbs] = useState<number>(20);
  const [customFat, setCustomFat] = useState<number>(4);

  if (!isOpen) return null;

  const isHindi = language === "hi";

  const categories = [
    "All",
    "Rajasthani Specialties",
    "Dals & Pulses",
    "Dairy",
    "Staples & Grains",
    "Vegetables",
    "Regional Delicacies",
  ];

  const categoryLabelsHindi: Record<string, string> = {
    All: "सभी",
    "Rajasthani Specialties": "राजस्थानी व्यंजन",
    "Dals & Pulses": "दाल व दलहन",
    Dairy: "डेयरी (दूध-पनीर)",
    "Staples & Grains": "अनाज व रोटियां",
    Vegetables: "सब्जियां",
    "Regional Delicacies": "क्षेत्रीय व्यंजन",
  };

  const filteredFoods = INDIAN_FOOD_DATABASE.filter((food) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      food.name.toLowerCase().includes(q) ||
      food.hindiName.toLowerCase().includes(q) ||
      (food.regionalOrigin && food.regionalOrigin.toLowerCase().includes(q));
    const matchesCategory = selectedCategory === "All" || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setSelectedUnit(food.standardServingUnit);
    setQuantity(1);
  };

  const handleConfirmAdd = () => {
    if (!selectedFood) return;
    onAddFoodItem(mealType, selectedFood, Number(quantity) || 1, selectedUnit);
    onClose();
  };

  const handleSaveCustom = () => {
    if (!customName.trim()) return;
    const newFood: FoodItem = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      hindiName: customHindi.trim() || customName.trim(),
      category: "Regional Delicacies",
      servingSizeGrams: 100,
      standardServingUnit: "katori / bowl",
      servings: [
        { name: "katori / bowl", gramsEquivalent: 150 },
        { name: "grams", gramsEquivalent: 1 },
      ],
      calories: Number(customCals) || 0,
      protein: Number(customProtein) || 0,
      carbs: Number(customCarbs) || 0,
      fat: Number(customFat) || 0,
      fiber: 2,
    };
    if (onAddNewCustomFood) {
      onAddNewCustomFood(newFood);
    }
    onAddFoodItem(mealType, newFood, 1, "katori / bowl");
    onClose();
  };

  // Calculate dynamic nutritional values based on serving unit and quantity
  let currentCalculatedGrams = 100;
  if (selectedFood) {
    const matchedServing = selectedFood.servings.find((s) => s.name === selectedUnit);
    const gramsPerUnit = matchedServing ? matchedServing.gramsEquivalent : selectedFood.servingSizeGrams;
    currentCalculatedGrams = gramsPerUnit * (Number(quantity) || 1);
  }

  const calculatedCalories = selectedFood
    ? Math.round((selectedFood.calories * currentCalculatedGrams) / 100)
    : 0;
  const calculatedProtein = selectedFood
    ? +((selectedFood.protein * currentCalculatedGrams) / 100).toFixed(1)
    : 0;
  const calculatedCarbs = selectedFood
    ? +((selectedFood.carbs * currentCalculatedGrams) / 100).toFixed(1)
    : 0;
  const calculatedFat = selectedFood
    ? +((selectedFood.fat * currentCalculatedGrams) / 100).toFixed(1)
    : 0;

  const currentLang: AppLanguage = language === "hi" ? "hi" : "en";
  const mealLabel = getMealName(mealType, currentLang);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 text-[#F5F5F5]">
      <div className="bg-[#121212] border border-[#1A1A1A] w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#1A1A1A] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#E2FF31]">
              {isHindi ? `लॉग करें: ${mealLabel}` : `Log to ${mealLabel}`}
            </span>
            <h3 className="text-base font-serif italic text-[#F5F5F5]">
              {isHindi ? "भारतीय शाकाहारी खाद्य लाइब्रेरी" : "Indian Vegetarian Food Library"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#181818] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isCreatingCustom ? (
          <>
            {/* Search & Category Tabs */}
            <div className="p-3.5 border-b border-[#1A1A1A] space-y-2.5 bg-[#0E0E0E]">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder={
                    isHindi
                      ? "भोजन या व्यंजन खोजें (जैसे बाजरा रोटी, दाल, पनीर)..."
                      : "Search food or dish (e.g. Bajra roti, Dal, Paneer)..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#181818] border border-[#222] rounded-2xl text-xs text-[#F5F5F5] placeholder-gray-500 focus:border-[#E2FF31] focus:outline-none"
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? "bg-[#E2FF31] text-[#080808] font-bold"
                        : "bg-[#181818] text-gray-400 hover:text-white border border-[#222]"
                    }`}
                  >
                    {isHindi ? categoryLabelsHindi[cat] || cat : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content Area (Food List or Selected Details) */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
              {filteredFoods.map((food) => {
                const isSelected = selectedFood?.id === food.id;
                const displayName = isHindi && food.hindiName ? food.hindiName : food.name;
                const subtitle = isHindi && food.hindiName ? food.name : null;

                return (
                  <div
                    key={food.id}
                    onClick={() => handleSelectFood(food)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#181818] border-[#E2FF31] shadow-lg shadow-[#E2FF31]/5"
                        : "bg-[#181818] border-[#222] hover:border-[#333]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-[#F5F5F5]">{displayName}</h4>
                        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] bg-[#121212] text-[#E2FF31] border border-[#222] px-2 py-0.5 rounded-full font-medium">
                            {food.regionalOrigin}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {isHindi ? categoryLabelsHindi[food.category] || food.category : food.category}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-serif font-bold text-[#F5F5F5]">
                          {food.calories} kcal
                        </span>
                        <p className="text-[10px] text-gray-500">per 100g</p>
                        <span className="text-[10px] font-serif text-[#E2FF31] font-semibold block mt-0.5">
                          {food.protein}g P
                        </span>
                      </div>
                    </div>

                    {/* Expandable Serving Unit & Quantity Selector */}
                    {isSelected && (
                      <div className="mt-3.5 pt-3.5 border-t border-[#222] space-y-3">
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                              {isHindi ? "मात्रा (Quantity)" : "Quantity"}
                            </label>
                            <input
                              type="number"
                              min="0.1"
                              step="0.5"
                              value={quantity}
                              onChange={(e) => setQuantity(Number(e.target.value))}
                              className="w-full text-center py-2 bg-[#121212] border border-[#222] rounded-xl text-xs font-serif font-bold text-[#F5F5F5] focus:border-[#E2FF31] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                              {isHindi ? "इकाई (Serving Unit)" : "Serving Unit"}
                            </label>
                            <select
                              value={selectedUnit}
                              onChange={(e) => setSelectedUnit(e.target.value)}
                              className="w-full py-2 px-2.5 bg-[#121212] border border-[#222] rounded-xl text-xs text-gray-300 focus:outline-none"
                            >
                              {food.servings.map((s) => (
                                <option key={s.name} value={s.name}>
                                  {s.name} ({s.gramsEquivalent}g)
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Instant Macro Calculation Pill */}
                        <div className="grid grid-cols-4 gap-1.5 p-2.5 bg-[#121212] rounded-2xl text-center text-xs font-serif border border-[#222]">
                          <div>
                            <span className="text-[9px] font-sans text-gray-500 block uppercase">
                              {isHindi ? "कैलोरी" : "Calories"}
                            </span>
                            <strong className="text-[#F5F5F5]">{calculatedCalories}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] font-sans text-gray-500 block uppercase">
                              {isHindi ? "प्रोटीन" : "Protein"}
                            </span>
                            <strong className="text-[#E2FF31]">{calculatedProtein}g</strong>
                          </div>
                          <div>
                            <span className="text-[9px] font-sans text-gray-500 block uppercase">
                              {isHindi ? "कार्ब्स" : "Carbs"}
                            </span>
                            <strong className="text-amber-400">{calculatedCarbs}g</strong>
                          </div>
                          <div>
                            <span className="text-[9px] font-sans text-gray-500 block uppercase">
                              {isHindi ? "फैट" : "Fat"}
                            </span>
                            <strong className="text-cyan-400">{calculatedFat}g</strong>
                          </div>
                        </div>

                        <button
                          onClick={handleConfirmAdd}
                          className="w-full py-2.5 bg-[#E2FF31] hover:brightness-110 text-[#080808] font-bold rounded-full text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#E2FF31]/20"
                        >
                          <Plus className="w-4 h-4" />
                          <span>
                            {isHindi ? `${mealLabel} में जोड़ें` : `Add to ${mealLabel}`}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Custom Food Prompt */}
              <div className="pt-2 text-center">
                <button
                  onClick={() => setIsCreatingCustom(true)}
                  className="text-xs text-gray-400 hover:text-[#E2FF31] underline font-medium"
                >
                  {isHindi
                    ? "क्या भोजन नहीं मिला? अपना कस्टम व्यंजन जोड़ें"
                    : "Can't find an item? Create a custom food item"}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* CREATE CUSTOM FOOD FORM */
          <div className="p-5 space-y-3.5 flex-1 overflow-y-auto">
            <h4 className="text-base font-serif italic text-[#F5F5F5]">
              {isHindi ? "कस्टम भोजन जोड़ें" : "Create Custom Food Item"}
            </h4>

            <div>
              <label className="text-xs text-gray-400 block mb-1">
                {isHindi ? "भोजन का नाम (अंग्रेज़ी)" : "Food Name (English)"}
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Homemade Methi Paneer Paratha"
                className="w-full bg-[#181818] border border-[#222] rounded-2xl p-2.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#E2FF31]"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">
                {isHindi ? "क्षेत्रीय / हिन्दी नाम (वैकल्पिक)" : "Regional / Hindi Name (Optional)"}
              </label>
              <input
                type="text"
                value={customHindi}
                onChange={(e) => setCustomHindi(e.target.value)}
                placeholder="e.g. मेथी पनीर पराठा"
                className="w-full bg-[#181818] border border-[#222] rounded-2xl p-2.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#E2FF31]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  {isHindi ? "कैलोरी (प्रति 100g)" : "Calories (per 100g)"}
                </label>
                <input
                  type="number"
                  value={customCals}
                  onChange={(e) => setCustomCals(Number(e.target.value))}
                  className="w-full bg-[#181818] border border-[#222] rounded-2xl p-2.5 text-xs font-serif text-[#F5F5F5] focus:outline-none focus:border-[#E2FF31]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  {isHindi ? "प्रोटीन (g)" : "Protein (g)"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(Number(e.target.value))}
                  className="w-full bg-[#181818] border border-[#222] rounded-2xl p-2.5 text-xs font-serif text-[#F5F5F5] focus:outline-none focus:border-[#E2FF31]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  {isHindi ? "कार्ब्स (g)" : "Carbs (g)"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(Number(e.target.value))}
                  className="w-full bg-[#181818] border border-[#222] rounded-2xl p-2.5 text-xs font-serif text-[#F5F5F5] focus:outline-none focus:border-[#E2FF31]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  {isHindi ? "फैट (g)" : "Fat (g)"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customFat}
                  onChange={(e) => setCustomFat(Number(e.target.value))}
                  className="w-full bg-[#181818] border border-[#222] rounded-2xl p-2.5 text-xs font-serif text-[#F5F5F5] focus:outline-none focus:border-[#E2FF31]"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setIsCreatingCustom(false)}
                className="flex-1 py-3 bg-[#181818] hover:bg-[#222] text-gray-300 rounded-full text-xs font-semibold"
              >
                {isHindi ? "खोज पर लौटें" : "Back to Search"}
              </button>
              <button
                onClick={handleSaveCustom}
                className="flex-1 py-3 bg-[#E2FF31] hover:brightness-110 text-[#080808] font-bold rounded-full text-xs uppercase tracking-wider shadow-md shadow-[#E2FF31]/20"
              >
                {isHindi ? "सहेजें व जोड़ें" : "Save & Log Food"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
