import React, { useState, useEffect } from "react";
import { Wifi, BatteryMedium, Sparkles, RefreshCw, Settings as SettingsIcon } from "lucide-react";
import { HealthConnectStatus, AppLanguage } from "../../types";
import { PWAInstallButton } from "../common/PWAInstallButton";

interface AndroidStatusBarProps {
  healthConnect: HealthConnectStatus;
  onOpenSettings: () => void;
  onSyncHealthConnect: () => void;
  isSyncingHC: boolean;
  language?: AppLanguage;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({
  healthConnect,
  onOpenSettings,
  onSyncHealthConnect,
  isSyncingHC,
  language = "en",
}) => {
  const [timeStr, setTimeStr] = useState<string>("9:41");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formatted = `${hours % 12 || 12}:${minutes < 10 ? "0" : ""}${minutes}`;
      setTimeStr(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const isHindi = language === "hi";

  return (
    <header className="sticky top-0 z-30 bg-[#080808]/95 backdrop-blur-md border-b border-[#1A1A1A] text-[#F5F5F5] px-4 pt-2 pb-2.5">
      {/* Android System Status Bar Row */}
      <div className="flex items-center justify-between text-xs font-medium text-neutral-500 select-none">
        <span className="font-semibold text-neutral-300 tracking-tight">{timeStr}</span>
        <div className="flex items-center space-x-2">
          {healthConnect.isConnected && (
            <button
              onClick={onSyncHealthConnect}
              disabled={isSyncingHC}
              title="Health Connect Active - Tap to Sync"
              className="flex items-center gap-1 text-[10px] font-semibold text-[#E2FF31] bg-[#121212] border border-[#222] px-2 py-0.5 rounded-full hover:border-[#E2FF31]/40 transition-colors"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isSyncingHC ? "animate-spin text-[#E2FF31]" : ""}`} />
              <span>Health Connect</span>
            </button>
          )}
          <span className="text-[10px] px-1 font-bold text-neutral-400">5G</span>
          <Wifi className="w-3.5 h-3.5 text-neutral-400" />
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-neutral-400">88%</span>
            <BatteryMedium className="w-3.5 h-3.5 text-neutral-400" />
          </div>
        </div>
      </div>

      {/* App Branding & Header Controls */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-[#E2FF31] to-[#ADFF00] rounded-xl flex items-center justify-center text-[#080808] font-black text-base shadow-sm shadow-[#E2FF31]/20">
            G
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-serif italic tracking-tight font-bold text-[#F5F5F5]">GymGPT</h1>
              <span className="text-[9px] bg-[#E2FF31]/10 text-[#E2FF31] font-semibold px-2 py-0.5 rounded-full border border-[#E2FF31]/30 uppercase tracking-wider">
                {isHindi ? "शाकाहारी" : "VEGETARIAN"}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-tight">
              {isHindi ? "एआई वर्कआउट ट्रैकर एवं भारतीय पोषण" : "AI Workout Tracker & Indian Nutrition"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <PWAInstallButton language={language} variant="header" />
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-full border border-neutral-800 bg-[#121212] flex items-center justify-center text-neutral-400 hover:text-[#E2FF31] hover:border-[#E2FF31]/40 transition-colors"
            title="App Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
