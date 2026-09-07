import React, { useState } from "react";
import { UserSettings, HealthConnectStatus, AppLanguage, AppTheme } from "../../types";
import { HEALTH_CONNECT_PERMISSIONS } from "../../services/healthConnect";
import {
  X,
  User,
  Heart,
  Dumbbell,
  ShieldCheck,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  Check,
  Save,
  Globe,
  Palette,
  Moon,
  Sun,
  Smartphone,
  Copy,
  ExternalLink,
  QrCode,
  Share2,
  Zap,
} from "lucide-react";
import { translations, getTranslations } from "../../utils/i18n";
import { usePWAInstall } from "../../hooks/usePWAInstall";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  healthConnect: HealthConnectStatus;
  onSaveSettings: (settings: UserSettings) => void;
  onToggleHCPermission: (key: any) => void;
  onConnectHC: () => void;
  onDisconnectHC: () => void;
  onSyncHC: () => void;
  isSyncingHC: boolean;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onImportJSON: (jsonStr: string) => boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  healthConnect,
  onSaveSettings,
  onToggleHCPermission,
  onConnectHC,
  onDisconnectHC,
  onSyncHC,
  isSyncingHC,
  onExportJSON,
  onExportCSV,
  onImportJSON,
}) => {
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [activeTab, setActiveTab] = useState<"appearance" | "profile" | "health" | "workout" | "backup" | "install">("appearance");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  if (!isOpen) return null;

  const dict = getTranslations(formData.language);
  const lang = formData.language === "hi" ? "hi" : "en";
  const t = dict.settings;
  const common = dict.common;

  // Mifflin-St Jeor BMR & TDEE calculation
  const weight = formData.profile.currentWeightKg;
  const height = formData.profile.heightCm;
  const age = formData.profile.age;
  const isMale = formData.profile.gender === "male";

  const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + (isMale ? 5 : -161));
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };
  const tdee = Math.round(bmr * (activityMultipliers[formData.profile.activityLevel] || 1.55));

  const handleSave = () => {
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 500);
  };

  const handleLanguageChange = (newLang: AppLanguage) => {
    const updated = { ...formData, language: newLang };
    setFormData(updated);
    onSaveSettings(updated); // Instant save for seamless UX
  };

  const handleThemeChange = (newTheme: AppTheme) => {
    const accentColors: Record<AppTheme, string> = {
      "dark-neon": "#E2FF31",
      "midnight-blue": "#38BDF8",
      "dark-amber": "#F59E0B",
      "clean-light": "#059669",
    };
    const updated: UserSettings = {
      ...formData,
      theme: newTheme,
      accentColor: accentColors[newTheme] || "#E2FF31",
    };
    setFormData(updated);
    onSaveSettings(updated); // Instant switch
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        const ok = onImportJSON(content);
        if (ok) {
          alert(lang === "hi" ? "बैकअप सफलतापूर्वक पुनर्स्थापित किया गया!" : "Backup successfully restored!");
          onClose();
        } else {
          alert(lang === "hi" ? "फ़ाइल पढ़ने में त्रुटि। कृपया मान्य GymGPT बैकअप चुनें।" : "Failed to parse backup JSON file. Ensure valid GymGPT format.");
        }
      }
    };
    reader.readAsText(file);
  };

  const themeOptions: { id: AppTheme; label: string; sub: string; previewBg: string; accentColor: string }[] = [
    {
      id: "dark-neon",
      label: "Dark Neon",
      sub: "Sophisticated Dark (#080808) with Neon Lime",
      previewBg: "#080808",
      accentColor: "#E2FF31",
    },
    {
      id: "midnight-blue",
      label: "Midnight Blue",
      sub: "Deep Navy Canvas (#090D16) with Cyan",
      previewBg: "#090D16",
      accentColor: "#38BDF8",
    },
    {
      id: "dark-amber",
      label: "Dark Amber",
      sub: "Luxury Charcoal (#0C0A09) with Warm Amber",
      previewBg: "#0C0A09",
      accentColor: "#F59E0B",
    },
    {
      id: "clean-light",
      label: "Clean Light",
      sub: "High Contrast Light Mode (#F4F4F6) with Emerald",
      previewBg: "#F4F4F6",
      accentColor: "#059669",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 text-[#F5F5F5]">
      <div className="bg-[#121212] border border-[#1A1A1A] w-full max-w-lg h-[92vh] sm:h-auto sm:max-h-[88vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-[#1A1A1A] flex items-center justify-between">
          <div>
            <h3 className="text-base font-serif italic text-[#F5F5F5]">GymGPT {t.title}</h3>
            <p className="text-xs text-gray-400">
              {lang === "hi"
                ? "भाषा, थीम, एथलीट प्रोफ़ाइल व हेल्थ कनेक्ट एकीकरण"
                : "Language, Themes, Athlete Profile & Health Connect"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#181818] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-[#0E0E0E] p-1.5 border-b border-[#1A1A1A] text-xs font-semibold overflow-x-auto no-scrollbar gap-1">
          {[
            { id: "appearance", label: lang === "hi" ? "भाषा व थीम" : "Language & Theme" },
            { id: "install", label: lang === "hi" ? "📱 Android ऐप" : "📱 Android App" },
            { id: "profile", label: lang === "hi" ? "प्रोफ़ाइल" : "Athlete Profile" },
            { id: "workout", label: lang === "hi" ? "वर्कआउट" : "Workout & Timer" },
            { id: "health", label: lang === "hi" ? "हेल्थ कनेक्ट" : "Health Connect" },
            { id: "backup", label: lang === "hi" ? "डेटा बैकअप" : "Backup" },
          ].map((tabItem) => (
            <button
              key={tabItem.id}
              onClick={() => setActiveTab(tabItem.id as any)}
              className={`flex-1 py-1.5 px-2.5 rounded-full whitespace-nowrap transition-all text-center ${
                activeTab === tabItem.id
                  ? "bg-[#E2FF31] text-[#080808] font-bold shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tabItem.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* TAB: LANGUAGE & THEME PREFERENCES */}
          {activeTab === "appearance" && (
            <div className="space-y-4">
              {/* Android Install Banner */}
              <div
                onClick={() => setActiveTab("install")}
                className="p-3.5 bg-gradient-to-r from-[#1A1A1A] to-[#121212] border border-[#E2FF31]/30 rounded-3xl flex items-center justify-between cursor-pointer hover:border-[#E2FF31] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#E2FF31]/15 text-[#E2FF31] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-white text-xs">
                      {lang === "hi" ? "Android स्मार्टफोन ऐप इंस्टॉल करें" : "Install on Android Smartphone"}
                    </h5>
                    <p className="text-[10px] text-gray-400">
                      {lang === "hi" ? "होम स्क्रीन आइकॉन, ऑफलाइन कैशे व फुलस्क्रीन" : "Home screen icon, offline cache & standalone"}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#E2FF31] bg-[#E2FF31]/10 px-2.5 py-1 rounded-full border border-[#E2FF31]/20">
                  {lang === "hi" ? "देखें" : "Open"}
                </span>
              </div>

              {/* 1. LANGUAGE SETTING */}
              <div className="p-4 bg-[#181818] border border-[#222] rounded-3xl space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#E2FF31]" />
                  <span className="text-sm font-serif italic text-white font-semibold">{t.language}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{t.languageDesc}</p>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleLanguageChange("en")}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      formData.language === "en"
                        ? "bg-[#121212] border-[#E2FF31] shadow-lg shadow-[#E2FF31]/10"
                        : "bg-[#121212] border-[#222] hover:border-[#333]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-sm text-white">English</span>
                      {formData.language === "en" && <Check className="w-4 h-4 text-[#E2FF31]" />}
                    </div>
                    <span className="text-[11px] text-gray-400">Default clean English interface without dual labels</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLanguageChange("hi")}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      formData.language === "hi"
                        ? "bg-[#121212] border-[#E2FF31] shadow-lg shadow-[#E2FF31]/10"
                        : "bg-[#121212] border-[#222] hover:border-[#333]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-sm text-[#E2FF31]">हिन्दी (Hindi)</span>
                      {formData.language === "hi" && <Check className="w-4 h-4 text-[#E2FF31]" />}
                    </div>
                    <span className="text-[11px] text-gray-400">सम्पूर्ण ऐप इंटरफ़ेस हिन्दी भाषा में</span>
                  </button>
                </div>
              </div>

              {/* 2. THEME SWITCHER */}
              <div className="p-4 bg-[#181818] border border-[#222] rounded-3xl space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#E2FF31]" />
                  <span className="text-sm font-serif italic text-white font-semibold">{t.theme}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{t.themeDesc}</p>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {themeOptions.map((opt) => {
                    const isSelected = formData.theme === opt.id || (opt.id === "dark-neon" && formData.theme === "dark");
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleThemeChange(opt.id)}
                        className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? "bg-[#121212] border-[#E2FF31] shadow-lg shadow-[#E2FF31]/10"
                            : "bg-[#121212] border-[#222] hover:border-[#333]"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/20"
                              style={{ backgroundColor: opt.accentColor }}
                            />
                            <span className="font-bold text-xs text-white">{opt.label}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#E2FF31]" />}
                        </div>
                        <p className="text-[10px] text-gray-400 leading-tight">{opt.sub}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: USER PROFILE & TARGETS */}
          {activeTab === "profile" && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.profile.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, name: e.target.value },
                      })
                    }
                    className="w-full bg-[#181818] border border-[#222] rounded-2xl p-2.5 text-[#F5F5F5] focus:outline-none focus:border-[#E2FF31]"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Regional Food Preference</label>
                  <select
                    value={formData.profile.regionalPreference}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: {
                          ...formData.profile,
                          regionalPreference: e.target.value as any,
                        },
                      })
                    }
                    className="w-full bg-[#181818] border border-[#222] rounded-2xl p-2.5 text-[#F5F5F5] focus:outline-none focus:border-[#E2FF31]"
                  >
                    <option value="Rajasthan">Rajasthan (Bajra, Dal Baati, Missi)</option>
                    <option value="Pan-India">Pan-India (Standard Vegetarian)</option>
                    <option value="Punjab">Punjab (Paneer, Chana, Dal Makhani)</option>
                    <option value="Gujarat">Gujarat (Thepla, Khichdi, Kathod)</option>
                    <option value="Maharashtra">Maharashtra (Jowar, Pithla, Sprouts)</option>
                    <option value="South India">South India (Dosa, Idli, Sambar, Curd)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Current Wt (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.profile.currentWeightKg}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, currentWeightKg: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-[#181818] border border-[#222] rounded-2xl p-2.5 text-[#F5F5F5] focus:outline-none focus:border-[#E2FF31]"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Target Wt (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.profile.targetWeightKg}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, targetWeightKg: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-[#181818] border border-[#222] rounded-2xl p-2.5 text-[#F5F5F5] focus:outline-none focus:border-[#E2FF31]"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.profile.heightCm}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, heightCm: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-[#181818] border border-[#222] rounded-2xl p-2.5 text-[#F5F5F5] focus:outline-none focus:border-[#E2FF31]"
                  />
                </div>
              </div>

              {/* Macro & Calories Targets */}
              <div className="p-3.5 bg-[#181818] border border-[#222] rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-200">Calculated TDEE:</span>
                  <span className="font-serif font-bold text-[#E2FF31]">{tdee} kcal</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="text-gray-400 block mb-1">Daily Calories</label>
                    <input
                      type="number"
                      value={formData.profile.calorieTarget}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          profile: { ...formData.profile, calorieTarget: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-[#121212] border border-[#222] rounded-xl p-2 font-serif text-[#F5F5F5] focus:outline-none focus:border-[#E2FF31]"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Protein Target (g)</label>
                    <input
                      type="number"
                      value={formData.profile.proteinTargetGrams}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          profile: { ...formData.profile, proteinTargetGrams: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-[#121212] border border-[#222] rounded-xl p-2 font-serif text-[#F5F5F5] focus:outline-none focus:border-[#E2FF31]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HEALTH CONNECT INTEGRATION */}
          {activeTab === "health" && (
            <div className="space-y-3.5">
              <div className="p-4 bg-[#181818] border border-[#222] rounded-3xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#121212] border border-[#222] text-[#E2FF31] flex items-center justify-center">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#F5F5F5]">Android Health Connect</h4>
                      <p className="text-xs text-gray-400">
                        {healthConnect.isConnected ? "Connected & Active" : "Disconnected"}
                      </p>
                    </div>
                  </div>

                  {healthConnect.isConnected ? (
                    <button
                      onClick={onDisconnectHC}
                      className="text-xs text-rose-400 hover:underline font-semibold"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={onConnectHC}
                      className="px-4 py-2 bg-[#E2FF31] hover:brightness-110 text-[#080808] font-bold rounded-full text-xs uppercase tracking-wider shadow-md shadow-[#E2FF31]/20"
                    >
                      Connect
                    </button>
                  )}
                </div>

                {healthConnect.isConnected && (
                  <div className="flex items-center justify-between pt-2.5 border-t border-[#222] text-gray-400">
                    <span>Last synced: {new Date(healthConnect.lastSyncedTimestamp).toLocaleTimeString()}</span>
                    <button
                      onClick={onSyncHC}
                      disabled={isSyncingHC}
                      className="flex items-center gap-1.5 text-[#E2FF31] hover:underline font-semibold"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingHC ? "animate-spin" : ""}`} />
                      <span>Sync Now</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Permissions list */}
              <div className="space-y-2">
                <h5 className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                  Permissions &amp; Data Types
                </h5>

                {HEALTH_CONNECT_PERMISSIONS.map((perm) => (
                  <div
                    key={perm.key}
                    className="p-3 bg-[#181818] border border-[#222] rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#F5F5F5]">{perm.title}</span>
                        <span className="text-[9px] bg-[#121212] text-gray-400 border border-[#222] px-1.5 py-0.5 rounded-full font-mono">
                          {perm.accessType}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{perm.description}</p>
                    </div>

                    <input
                      type="checkbox"
                      checked={!!healthConnect.permissionsGranted[perm.key]}
                      onChange={() => onToggleHCPermission(perm.key)}
                      className="rounded accent-[#E2FF31] ml-2 cursor-pointer w-4 h-4"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: WORKOUT SETTINGS & REST TIMER */}
          {activeTab === "workout" && (
            <div className="space-y-3.5">
              <div>
                <label className="text-gray-300 font-semibold block mb-1">
                  Default Rest Timer (seconds)
                </label>
                <select
                  value={formData.defaultRestSec}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultRestSec: Number(e.target.value) })
                  }
                  className="w-full bg-[#181818] border border-[#222] text-[#F5F5F5] rounded-2xl p-2.5 focus:outline-none focus:border-[#E2FF31]"
                >
                  <option value={45}>45 seconds (Circuit / Calves)</option>
                  <option value={60}>60 seconds (Standard Isolation)</option>
                  <option value={90}>90 seconds (Standard Compound)</option>
                  <option value={120}>120 seconds (Heavy Compound)</option>
                  <option value={180}>180 seconds (Strength / Powerlifting)</option>
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center justify-between p-3 bg-[#181818] border border-[#222] rounded-2xl cursor-pointer">
                  <span className="text-gray-200">Auto-start Rest Timer upon set completion</span>
                  <input
                    type="checkbox"
                    checked={formData.autoStartRestTimer}
                    onChange={(e) =>
                      setFormData({ ...formData, autoStartRestTimer: e.target.checked })
                    }
                    className="accent-[#E2FF31] w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-[#181818] border border-[#222] rounded-2xl cursor-pointer">
                  <span className="text-gray-200">Audio Beep when rest timer completes</span>
                  <input
                    type="checkbox"
                    checked={formData.restTimerSound}
                    onChange={(e) =>
                      setFormData({ ...formData, restTimerSound: e.target.checked })
                    }
                    className="accent-[#E2FF31] w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-[#181818] border border-[#222] rounded-2xl cursor-pointer">
                  <span className="text-gray-200">RPE (Rate of Perceived Exertion) Tracking</span>
                  <input
                    type="checkbox"
                    checked={formData.trackRpe}
                    onChange={(e) =>
                      setFormData({ ...formData, trackRpe: e.target.checked })
                    }
                    className="accent-[#E2FF31] w-4 h-4"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: BACKUP & RESTORE */}
          {activeTab === "backup" && (
            <div className="space-y-3.5">
              <div className="p-4 bg-[#181818] border border-[#222] rounded-3xl space-y-2.5">
                <h5 className="font-serif italic text-sm text-[#F5F5F5]">Export GymGPT Local Data</h5>
                <p className="text-xs text-gray-400">
                  Export your complete workout history, splits, meals, measurements and PRs to a portable file.
                </p>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    onClick={onExportJSON}
                    className="py-2.5 px-3 bg-[#121212] border border-[#222] hover:border-[#333] text-white rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#E2FF31]" />
                    <span>Export JSON</span>
                  </button>
                  <button
                    onClick={onExportCSV}
                    className="py-2.5 px-3 bg-[#121212] border border-[#222] hover:border-[#333] text-white rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Workouts CSV</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-[#181818] border border-[#222] rounded-3xl space-y-2.5">
                <h5 className="font-serif italic text-sm text-[#F5F5F5]">Restore from File</h5>
                <p className="text-xs text-gray-400">
                  Select a GymGPT JSON backup file to restore all your stored fitness data.
                </p>

                <label className="w-full py-3 px-3 border border-dashed border-[#333] hover:border-[#E2FF31]/50 rounded-2xl text-center font-semibold text-gray-300 hover:text-white cursor-pointer flex items-center justify-center gap-2 transition-colors">
                  <Upload className="w-4 h-4 text-[#E2FF31]" />
                  <span>Choose JSON Backup File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB: INSTALL ON ANDROID SMARTPHONE */}
          {activeTab === "install" && (
            <div className="space-y-4">
              {/* Status or 1-tap install */}
              {isInstalled ? (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-3xl flex items-center gap-3.5 text-emerald-400">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-sm">
                      {lang === "hi" ? "ऐप आपके फोन पर स्थापित है!" : "GymGPT is Installed!"}
                    </h5>
                    <p className="text-[11px] text-emerald-300/80 mt-0.5">
                      {lang === "hi"
                        ? "आप वर्तमान में पूर्ण देशी ऐप मोड (Standalone PWA) में चल रहे हैं।"
                        : "You are currently enjoying the full standalone native Android experience."}
                    </p>
                  </div>
                </div>
              ) : isInstallable ? (
                <div className="p-4 bg-[#181818] border border-[#E2FF31]/40 rounded-3xl space-y-3">
                  <div className="flex items-center gap-2 text-[#E2FF31]">
                    <Zap className="w-4 h-4" />
                    <span className="font-semibold text-sm">
                      {lang === "hi" ? "तुरंत 1-टैप इंस्टॉलेशन उपलब्ध" : "1-Tap Direct Install Available"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">
                    {lang === "hi"
                      ? "आपके डिवाइस पर प्रत्यक्ष इंस्टॉलेशन समर्थित है। ऐप को सीधे अपने Android लॉन्चर में जोड़ने के लिए नीचे टैप करें:"
                      : "Direct installation is ready in your browser. Tap below to install GymGPT into your Android app drawer:"}
                  </p>
                  <button
                    onClick={async () => {
                      await install();
                    }}
                    className="w-full py-3 bg-[#E2FF31] hover:brightness-110 text-black font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#E2FF31]/20 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{lang === "hi" ? "GymGPT ऐप अभी इंस्टॉल करें" : "Install GymGPT App Now"}</span>
                  </button>
                </div>
              ) : null}

              {/* Native Android APK & AAB Package Specification */}
              <div className="p-4 bg-[#141414] border border-[#262626] rounded-3xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#E2FF31]" />
                    <span className="font-serif italic text-sm text-white font-semibold">
                      {lang === "hi" ? "देशी Android पैकेज (APK/AAB)" : "Native Android Package (APK / AAB)"}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#E2FF31]/10 text-[#E2FF31] text-[10px] font-mono rounded-full border border-[#E2FF31]/20">
                    Capacitor Native
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-[#222]">
                    <span className="text-gray-400">Application ID:</span>
                    <span className="font-mono text-[#E2FF31]">com.gymgpt.app</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#222]">
                    <span className="text-gray-400">App Name:</span>
                    <span className="font-semibold text-white">GymGPT</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#222]">
                    <span className="text-gray-400">Target SDK:</span>
                    <span className="font-mono text-gray-300">Android 15 (API 35)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#222]">
                    <span className="text-gray-400">Min SDK:</span>
                    <span className="font-mono text-gray-300">Android 8.0 Oreo (API 26)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#222]">
                    <span className="text-gray-400">Health Connect:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Manifest &amp; Native Bridge Ready
                    </span>
                  </div>
                </div>

                {/* Build Commands */}
                <div className="bg-[#0A0A0A] p-3 rounded-2xl border border-[#222] space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                    <span>CLI Build Targets</span>
                    <span className="text-[#E2FF31]">gradlew</span>
                  </div>
                  <div className="font-mono text-[11px] text-gray-300 space-y-1 overflow-x-auto">
                    <p className="text-gray-400"># 1. Sync web bundle to Android project:</p>
                    <p className="text-[#E2FF31] bg-[#121212] p-1.5 rounded">npm run build && npx cap sync android</p>
                    <p className="text-gray-400 pt-1"># 2. Build Debug APK (Direct installation):</p>
                    <p className="text-[#E2FF31] bg-[#121212] p-1.5 rounded">cd android && ./gradlew assembleDebug</p>
                    <p className="text-[10px] text-gray-500 pl-1">↳ android/app/build/outputs/apk/debug/GymGPT-debug.apk</p>
                    <p className="text-gray-400 pt-1"># 3. Build Release APK & Play Store AAB:</p>
                    <p className="text-[#E2FF31] bg-[#121212] p-1.5 rounded">./gradlew assembleRelease bundleRelease</p>
                    <p className="text-[10px] text-gray-500 pl-1">↳ android/app/build/outputs/bundle/release/GymGPT.aab</p>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Android Guide */}
              <div className="p-4 bg-[#181818] border border-[#222] rounded-3xl space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#E2FF31]" />
                  <span className="font-serif italic text-sm text-white font-semibold">
                    {lang === "hi" ? "Android स्मार्टफोन पर कैसे लगाएं:" : "Android Smartphone Installation"}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {lang === "hi"
                    ? "GymGPT एक आधुनिक प्रोग्रेसिव वेब ऐप (PWA) है जिसे सीधे बिना प्ले स्टोर के तुरंत इंस्टॉल किया जा सकता है:"
                    : "GymGPT installs seamlessly as a Progressive Web App (PWA) with native launcher icon and offline cache:"}
                </p>

                <div className="space-y-2.5 pt-1">
                  <div className="flex items-start gap-3 p-2.5 bg-[#141414] rounded-2xl border border-[#222]">
                    <span className="w-5 h-5 rounded-full bg-[#262626] text-[#E2FF31] font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {lang === "hi" ? "Chrome या Brave में लिंक खोलें" : "Open URL in Chrome or Brave"}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {lang === "hi"
                          ? "अपने Android स्मार्टफोन पर Google Chrome या Brave ब्राउज़र खोलें।"
                          : "Open this application URL in Google Chrome or Brave on your Android smartphone."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 bg-[#141414] rounded-2xl border border-[#222]">
                    <span className="w-5 h-5 rounded-full bg-[#262626] text-[#E2FF31] font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {lang === "hi" ? "ऊपर 3-डॉट्स मेनू (⋮) दबाएं" : "Tap Chrome 3-Dots Menu (⋮)"}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {lang === "hi"
                          ? "Chrome के ऊपरी दाएं कोने में 3 बिंदुओं (⋮) पर टैप करें।"
                          : "Tap the three dots menu icon (⋮) in the top-right corner of Chrome."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 bg-[#141414] rounded-2xl border border-[#222]">
                    <span className="w-5 h-5 rounded-full bg-[#262626] text-[#E2FF31] font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {lang === "hi" ? "'Install app' या 'Add to Home screen' चुनें" : "Tap 'Install app' or 'Add to Home screen'"}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {lang === "hi"
                          ? "मेनू से 'Install app' या 'Add to Home screen' विकल्प पर टैप करें।"
                          : "Select 'Install app' (or 'Add to Home screen') from the dropdown list."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 bg-[#141414] rounded-2xl border border-[#222]">
                    <span className="w-5 h-5 rounded-full bg-[#E2FF31] text-black font-bold text-xs flex items-center justify-center shrink-0">
                      ✓
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {lang === "hi" ? "ऐप सीधे आपके फोन में आ गया!" : "App is Ready in Your App Drawer!"}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {lang === "hi"
                          ? "GymGPT का आइकॉन आपके होम स्क्रीन पर आ जाएगा। इसे दबाते ही यह बिना किसी ब्राउज़र बार के एक नेटिव ऐप की तरह खुलेगा।"
                          : "GymGPT appears in your app launcher with full-screen view, offline support, and no browser address bar."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share / Copy URL & Quick Link */}
              <div className="p-4 bg-[#181818] border border-[#222] rounded-3xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#E2FF31]" />
                    <span className="font-serif italic text-sm text-white font-semibold">
                      {lang === "hi" ? "अपने फोन पर खोलें" : "Open On Your Phone"}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Quick Link</span>
                </div>

                <div className="flex items-center gap-2 bg-[#121212] border border-[#242424] p-2 rounded-2xl">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== "undefined" ? window.location.origin : ""}
                    className="bg-transparent text-xs text-gray-300 flex-1 px-2 outline-none font-mono truncate"
                  />
                  <button
                    onClick={() => {
                      if (typeof navigator !== "undefined" && navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.origin);
                        setCopiedUrl(true);
                        setTimeout(() => setCopiedUrl(false), 2500);
                      }
                    }}
                    className={`px-3 py-2 rounded-xl flex items-center gap-1.5 font-semibold text-xs transition-all cursor-pointer ${
                      copiedUrl
                        ? "bg-emerald-500 text-white"
                        : "bg-[#E2FF31] text-black hover:brightness-110"
                    }`}
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{lang === "hi" ? "कॉपी हुआ!" : "Copied!"}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{lang === "hi" ? "कॉपी लिंक" : "Copy Link"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-[#0E0E0E] border-t border-[#1A1A1A] flex items-center justify-between">
          {saveSuccess ? (
            <span className="text-xs text-[#E2FF31] font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4" /> {common.saved || "Saved!"}
            </span>
          ) : (
            <span className="text-[10px] text-gray-500 font-mono">GymGPT v2.0 • Pro AI Fitness</span>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#181818] hover:bg-[#222] text-gray-300 rounded-full font-semibold text-xs transition-colors"
            >
              {common.cancel}
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-[#E2FF31] hover:brightness-110 text-[#080808] rounded-full font-bold text-xs uppercase tracking-wider shadow-md shadow-[#E2FF31]/20 flex items-center gap-1.5 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{common.save}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
