import React from "react";
import { TabType, AppLanguage } from "../../types";
import { Home, Dumbbell, Utensils, TrendingUp, Sparkles, Plus } from "lucide-react";
import { translations, getTranslations } from "../../utils/i18n";

interface BottomNavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenQuickAdd: () => void;
  hasActiveWorkout: boolean;
  onOpenActiveWorkout: () => void;
  language?: AppLanguage;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickAdd,
  hasActiveWorkout,
  onOpenActiveWorkout,
  language = "en",
}) => {
  const dict = getTranslations(language);
  const tNav = dict.nav || dict.tabs;

  const tabs = [
    { id: "home" as TabType, label: tNav.home, icon: Home },
    { id: "workout" as TabType, label: tNav.workout, icon: Dumbbell },
    { id: "nutrition" as TabType, label: tNav.nutrition, icon: Utensils },
    { id: "progress" as TabType, label: tNav.progress, icon: TrendingUp },
    { id: "coach" as TabType, label: tNav.coach, icon: Sparkles },
  ];

  return (
    <>
      {/* Active Workout Banner (Sticky above nav if workout in progress) */}
      {hasActiveWorkout && (
        <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-3 z-30 pointer-events-auto">
          <button
            onClick={onOpenActiveWorkout}
            className="w-full bg-[#121212] hover:bg-[#181818] text-[#F5F5F5] p-3 rounded-2xl shadow-xl flex items-center justify-between border border-[#E2FF31]/50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E2FF31] animate-ping" />
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#E2FF31]">
                  {language === "hi" ? "वर्कआउट जारी है" : "Workout In Progress"}
                </p>
                <p className="text-sm font-semibold leading-none text-white">
                  {language === "hi" ? "लाइव सत्र जारी रखने हेतु टैप करें" : "Tap to resume live workout session"}
                </p>
              </div>
            </div>
            <span className="text-xs bg-[#E2FF31] text-[#080808] px-3 py-1 rounded-full font-bold">
              {language === "hi" ? "जारी रखें →" : "Resume →"}
            </span>
          </button>
        </div>
      )}

      {/* Floating Action Button (Quick Add) */}
      <div className="fixed bottom-20 right-4 z-20 max-w-md pointer-events-auto">
        <button
          onClick={onOpenQuickAdd}
          className="w-12 h-12 rounded-full bg-[#E2FF31] hover:brightness-110 text-[#080808] font-bold flex items-center justify-center shadow-xl shadow-[#E2FF31]/20 hover:scale-105 active:scale-95 transition-all border border-[#ADFF00]"
          title="Quick Log Food, Water or Workout"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#080808]/95 backdrop-blur-lg border-t border-[#1A1A1A] pb-safe">
        <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                  isActive
                    ? "text-[#E2FF31] font-bold"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <div
                  className={`p-1 rounded-full transition-transform ${
                    isActive ? "bg-[#E2FF31]/15 scale-110" : ""
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-[#E2FF31]" : "text-gray-500"}`} />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium uppercase">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
