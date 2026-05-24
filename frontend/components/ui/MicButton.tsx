"use client";

import React from "react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface MicButtonProps {
  listening: boolean;
  supported: boolean;
  onToggle: () => void;
  className?: string;
  size?: "sm" | "md";
}

export default function MicButton({
  listening,
  supported,
  onToggle,
  className,
  size = "md",
}: MicButtonProps) {
  const dim = size === "sm" ? "w-7 h-7" : "w-8 h-8";
  const icon = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  if (!supported) {
    return (
      <button
        type="button"
        disabled
        title="Voice input is not supported in this browser. Try Chrome or Edge."
        className={cn(
          dim,
          "rounded-full flex items-center justify-center bg-[#f3f4f6] text-[#c4c9d4] cursor-not-allowed",
          className,
        )}
      >
        <MicOff className={icon} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      title={listening ? "Stop recording" : "Speak to fill this field"}
      className={cn(
        dim,
        "relative rounded-full flex items-center justify-center transition-all cursor-pointer",
        listening
          ? "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200"
          : "bg-[#ebebeb] text-[#6b7280] hover:bg-[#e0e0e0]",
        className,
      )}
    >
      {/* Ping ring while recording */}
      {listening && (
        <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-60 pointer-events-none" />
      )}
      <Mic className={cn(icon, "relative z-10")} />
    </button>
  );
}
