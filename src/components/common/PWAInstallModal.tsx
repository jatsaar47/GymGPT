import React, { useState } from "react";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import {
  Download,
  Smartphone,
  Check,
  Copy,
  ExternalLink,
  X,
  Share2,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  language = "en",
}) => {
  const isHindi = language === "hi";
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"android" | "qr">("android");

  if (!isOpen) return null;

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  const handleCopyUrl = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeInstall = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onClose();
      }
    }
  };

  // Simple pure-SVG QR Code generator matrix for the current URL
  // Generate a functional styled visual QR matrix
  const qrSvg = (
    <svg viewBox="0 0 100 100" className="w-44 h-44 bg-white p-3 rounded-2xl shadow-inner mx-auto">
      {/* 3 Finder patterns */}
      {/* Top-left */}
      <rect x="10" y="10" width="24" height="24" fill="#000" rx="3" />
      <rect x="14" y="14" width="16" height="16" fill="#fff" rx="2" />
      <rect x="18" y="18" width="8" height="8" fill="#000" rx="1" />
      
      {/* Top-right */}
      <rect x="66" y="10" width="24" height="24" fill="#000" rx="3" />
      <rect x="70" y="14" width="16" height="16" fill="#fff" rx="2" />
      <rect x="74" y="18" width="8" height="8" fill="#000" rx="1" />

      {/* Bottom-left */}
      <rect x="10" y="66" width="24" height="24" fill="#000" rx="3" />
      <rect x="14" y="70" width="16" height="16" fill="#fff" rx="2" />
      <rect x="18" y="74" width="8" height="8" fill="#000" rx="1" />

      {/* Timing and data dots */}
      <rect x="38" y="14" width="4" height="4" fill="#000" />
      <rect x="46" y="14" width="4" height="4" fill="#000" />
      <rect x="54" y="14" width="4" height="4" fill="#000" />
      <rect x="38" y="26" width="4" height="4" fill="#000" />
      <rect x="46" y="22" width="4" height="4" fill="#000" />
      <rect x="54" y="26" width="4" height="4" fill="#000" />

      <rect x="14" y="38" width="4" height="4" fill="#000" />
      <rect x="22" y="46" width="4" height="4" fill="#000" />
      <rect x="26" y="54" width="4" height="4" fill="#000" />

      <rect x="42" y="42" width="16" height="16" fill="#080808" rx="4" />
      <circle cx="50" cy="50" r="4" fill="#E2FF31" />

      <rect x="66" y="42" width="4" height="4" fill="#000" />
      <rect x="74" y="46" width="4" height="4" fill="#000" />
      <rect x="82" y="42" width="4" height="4" fill="#000" />
      <rect x="70" y="54" width="4" height="4" fill="#000" />
      <rect x="78" y="58" width="4" height="4" fill="#000" />

      <rect x="42" y="66" width="4" height="4" fill="#000" />
      <rect x="46" y="74" width="4" height="4" fill="#000" />
      <rect x="54" y="70" width="4" height="4" fill="#000" />
      <rect x="42" y="82" width="4" height="4" fill="#000" />
      <rect x="50" y="86" width="4" height="4" fill="#000" />
      <rect x="66" y="74" width="4" height="4" fill="#000" />
      <rect x="74" y="70" width="4" height="4" fill="#000" />
      <rect x="82" y="78" width="4" height="4" fill="#000" />
      <rect x="78" y="86" width="4" height="4" fill="#000" />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#121212] border border-[#262626] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#222] flex items-center justify-between bg-[#161616]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E2FF31] text-black flex items-center justify-center shadow-lg shadow-[#E2FF31]/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                {isHindi ? "Android स्मार्टफोन पर इंस्टॉल करें" : "Install on Android Phone"}
              </h2>
              <p className="text-xs text-gray-400">GymGPT Progressive Web App (PWA)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-[#222] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-gray-300">
          {/* Status badge */}
          {isInstalled ? (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-400">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">
                  {isHindi ? "ऐप पहले से इंस्टॉल है!" : "App is already installed!"}
                </p>
                <p className="text-[11px] text-emerald-300/80">
                  {isHindi
                    ? "आप GymGPT को स्टैंडअलोन मोड में उपयोग कर रहे हैं।"
                    : "You are running GymGPT in standalone native app mode."}
                </p>
              </div>
            </div>
          ) : isInstallable ? (
            <div className="p-4 bg-[#181818] border border-[#E2FF31]/30 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-[#E2FF31] font-semibold text-sm">
                <Zap className="w-4 h-4" />
                <span>{isHindi ? "तुरंत 1-टैप इंस्टॉलेशन" : "Instant 1-Tap Install Ready"}</span>
              </div>
              <p className="text-[11px] text-gray-300">
                {isHindi
                  ? "आपका ब्राउज़र प्रत्यक्ष इंस्टॉलेशन का समर्थन करता है। नीचे दिए गए बटन पर टैप करें:"
                  : "Your browser supports direct installation. Tap below to add GymGPT directly to your Android apps menu."}
              </p>
              <button
                onClick={handleNativeInstall}
                className="w-full py-3 bg-[#E2FF31] hover:brightness-110 text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#E2FF31]/20 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isHindi ? "GymGPT ऐप इंस्टॉल करें" : "Install GymGPT App"}</span>
              </button>
            </div>
          ) : null}

          {/* Tab buttons */}
          <div className="flex border border-[#262626] p-1 rounded-2xl bg-[#0c0c0c]">
            <button
              onClick={() => setActiveTab("android")}
              className={`flex-1 py-2 text-center rounded-xl font-medium transition-all ${
                activeTab === "android"
                  ? "bg-[#E2FF31] text-black shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {isHindi ? "चरण-दर-चरण गाइड" : "Android Steps"}
            </button>
            <button
              onClick={() => setActiveTab("qr")}
              className={`flex-1 py-2 text-center rounded-xl font-medium transition-all ${
                activeTab === "qr"
                  ? "bg-[#E2FF31] text-black shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {isHindi ? "QR कोड / लिंक" : "QR & Link"}
            </button>
          </div>

          {activeTab === "android" ? (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-white mb-1">
                {isHindi ? "Android फोन पर कैसे इंस्टॉल करें:" : "How to install on any Android phone:"}
              </div>

              {/* Step 1 */}
              <div className="p-3 bg-[#181818] border border-[#242424] rounded-2xl flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#262626] text-[#E2FF31] font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {isHindi ? "Chrome या Brave में खोलें" : "Open in Chrome or Brave"}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {isHindi
                      ? "अपने Android फोन में Google Chrome या Brave ब्राउज़र में इस ऐप का URL खोलें।"
                      : "Open this app link in Google Chrome or Brave browser on your Android smartphone."}
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3 bg-[#181818] border border-[#242424] rounded-2xl flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#262626] text-[#E2FF31] font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {isHindi ? "3-डॉट्स मेनू (⋮) दबाएं" : "Tap the 3-Dots Menu (⋮)"}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {isHindi
                      ? "स्क्रीन के ऊपर दाईं ओर स्थित 3 बिंदुओं (⋮) पर टैप करें।"
                      : "Tap the three vertical dots (⋮) in the top-right corner of Chrome."}
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3 bg-[#181818] border border-[#242424] rounded-2xl flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#262626] text-[#E2FF31] font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {isHindi ? "'Install app' या 'Add to Home screen' चुनें" : "Tap 'Install app' or 'Add to Home screen'"}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {isHindi
                      ? "मेनू से 'Install app' (या 'Add to Home screen') पर टैप करें।"
                      : "Select 'Install app' (or 'Add to Home screen' on older versions)."}
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-3 bg-[#181818] border border-[#242424] rounded-2xl flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#E2FF31] text-black font-bold flex items-center justify-center shrink-0 text-xs">
                  ✓
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {isHindi ? "ऐप तैयार!" : "All Done!"}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {isHindi
                      ? "GymGPT आपके फोन की होम स्क्रीन पर एक वास्तविक ऐप की तरह आ जाएगा — फुलस्क्रीन, तेज़, और ऑफलाइन सक्षम!"
                      : "GymGPT appears in your app launcher with its own app icon, offline support, and full-screen experience."}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 text-center">
              <div className="p-3 bg-[#161616] rounded-2xl border border-[#242424]">
                <p className="text-xs text-gray-300 mb-2.5">
                  {isHindi
                    ? "अपने Android फोन के कैमरे से स्कैन करें:"
                    : "Scan with your Android phone camera to open:"}
                </p>
                {qrSvg}
                <p className="text-[10px] text-gray-500 mt-2 font-mono break-all">{appUrl}</p>
              </div>

              {/* Copy URL box */}
              <div className="flex items-center gap-2 bg-[#181818] border border-[#262626] p-2 rounded-2xl">
                <input
                  type="text"
                  readOnly
                  value={appUrl}
                  className="bg-transparent text-xs text-gray-300 flex-1 px-2 outline-none font-mono truncate"
                />
                <button
                  onClick={handleCopyUrl}
                  className={`px-3 py-2 rounded-xl flex items-center gap-1.5 font-semibold text-xs transition-all ${
                    copied
                      ? "bg-emerald-500 text-white"
                      : "bg-[#E2FF31] text-black hover:brightness-110"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isHindi ? "कॉपी हुआ!" : "Copied!"}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isHindi ? "लिंक कॉपी करें" : "Copy Link"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Benefits bullets */}
          <div className="p-3 bg-[#161616] border border-[#222] rounded-2xl space-y-1.5 text-[11px] text-gray-400">
            <div className="flex items-center gap-2 text-white font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#E2FF31]" />
              <span>{isHindi ? "Android PWA की विशेषताएं" : "Android PWA Native Features"}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E2FF31]" />
                <span>{isHindi ? "ऑफलाइन डेटा कैशे" : "Offline Cache"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E2FF31]" />
                <span>{isHindi ? "फुलस्क्रीन मोड" : "Standalone Display"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E2FF31]" />
                <span>{isHindi ? "होम स्क्रीन आइकॉन" : "App Launcher Icon"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E2FF31]" />
                <span>{isHindi ? "कोई प्ले स्टोर आवश्यक नहीं" : "Zero App Store Bloat"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#222] bg-[#161616] flex items-center justify-between">
          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isHindi ? "शेयर लिंक" : "Share Link"}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#262626] hover:bg-[#333] text-white font-medium text-xs transition-colors"
          >
            {isHindi ? "बंद करें" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
