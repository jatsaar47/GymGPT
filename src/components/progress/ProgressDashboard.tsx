import React, { useState, useMemo } from "react";
import {
  WorkoutSession,
  BodyMeasurementEntry,
  PersonalRecord,
  UserSettings,
  AppLanguage,
} from "../../types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  Scale,
  TrendingUp,
  Dumbbell,
  Calendar,
  Plus,
  Flame,
  Activity,
  Award,
  Maximize2,
  Info,
  CheckCircle2,
} from "lucide-react";
import { translations, getTranslations } from "../../utils/i18n";

interface ProgressDashboardProps {
  settings: UserSettings;
  workoutSessions: WorkoutSession[];
  measurements: BodyMeasurementEntry[];
  personalRecords: PersonalRecord[];
  onSaveMeasurement: (entry: BodyMeasurementEntry) => void;
  language?: AppLanguage;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  settings,
  workoutSessions,
  measurements,
  personalRecords,
  onSaveMeasurement,
  language = "en",
}) => {
  const dict = getTranslations(language || settings?.language);
  const currentLang = (language || settings?.language) === "hi" ? "hi" : "en";
  const isHindi = currentLang === "hi";
  const tProg = dict.progress;
  const common = dict.common;

  const [timeFilter, setTimeFilter] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [activeMetricView, setActiveMetricView] = useState<"weight-muscle" | "measurements" | "volume">("weight-muscle");

  // Log Measurement Modal state
  const [showLogModal, setShowLogModal] = useState(false);
  const [inputWeight, setInputWeight] = useState<number>(settings.profile.currentWeightKg);
  const [inputBodyFat, setInputBodyFat] = useState<number>(15.5);
  const [inputChest, setInputChest] = useState<number>(101.5);
  const [inputWaist, setInputWaist] = useState<number>(81.0);
  const [inputBiceps, setInputBiceps] = useState<number>(36.2);
  const [inputThighs, setInputThighs] = useState<number>(58.0);

  // Filter measurements based on time range
  const filteredMeasurements = useMemo(() => {
    if (measurements.length === 0) return [];
    const sorted = [...measurements].sort((a, b) => a.date.localeCompare(b.date));

    if (timeFilter === "all") return sorted;

    const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
    const cutoffTime = Date.now() - daysMap[timeFilter] * 86400000;
    const filtered = sorted.filter((m) => new Date(m.date).getTime() >= cutoffTime);
    return filtered.length > 0 ? filtered : sorted.slice(-3);
  }, [measurements, timeFilter]);

  // Transform measurements for Recharts
  const chartData = useMemo(() => {
    return filteredMeasurements.map((m) => {
      const bf = m.bodyFatPercent ?? 15.6;
      const leanMass = +((m.weightKg * (1 - bf / 100))).toFixed(1);
      const d = new Date(m.date);
      const formattedDate = d.toLocaleDateString(isHindi ? "hi-IN" : "en-US", {
        month: "short",
        day: "numeric",
      });

      return {
        date: m.date,
        displayDate: formattedDate,
        weight: m.weightKg,
        leanMass,
        bodyFat: bf,
        biceps: m.bicepsCm ?? null,
        chest: m.chestCm ?? null,
        waist: m.waistCm ?? null,
        thighs: m.thighsCm ?? null,
      };
    });
  }, [filteredMeasurements, isHindi]);

  // Volume Chart Data from workouts
  const volumeChartData = useMemo(() => {
    const sortedWorkouts = [...workoutSessions].sort((a, b) => a.date.localeCompare(b.date));
    return sortedWorkouts.slice(-10).map((w) => {
      const d = new Date(w.date);
      return {
        date: w.date.split("T")[0],
        displayDate: d.toLocaleDateString(isHindi ? "hi-IN" : "en-US", {
          month: "short",
          day: "numeric",
        }),
        volume: w.totalVolumeKg,
        name: w.name,
        sets: w.totalSets,
      };
    });
  }, [workoutSessions, isHindi]);

  // Latest and Initial points for summary delta stats
  const latestEntry = filteredMeasurements[filteredMeasurements.length - 1] || {
    weightKg: settings.profile.currentWeightKg,
    bodyFatPercent: 15.6,
    chestCm: 101.5,
    waistCm: 81.0,
    bicepsCm: 36.2,
    thighsCm: 58.0,
    date: new Date().toISOString().split("T")[0],
  };

  const firstEntry = filteredMeasurements[0] || latestEntry;

  // Weight and muscle deltas
  const weightDelta = +(latestEntry.weightKg - firstEntry.weightKg).toFixed(1);
  const firstLeanMass = firstEntry.weightKg * (1 - (firstEntry.bodyFatPercent ?? 15.6) / 100);
  const latestLeanMass = latestEntry.weightKg * (1 - (latestEntry.bodyFatPercent ?? 15.6) / 100);
  const muscleGainDelta = +(latestLeanMass - firstLeanMass).toFixed(1);
  const bicepsDelta = latestEntry.bicepsCm && firstEntry.bicepsCm ? +(latestEntry.bicepsCm - firstEntry.bicepsCm).toFixed(1) : 0;

  // BMI Calculation
  const heightM = settings.profile.heightCm / 100;
  const bmi = +(latestEntry.weightKg / (heightM * heightM)).toFixed(1);
  const totalVolume = workoutSessions.reduce((acc, curr) => acc + curr.totalVolumeKg, 0);

  const handleConfirmSaveMeasurement = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const newEntry: BodyMeasurementEntry = {
      id: `m-${Date.now()}`,
      date: todayStr,
      weightKg: Number(inputWeight) || settings.profile.currentWeightKg,
      bodyFatPercent: Number(inputBodyFat) || undefined,
      chestCm: Number(inputChest) || undefined,
      waistCm: Number(inputWaist) || undefined,
      bicepsCm: Number(inputBiceps) || undefined,
      thighsCm: Number(inputThighs) || undefined,
    };
    onSaveMeasurement(newEntry);
    setShowLogModal(false);
  };

  // Custom Recharts Tooltip Component
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#181818]/95 backdrop-blur-md p-3 rounded-2xl border border-[#2A2A2A] shadow-2xl text-xs space-y-1.5 z-50">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-mono border-b border-[#2A2A2A] pb-1">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-gray-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <strong className="font-mono text-[#F5F5F5]">
                {entry.value} {entry.unit || ""}
              </strong>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 pb-24 text-[#F5F5F5]">
      {/* Top Banner & Log Action */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#E2FF31]">
            {isHindi ? "बायोमेट्रिक्स व प्रगति" : "Progress & Biometrics"}
          </span>
          <h2 className="text-2xl font-serif italic text-[#F5F5F5] font-semibold tracking-tight">
            {isHindi ? "प्रगति विश्लेषण व चार्ट्स" : "Analytics & Trends"}
          </h2>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="flex items-center gap-1.5 bg-[#E2FF31] hover:brightness-110 text-[#080808] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#E2FF31]/20 cursor-pointer"
        >
          <Scale className="w-3.5 h-3.5" />
          <span>{isHindi ? "माप दर्ज करें" : "Log Weight"}</span>
        </button>
      </div>

      {/* Primary Highlight Metrics */}
      <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
        <div className="p-3.5 bg-[#121212] border border-[#1A1A1A] rounded-3xl shadow-lg">
          <span className="text-[10px] uppercase tracking-widest text-gray-500">
            {isHindi ? "वर्तमान वज़न" : "Weight"}
          </span>
          <p className="text-xl font-bold font-serif text-[#F5F5F5] mt-0.5">
            {latestEntry.weightKg} <span className="text-xs font-sans text-gray-500 font-normal">kg</span>
          </p>
          <span className="text-[10px] text-[#E2FF31] font-medium">
            {weightDelta >= 0 ? `+${weightDelta}kg` : `${weightDelta}kg`} ({timeFilter})
          </span>
        </div>

        <div className="p-3.5 bg-[#121212] border border-[#1A1A1A] rounded-3xl shadow-lg">
          <span className="text-[10px] uppercase tracking-widest text-gray-500">
            {isHindi ? "मांसपेशी बढ़त" : "Muscle Gain"}
          </span>
          <p className="text-xl font-bold font-serif text-[#38BDF8] mt-0.5">
            {muscleGainDelta >= 0 ? `+${muscleGainDelta}` : `${muscleGainDelta}`}{" "}
            <span className="text-xs font-sans text-gray-500 font-normal">kg</span>
          </p>
          <span className="text-[10px] text-gray-400">
            {isHindi ? "अनुमानित लीन मास" : "Lean Mass Est."}
          </span>
        </div>

        <div className="p-3.5 bg-[#121212] border border-[#1A1A1A] rounded-3xl shadow-lg">
          <span className="text-[10px] uppercase tracking-widest text-gray-500">
            {isHindi ? "बीएमआई" : "BMI"}
          </span>
          <p className="text-xl font-bold font-serif text-[#E2FF31] mt-0.5">{bmi}</p>
          <span className="text-[10px] text-gray-400">
            {isHindi ? "सामान्य श्रेणी" : "Normal Range"}
          </span>
        </div>
      </div>

      {/* Time Range Selector & View Tabs */}
      <div className="space-y-2">
        <div className="flex bg-[#121212] p-1.5 rounded-2xl border border-[#1A1A1A] text-xs">
          {[
            { id: "7d", label: isHindi ? "7 दिन" : "7 Days" },
            { id: "30d", label: isHindi ? "30 दिन" : "30 Days" },
            { id: "90d", label: isHindi ? "3 महीने" : "3 Months" },
            { id: "all", label: isHindi ? "सभी समय" : "All Time" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeFilter(t.id as any)}
              className={`flex-1 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                timeFilter === t.id
                  ? "bg-[#181818] text-[#E2FF31] font-bold border border-[#222]"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex bg-[#121212] p-1.5 rounded-2xl border border-[#1A1A1A]">
          <button
            onClick={() => setActiveMetricView("weight-muscle")}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
              activeMetricView === "weight-muscle"
                ? "bg-[#E2FF31] text-[#080808] font-bold shadow-sm"
                : "text-gray-500 hover:text-white"
            }`}
          >
            {isHindi ? "वज़न व मांसपेशी (Recharts)" : "Weight & Muscle Gain"}
          </button>
          <button
            onClick={() => setActiveMetricView("measurements")}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
              activeMetricView === "measurements"
                ? "bg-[#E2FF31] text-[#080808] font-bold shadow-sm"
                : "text-gray-500 hover:text-white"
            }`}
          >
            {isHindi ? "शारीरिक माप (cm)" : "Circumference (cm)"}
          </button>
          <button
            onClick={() => setActiveMetricView("volume")}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
              activeMetricView === "volume"
                ? "bg-[#E2FF31] text-[#080808] font-bold shadow-sm"
                : "text-gray-500 hover:text-white"
            }`}
          >
            {isHindi ? "ट्रेनिंग वॉल्यूम" : "Training Volume"}
          </button>
        </div>
      </div>

      {/* VIEW 1: RECHARTS WEIGHT & MUSCLE GAIN VISUALIZATION */}
      {activeMetricView === "weight-muscle" && (
        <div className="bg-[#121212] border border-[#1A1A1A] rounded-3xl p-5 shadow-lg space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#E2FF31]" />
                <h4 className="text-base font-serif italic text-[#F5F5F5]">
                  {isHindi ? "वज़न व मांसपेशी बढ़त ट्रैकर" : "Weight & Muscle Gain Progress Chart"}
                </h4>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {isHindi
                  ? "शरीर का कुल वज़न (kg) एवं अनुमानित लीन मसल मास की समय अनुसार बढ़त"
                  : "Tracking total bodyweight and lean muscle mass trajectory over time"}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">
                {isHindi ? "लक्ष्य वज़न" : "Target Goal"}
              </span>
              <span className="text-xs font-bold text-[#E2FF31] font-mono">
                {settings.profile.targetWeightKg}.0 kg
              </span>
            </div>
          </div>

          {/* Recharts Area / Line Chart Container */}
          <div className="h-64 w-full bg-[#181818] p-3 rounded-2xl border border-[#222]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {/* Weight Gradient */}
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E2FF31" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#E2FF31" stopOpacity={0.0} />
                  </linearGradient>
                  {/* Muscle Mass Gradient */}
                  <linearGradient id="muscleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="#222" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  stroke="#666"
                  tick={{ fill: "#888", fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: "#333" }}
                />
                <YAxis
                  stroke="#666"
                  domain={["dataMin - 2", "dataMax + 2"]}
                  tick={{ fill: "#888", fontSize: 10, fontFamily: "monospace" }}
                  tickLine={false}
                  axisLine={{ stroke: "#333" }}
                />
                <Tooltip content={<CustomChartTooltip />} />

                {/* Target Weight Reference Line */}
                <ReferenceLine
                  y={settings.profile.targetWeightKg}
                  stroke="#A8A29E"
                  strokeDasharray="4 4"
                  label={{
                    value: isHindi ? `लक्ष्य: ${settings.profile.targetWeightKg}kg` : `Goal: ${settings.profile.targetWeightKg}kg`,
                    fill: "#A8A29E",
                    fontSize: 9,
                    position: "insideTopRight",
                  }}
                />

                {/* Lean Muscle Mass Area */}
                <Area
                  type="monotone"
                  dataKey="leanMass"
                  name={isHindi ? "लीन मांसपेशी (Lean Mass)" : "Lean Muscle Mass"}
                  unit="kg"
                  stroke="#38BDF8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#muscleGrad)"
                  dot={{ r: 3, fill: "#38BDF8", stroke: "#080808", strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: "#38BDF8" }}
                />

                {/* Total Body Weight Area */}
                <Area
                  type="monotone"
                  dataKey="weight"
                  name={isHindi ? "कुल वज़न (Weight)" : "Body Weight"}
                  unit="kg"
                  stroke="#E2FF31"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#weightGrad)"
                  dot={{ r: 3.5, fill: "#E2FF31", stroke: "#080808", strokeWidth: 1.5 }}
                  activeDot={{ r: 6, fill: "#E2FF31" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legend & Insights Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs border-t border-[#1A1A1A]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs text-[#E2FF31] font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E2FF31]" />
                {isHindi ? "कुल वज़न (kg)" : "Body Weight (kg)"}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#38BDF8] font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                {isHindi ? "लीन मांसपेशी (kg)" : "Lean Muscle (kg)"}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-[#181818] px-3 py-1 rounded-full border border-[#222]">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] text-gray-300">
                {isHindi
                  ? `मांसपेशी बढ़त दर: +${muscleGainDelta}kg`
                  : `Net Muscle Accretion: +${muscleGainDelta}kg`}
              </span>
            </div>
          </div>

          {/* Biometrics Summary Pills */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono pt-1">
            <div className="p-2.5 bg-[#181818] rounded-2xl border border-[#222]">
              <span className="text-[10px] text-gray-500 block uppercase font-sans">
                {isHindi ? "सीना (Chest)" : "Chest"}
              </span>
              <strong className="text-[#F5F5F5] font-serif">{latestEntry.chestCm || 101.5} cm</strong>
            </div>
            <div className="p-2.5 bg-[#181818] rounded-2xl border border-[#222]">
              <span className="text-[10px] text-gray-500 block uppercase font-sans">
                {isHindi ? "कमर (Waist)" : "Waist"}
              </span>
              <strong className="text-[#F5F5F5] font-serif">{latestEntry.waistCm || 81.0} cm</strong>
            </div>
            <div className="p-2.5 bg-[#181818] rounded-2xl border border-[#222]">
              <span className="text-[10px] text-gray-500 block uppercase font-sans">
                {isHindi ? "बाइसेप्स (Biceps)" : "Biceps"}
              </span>
              <strong className="text-[#E2FF31] font-serif">{latestEntry.bicepsCm || 36.2} cm</strong>
              {bicepsDelta > 0 && (
                <span className="text-[9px] text-[#E2FF31] block">+{bicepsDelta}cm</span>
              )}
            </div>
            <div className="p-2.5 bg-[#181818] rounded-2xl border border-[#222]">
              <span className="text-[10px] text-gray-500 block uppercase font-sans">
                {isHindi ? "जांघें (Thighs)" : "Thighs"}
              </span>
              <strong className="text-[#F5F5F5] font-serif">{latestEntry.thighsCm || 58.0} cm</strong>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: RECHARTS BODY CIRCUMFERENCE (CM) */}
      {activeMetricView === "measurements" && (
        <div className="bg-[#121212] border border-[#1A1A1A] rounded-3xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-serif italic text-[#F5F5F5]">
                {isHindi ? "मांसपेशी वृद्धि एवं परिधि (cm)" : "Muscle Circumference Progression"}
              </h4>
              <p className="text-xs text-gray-400">
                {isHindi
                  ? "बाइसेप्स, सीना, जांघ व कमर के आकार में परिवर्तन का ग्राफ"
                  : "Hypertrophy growth tracking across major muscle circumferences"}
              </p>
            </div>
          </div>

          <div className="h-64 w-full bg-[#181818] p-3 rounded-2xl border border-[#222]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#222" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  stroke="#666"
                  tick={{ fill: "#888", fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: "#333" }}
                />
                <YAxis
                  stroke="#666"
                  domain={["dataMin - 2", "dataMax + 2"]}
                  tick={{ fill: "#888", fontSize: 10, fontFamily: "monospace" }}
                  tickLine={false}
                  axisLine={{ stroke: "#333" }}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />

                <Line
                  type="monotone"
                  dataKey="chest"
                  name={isHindi ? "सीना (Chest)" : "Chest (cm)"}
                  stroke="#F59E0B"
                  strokeWidth={2}
                  unit="cm"
                  dot={{ r: 3, fill: "#F59E0B" }}
                />
                <Line
                  type="monotone"
                  dataKey="biceps"
                  name={isHindi ? "बाइसेप्स (Biceps)" : "Biceps (cm)"}
                  stroke="#E2FF31"
                  strokeWidth={2.5}
                  unit="cm"
                  dot={{ r: 3.5, fill: "#E2FF31" }}
                />
                <Line
                  type="monotone"
                  dataKey="thighs"
                  name={isHindi ? "जांघें (Thighs)" : "Thighs (cm)"}
                  stroke="#38BDF8"
                  strokeWidth={2}
                  unit="cm"
                  dot={{ r: 3, fill: "#38BDF8" }}
                />
                <Line
                  type="monotone"
                  dataKey="waist"
                  name={isHindi ? "कमर (Waist)" : "Waist (cm)"}
                  stroke="#94A3B8"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  unit="cm"
                  dot={{ r: 2.5, fill: "#94A3B8" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* VIEW 3: RECHARTS VOLUME LOAD */}
      {activeMetricView === "volume" && (
        <div className="bg-[#121212] border border-[#1A1A1A] rounded-3xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-serif italic text-[#F5F5F5]">
                {isHindi ? "ट्रेनिंग वॉल्यूम लोड (kg)" : "Volume Load Per Workout Session"}
              </h4>
              <p className="text-xs text-gray-400">
                {isHindi
                  ? "प्रोग्रेसिव ओवरलोड: प्रत्येक वर्कआउट में कुल उठाया गया वज़न"
                  : "Progressive overload: sets × reps × weight per session"}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">
                {isHindi ? "कुल वॉल्यूम" : "Total Volume"}
              </span>
              <strong className="text-sm font-serif text-[#E2FF31]">
                {(totalVolume / 1000).toFixed(1)}k kg
              </strong>
            </div>
          </div>

          <div className="h-64 w-full bg-[#181818] p-3 rounded-2xl border border-[#222]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid stroke="#222" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  stroke="#666"
                  tick={{ fill: "#888", fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: "#333" }}
                />
                <YAxis
                  stroke="#666"
                  tick={{ fill: "#888", fontSize: 10, fontFamily: "monospace" }}
                  tickLine={false}
                  axisLine={{ stroke: "#333" }}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar
                  dataKey="volume"
                  name={isHindi ? "वॉल्यूम (Volume)" : "Volume (kg)"}
                  fill="#E2FF31"
                  radius={[6, 6, 0, 0]}
                  unit="kg"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3.5 bg-[#181818] rounded-2xl border border-[#222] text-xs flex items-center justify-between">
            <span className="text-gray-400">
              {isHindi ? "सत्र का औसत वॉल्यूम:" : "Average Volume per Session:"}
            </span>
            <strong className="font-serif text-[#E2FF31] text-sm">
              {workoutSessions.length > 0
                ? Math.round(totalVolume / workoutSessions.length).toLocaleString()
                : 0}{" "}
              kg
            </strong>
          </div>
        </div>
      )}

      {/* COMPOUND 1RM ESTIMATES */}
      <div className="bg-[#121212] border border-[#1A1A1A] rounded-3xl p-5 shadow-lg space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#E2FF31]" />
            <h4 className="text-base font-serif italic text-[#F5F5F5]">
              {isHindi ? "कम्पाउंड लिफ्ट्स व्यक्तिगत रिकॉर्ड (PRs)" : "Compound 1RM Estimates"}
            </h4>
          </div>
          <span className="text-xs text-gray-400 font-mono">{personalRecords.length} lifts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {personalRecords.map((pr) => (
            <div
              key={pr.id}
              className="p-3.5 bg-[#181818] border border-[#222] rounded-2xl flex items-center justify-between"
            >
              <div>
                <h5 className="text-sm font-medium text-[#F5F5F5]">{pr.exerciseName}</h5>
                <p className="text-[11px] text-gray-400">
                  {pr.maxWeightKg}kg × {pr.maxReps} reps
                </p>
              </div>

              <div className="text-right">
                <span className="text-base font-serif font-bold text-[#E2FF31]">{pr.estimated1RMKg} kg</span>
                <p className="text-[9px] text-gray-500 uppercase tracking-wider">1RM</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LOG MEASUREMENT MODAL */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#1A1A1A] w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
              <div>
                <h3 className="text-base font-serif italic text-[#F5F5F5]">
                  {isHindi ? "शारीरिक माप व वज़न दर्ज करें" : "Log Body Measurement"}
                </h3>
                <p className="text-xs text-gray-400">
                  {isHindi
                    ? "चार्ट में नया बिंदु तुरंत जुड़ जाएगा"
                    : "Instantly update your progress chart with fresh metrics"}
                </p>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-gray-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-gray-300 font-semibold block mb-1">
                  {isHindi ? "शरीर का वज़न (kg)" : "Body Weight (kg)"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputWeight}
                  onChange={(e) => setInputWeight(Number(e.target.value))}
                  className="w-full bg-[#181818] border border-[#222] text-[#F5F5F5] font-serif text-base rounded-2xl p-3 focus:border-[#E2FF31] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">
                    {isHindi ? "बॉडी फैट % (वैकल्पिक)" : "Body Fat % (Optional)"}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputBodyFat}
                    onChange={(e) => setInputBodyFat(Number(e.target.value))}
                    className="w-full bg-[#181818] border border-[#222] text-[#F5F5F5] rounded-2xl p-2.5 focus:border-[#E2FF31] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">
                    {isHindi ? "कमर Waist (cm)" : "Waist (cm)"}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={inputWaist}
                    onChange={(e) => setInputWaist(Number(e.target.value))}
                    className="w-full bg-[#181818] border border-[#222] text-[#F5F5F5] rounded-2xl p-2.5 focus:border-[#E2FF31] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">
                    {isHindi ? "सीना Chest (cm)" : "Chest (cm)"}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={inputChest}
                    onChange={(e) => setInputChest(Number(e.target.value))}
                    className="w-full bg-[#181818] border border-[#222] text-[#F5F5F5] rounded-2xl p-2.5 focus:border-[#E2FF31] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">
                    {isHindi ? "बाइसेप्स Biceps (cm)" : "Biceps (cm)"}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={inputBiceps}
                    onChange={(e) => setInputBiceps(Number(e.target.value))}
                    className="w-full bg-[#181818] border border-[#222] text-[#F5F5F5] rounded-2xl p-2.5 focus:border-[#E2FF31] focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleConfirmSaveMeasurement}
                className="w-full py-3 bg-[#E2FF31] hover:brightness-110 text-[#080808] font-bold rounded-full text-xs uppercase tracking-wider transition-all shadow-md shadow-[#E2FF31]/20 mt-2 cursor-pointer"
              >
                {isHindi ? "माप सहेजें व चार्ट अपडेट करें" : "Save & Update Chart"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
