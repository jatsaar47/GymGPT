import React, { useState } from "react";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import { Download, Smartphone } from "lucide-react";
import { PWAInstallModal } from "./PWAInstallModal";

interface PWAInstallButtonProps {
  language?: string;
  variant?: "header" | "pill" | "banner";
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  language = "en",
  variant = "header",
  className = "",
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const isHindi = language === "hi";

  // If already running in standalone installed mode, don't show the header button
  if (isInstalled && variant !== "banner") {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {variant === "header" && (
        <button
          onClick={handleClick}
          title={isHindi ? "Android फोन पर इंस्टॉल करें" : "Install on Android Phone"}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#E2FF31]/15 hover:bg-[#E2FF31]/25 border border-[#E2FF31]/30 text-[#E2FF31] text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isHindi ? "ऐप इंस्टॉल" : "Install App"}</span>
        </button>
      )}

      {variant === "pill" && (
        <button
          onClick={handleClick}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-[#E2FF31] hover:brightness-110 text-black font-semibold text-xs shadow-md shadow-[#E2FF31]/20 transition-all cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isHindi ? "Android पर इंस्टॉल करें" : "Install on Android"}</span>
        </button>
      )}

      {showModal && (
        <PWAInstallModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          language={language}
        />
      )}
    </>
  );
};
