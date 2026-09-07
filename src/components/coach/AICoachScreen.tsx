import React, { useState, useRef, useEffect } from "react";
import {
  AIMessage,
  UserSettings,
  WorkoutSession,
  MealLog,
  AppLanguage,
} from "../../types";
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Trash2,
  Bot,
  User,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  RefreshCw,
  Dumbbell,
  Utensils,
  TrendingUp,
  Award,
  ArrowRight,
} from "lucide-react";
import { translations, getTranslations } from "../../utils/i18n";
import { defaultAIProvider } from "../../services/aiProvider";

interface AICoachScreenProps {
  settings: UserSettings;
  workoutSessions: WorkoutSession[];
  mealLogs: MealLog[];
  messages: AIMessage[];
  onSendMessage: (msg: AIMessage) => void;
  onClearChat: () => void;
  language?: AppLanguage;
}

export const AICoachScreen: React.FC<AICoachScreenProps> = ({
  settings,
  workoutSessions,
  mealLogs,
  messages,
  onSendMessage,
  onClearChat,
  language = "en",
}) => {
  const dict = getTranslations(language || settings?.language);
  const currentLang = (language || settings?.language) === "hi" ? "hi" : "en";
  const isHindi = currentLang === "hi";
  const t = dict.coach;
  const common = dict.common;

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | "splits" | "nutrition" | "overload" | "recovery">("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Dynamic cycling loader thoughts during generation
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingPhase((prev) => (prev + 1) % 3);
    }, 1400);
    return () => clearInterval(interval);
  }, [isLoading]);

  const loadingMessages = isHindi
    ? [
        "आपकी वर्कआउट और न्यूट्रिशन हिस्ट्री का विश्लेषण हो रहा है...",
        "6-डे स्प्लिट और प्रोग्रेसिव ओवरलोड डेटा प्रोसेस किया जा रहा है...",
        "उच्च-प्रोटीन शाकाहारी आहार अनुशंसाएं तैयार की जा रही हैं...",
      ]
    : [
        "Analyzing your training history & biomechanics...",
        "Calculating progressive overload & optimal set volume...",
        "Formulating high-protein vegetarian nutrition guidance...",
      ];

  const quickCategories = [
    { id: "all", label: isHindi ? "सभी प्रश्न" : "All Prompts", icon: Sparkles },
    { id: "splits", label: isHindi ? "6-डे PPL स्प्लिट्स" : "6-Day Splits", icon: Dumbbell },
    { id: "nutrition", label: isHindi ? "शाकाहारी प्रोटीन" : "Veg Protein", icon: Utensils },
    { id: "overload", label: isHindi ? "प्रोग्रेसिव ओवरलोड" : "Overload", icon: TrendingUp },
  ];

  const categorizedPrompts: Record<string, string[]> = isHindi
    ? {
        splits: [
          "6-दिवसीय PPL × 2 स्प्लिट में रिकवरी और फटीग कैसे मैनेज करें?",
          "Push A बनाम Push B: 6-दिन के चक्र में एक्सरसाइज कैसे बदलें?",
          "आर्नोल्ड स्प्लिट 6-दिन वर्कआउट के क्या लाभ हैं?",
        ],
        nutrition: [
          "भारतीय शाकाहारी खाने में 140g प्रोटीन कैसे पूरा करें?",
          "दाल, पनीर और सोया चंक्स का सही अमीनो एसिड कॉम्बिनेशन",
          "शाम के वर्कआउट से पहले सबसे अच्छा नाश्ता क्या है?",
        ],
        overload: [
          "बेंच प्रेस और स्क्वैट्स में वजन बढ़ाने का सही नियम (RPE/RIR)",
          "जब 3 हफ्तों तक वजन न बढ़े तो प्लेटो कैसे तोड़ें?",
        ],
      }
    : {
        splits: [
          "How to manage recovery and fatigue on a 6-day PPL × 2 split?",
          "Push A vs Push B variation in a 6-day hypertrophy routine",
          "Arnold Split 6-day cycle vs PPL: which produces better arm & shoulder growth?",
        ],
        nutrition: [
          "How to hit 140g vegetarian protein using Indian home food?",
          "Optimizing amino acid profiles with paneer, dal, sattu and curd",
          "Best pre-workout snack for evening strength training",
        ],
        overload: [
          "Progressive overload rules for compound barbell lifts (RPE 8 guideline)",
          "How to break a strength plateau on Bench Press & Overhead Press",
        ],
      };

  const getFilteredPrompts = () => {
    if (activeCategory === "all") {
      return isHindi
        ? [
            "6-दिवसीय PPL × 2 स्प्लिट में रिकवरी कैसे मैनेज करें?",
            "भारतीय शाकाहारी खाने में 140g प्रोटीन कैसे पूरा करें?",
            "बेंच प्रेस में प्रोग्रेसिव ओवरलोड का सही नियम क्या है?",
            "शाम के वर्कआउट से पहले सबसे अच्छा नाश्ता क्या है?",
          ]
        : [
            "How to optimize recovery on a 6-day PPL × 2 split?",
            "How to hit 140g vegetarian protein with Indian home food?",
            "Effective progressive overload rules for compound barbell lifts",
            "Best pre-workout snack for evening training",
          ];
    }
    return categorizedPrompts[activeCategory] || [];
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Voice recognition
  const handleToggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = isHindi ? "hi-IN" : "en-IN";
      recognition.interimResults = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Offline Expert Knowledge Base for instantaneous high-quality responses
  const getOfflineExpertResponse = (q: string): string => {
    const lower = q.toLowerCase();
    if (lower.includes("ppl") || lower.includes("6-day") || lower.includes("6-दिवसीय") || lower.includes("स्प्लिट")) {
      return isHindi
        ? `**6-दिवसीय PPL × 2 (Push / Pull / Legs) स्प्लिट गाइड:**\n\n1. **रोटेशन संरचना:**\n   - सोम: **Push A** (Heavy Chest + Shoulders, Triceps)\n   - मंगल: **Pull A** (Heavy Lat Width + Upper Back, Biceps)\n   - बुध: **Legs A** (Quad Focus Squats + Calves)\n   - गुरु: **Push B** (Incline DB Press + Lateral Raises + Tricep Dips)\n   - शुक्र: **Pull B** (Rowing Thickness + Rear Delts + Hammer Curls)\n   - शनि: **Legs B** (Hamstring Hinges / RDLs + Bulgarian Split Squats)\n   - रवि: **विश्राम व रिकवरी (Active Rest)**\n\n2. **रिकवरी नियम:** प्रत्येक मसल ग्रुप को हफ्ते में 2 बार ट्रेन किया जाता है (हफ्ते में 12-16 कुल सेट्स प्रति मसल)। RPE 8-9 पर ट्रेन करें ताकि सेंट्रल नर्वस सिस्टम पर अतिरिक्त थकान न हो।`
        : `**6-Day PPL × 2 (Push / Pull / Legs) Hypertrophy Protocol:**\n\n1. **Rotation Structure:**\n   - **Mon (Push A):** Heavy Barbell Bench (4×8-10), OHP (3×10), Incline DB Flye, Tricep Pushdowns\n   - **Tue (Pull A):** Weighted Pull-ups/Lat Pulldown (4×8-10), Barbell Rows (3×10), Face Pulls, Incline Bicep Curls\n   - **Wed (Legs A):** Barbell Back Squat (4×8-10), Leg Press (3×12), Leg Curls, Standing Calf Raises\n   - **Thu (Push B):** Incline Dumbbell Press (4×8-12), Cable Lateral Raises (4×15), Dips, Skullcrushers\n   - **Fri (Pull B):** Chest-Supported T-Bar Row (4×10), Cable Pullovers, Rear Delt Flies, Hammer Curls\n   - **Sat (Legs B):** Romanian Deadlifts (4×8-10), Bulgarian Split Squats (3×10/leg), Leg Extensions, Seated Calf Raises\n   - **Sun (Rest):** Full physical recovery & light walking\n\n2. **Fatigue Management:** Keep 1-2 Reps in Reserve (RIR) on compound lifts to allow sustained weekly progression.`;
    }

    if (lower.includes("protein") || lower.includes("प्रोटीन") || lower.includes("शाकाहारी") || lower.includes("veg")) {
      return isHindi
        ? `**140 ग्राम शाकाहारी प्रोटीन योजना (भारतीय आहार):**\n\n- **नाश्ता:** 1 स्कूप व्हे/प्लांट प्रोटीन + 40g ओट्स और चिया सीड्स (~30g प्रोटीन)\n- **दोपहर का भोजन:** 100g लो-फैट पनीर भुर्जी + 1 कटोरी गाढ़ी दाल/चना + 2 मिस्सी/बाजरा रोटी (~36g प्रोटीन)\n- **शाम का स्नैक:** 50g भुना चना + 1 गिलास ताजा छाछ/दही (~18g प्रोटीन)\n- **रात का भोजन:** 50g सोया चंक्स करी (उबालकर निचोड़ा हुआ) + 1 कटोरी अंकुरित मूंग सलाद + 2 रोटी (~42g प्रोटीन)\n- **सोने से पहले:** 250ml हल्दी वाला टोंड दूध (~8g प्रोटीन)\n\n**कुल प्रोटीन:** ~134-142 ग्राम।`
        : `**140g Vegetarian Protein Blueprint (Indian Staples):**\n\n- **Breakfast (32g):** 1 scoop Whey/Plant Isolate + 45g rolled oats cooked in water, topped with pumpkin seeds & almonds.\n- **Lunch (36g):** 100g low-fat Paneer bhurji cooked in 1 tsp olive oil + 1 cup thick Panchmel Dal/Chole + 2 multigrain rotis + raw cucumber salad.\n- **Mid-Evening Snack (20g):** 50g roasted chana (bhuna chana) + 200g Greek/hung curd with a dash of roasted cumin.\n- **Dinner (44g):** 50g boiled & squeezed Soya Chunks sautéed with bell peppers and tomatoes + 1 bowl sprouted moong salad + 2 bajra or whole wheat rotis.\n- **Bedtime (8g):** 250ml warm toned milk with turmeric and cinnamon.\n\n**Total Daily Intake:** ~140g complete protein with balanced amino acids.`;
    }

    return isHindi
      ? `**प्रोग्रेसिव ओवरलोड एवं हाइपरट्रॉफी के प्रमुख नियम:**\n\n1. **वजन या रेप्स में निरंतर वृद्धि:** यदि आज आपने 80kg से 8 रेप्स किए हैं, तो अगले सत्र में 80kg से 9 रेप्स या 82.5kg से 8 रेप्स करने का लक्ष्य रखें।\n2. **RIR (Reps in Reserve):** सेट को पूरी तरह फेलियर पर ले जाने की बजाय हमेशा 1-2 रेप्स रिज़र्व में रखें ताकि फॉर्म न बिगड़े।\n3. **विश्राम समय:** भारी कम्पाउंड लिफ्ट्स में 2.5-3 मिनट का विश्राम लें ताकि एटीपी (ATP) पुनः रीस्टोर हो सके।`
      : `**Key Hypertrophy & Overload Principles:**\n\n1. **Double Progression Method:** Aim for the top of your target rep range (e.g., 4 sets of 10 reps). Once achieved across all sets, increase load by 2.5kg and repeat.\n2. **Quality Over Quantity:** Train at RPE 8 (2 Reps in Reserve) on compound movements to maximize mechanical tension without CNS burnout.\n3. **Rest Intervals:** Rest 2.5 to 3 minutes between heavy sets of Bench Press, Squats, and Overhead Press to ensure full phosphocreatine replenishment.`;
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      sender: "user",
      content: query,
      text: query,
      timestamp: Date.now(),
    };

    onSendMessage(userMessage);
    setInputText("");
    setIsLoading(true);

    try {
      const userFitnessContext = {
        name: settings.profile.name,
        weightKg: settings.profile.currentWeightKg,
        targetWeightKg: settings.profile.targetWeightKg,
        goal: settings.profile.weightGoal,
        dailyCalorieTarget: settings.profile.calorieTarget,
        proteinTargetGrams: settings.profile.proteinTargetGrams,
        regionalPreference: settings.profile.regionalPreference,
        isVegetarian: settings.profile.isVegetarian,
        language: currentLang,
        recentWorkouts: workoutSessions.slice(0, 4).map((w) => ({
          name: w.name,
          date: w.date,
          volumeKg: w.totalVolumeKg,
          sets: w.totalSets,
        })),
        recentMeals: mealLogs.slice(0, 3).map((m) => ({
          mealType: m.mealType,
          items: m.items.map((i) => i.name),
        })),
      };

      const data = await defaultAIProvider.chatWithCoach({
        message: query,
        conversationHistory: messages.slice(-8),
        chatHistory: messages.slice(-8),
        userContext: userFitnessContext,
        context: userFitnessContext,
        language: currentLang,
      });

      const replyText = data.reply || getOfflineExpertResponse(query);
      const botMessage: AIMessage = {
        id: `msg-ai-${Date.now()}`,
        role: "assistant",
        sender: "assistant",
        content: replyText,
        text: replyText,
        timestamp: Date.now(),
      };
      onSendMessage(botMessage);
    } catch {
      const fallbackMsg = getOfflineExpertResponse(query);
      onSendMessage({
        id: `msg-ai-${Date.now()}`,
        role: "assistant",
        sender: "assistant",
        content: fallbackMsg,
        text: fallbackMsg,
        timestamp: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] text-[#F5F5F5]">
      {/* Top Coach Header Banner */}
      <div className="p-3.5 bg-[#121212] border border-[#1A1A1A] rounded-3xl mb-3 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E2FF31] text-[#080808] flex items-center justify-center font-bold font-serif shadow-md shadow-[#E2FF31]/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-serif italic text-[#F5F5F5] font-semibold">GymGPT AI Coach</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-gray-400">
              {isHindi
                ? "6-डे PPL स्प्लिट्स, भारतीय पोषण व ओवरलोड विशेषज्ञ"
                : "Hypertrophy, 6-Day Splits & Indian Diet Specialist"}
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClearChat}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-full hover:bg-[#181818]"
            title={isHindi ? "चैट साफ़ करें" : "Clear Chat"}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-1 no-scrollbar">
        {quickCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-[#E2FF31] text-[#080808] font-bold shadow-sm"
                  : "bg-[#181818] text-gray-400 hover:text-white border border-[#222]"
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1">
        {messages.length === 0 ? (
          <div className="p-5 text-center bg-[#121212] border border-[#1A1A1A] rounded-3xl space-y-3 my-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#E2FF31]/15 text-[#E2FF31] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-serif italic text-[#F5F5F5]">
                {isHindi ? "GymGPT से कुछ भी पूछें" : "Ask GymGPT Anything"}
              </h4>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                {isHindi
                  ? "6-डे स्प्लिट्स, वर्कआउट वॉल्यूम, प्रोग्रेसिव ओवरलोड या भारतीय शाकाहारी प्रोटीन योजना पर विशेषज्ञ मार्गदर्शन पाएं।"
                  : "Get science-based hypertrophy programming, Indian vegetarian macro breakdowns, and progressive overload tracking."}
              </p>
            </div>

            {/* Quick Prompts List */}
            <div className="grid grid-cols-1 gap-2 pt-2 text-left">
              {getFilteredPrompts().map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="p-3 bg-[#181818] hover:bg-[#222] border border-[#222] hover:border-[#E2FF31]/50 rounded-2xl text-xs text-gray-300 hover:text-white flex items-center justify-between group transition-all cursor-pointer"
                >
                  <span className="line-clamp-1">{prompt}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#E2FF31] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === "user" || msg.sender === "user";
            const textContent = msg.content || msg.text || "";

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-[#E2FF31] text-[#080808] flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-3xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? "bg-[#E2FF31] text-[#080808] font-medium shadow-md shadow-[#E2FF31]/10 rounded-tr-sm"
                      : "bg-[#181818] border border-[#222] text-[#F5F5F5] rounded-tl-sm space-y-2 shadow-lg"
                  }`}
                >
                  {/* Message Text with simple formatting support */}
                  <div className="whitespace-pre-wrap font-sans">
                    {textContent}
                  </div>

                  {!isUser && (
                    <div className="flex items-center justify-between pt-1 border-t border-[#262626] text-[10px] text-gray-500">
                      <span>GymGPT AI</span>
                      <button
                        onClick={() => handleCopy(textContent, msg.id)}
                        className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">{isHindi ? "कॉपी हुआ" : "Copied"}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{isHindi ? "कॉपी" : "Copy"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-[#222] text-gray-400 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Dynamic Thinking Animation */}
        {isLoading && (
          <div className="flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-xl bg-[#E2FF31] text-[#080808] flex items-center justify-center shrink-0 mt-1 shadow-sm animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#181818] border border-[#222] rounded-3xl p-3.5 text-xs text-gray-300 space-y-1.5 rounded-tl-sm shadow-lg max-w-[85%]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E2FF31] animate-ping" />
                <span className="font-semibold text-[#E2FF31]">{isHindi ? "GymGPT विश्लेषण कर रहा है..." : "GymGPT is thinking..."}</span>
              </div>
              <p className="text-[11px] text-gray-400 italic">
                {loadingMessages[loadingPhase]}
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Follow-up chips if chat has history */}
      {messages.length > 0 && !isLoading && (
        <div className="flex gap-1.5 overflow-x-auto py-1 no-scrollbar">
          {getFilteredPrompts().slice(0, 2).map((chip, i) => (
            <button
              key={i}
              onClick={() => handleSend(chip)}
              className="px-3 py-1 bg-[#181818] hover:bg-[#222] border border-[#262626] rounded-full text-[11px] text-gray-300 whitespace-nowrap transition-colors cursor-pointer hover:border-[#E2FF31]/40"
            >
              + {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="pt-2 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={handleToggleVoice}
          className={`p-3 rounded-2xl transition-all cursor-pointer ${
            isListening
              ? "bg-red-500 text-white animate-pulse"
              : "bg-[#181818] text-gray-400 hover:text-white border border-[#222]"
          }`}
          title={isHindi ? "आवाज से बोलें" : "Voice input"}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isHindi
              ? "6-डे स्प्लिट, पोषण या एक्सरसाइज के बारे में पूछें..."
              : "Ask about 6-day splits, progressive overload, veg macros..."
          }
          className="flex-1 bg-[#181818] border border-[#222] text-[#F5F5F5] rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-[#E2FF31] transition-colors placeholder:text-gray-500"
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-3 bg-[#E2FF31] hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 text-[#080808] rounded-2xl transition-all shadow-md shadow-[#E2FF31]/20 cursor-pointer disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
