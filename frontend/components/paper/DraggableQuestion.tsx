"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { PaperQuestion } from "./PaperDocument";

function difficultyColor(d: PaperQuestion["difficulty"]) {
  return d === "easy"
    ? "text-emerald-600 bg-emerald-50 border-emerald-100"
    : d === "medium"
      ? "text-amber-600 bg-amber-50 border-amber-100"
      : "text-red-600 bg-red-50 border-red-100";
}

interface DraggableQuestionProps {
  question: PaperQuestion;
  globalNum: number;
  /** When true, renders a ghost/overlay copy (no drag binding needed) */
  isOverlay?: boolean;
}

export default function DraggableQuestion({
  question,
  globalNum,
  isOverlay = false,
}: DraggableQuestionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={isOverlay ? undefined : style}
      className={`bg-[#f9fafb] border border-[#e5e7eb] rounded-xl px-3 py-2.5 flex items-start gap-2 group transition-shadow ${
        isDragging
          ? "opacity-40 shadow-none"
          : "hover:border-[#d1d5db] hover:shadow-sm"
      } ${isOverlay ? "shadow-lg border-[#d1d5db] rotate-[0.8deg] cursor-grabbing" : ""}`}
    >
      {/* Drag handle */}
      <button
        {...(isOverlay ? {} : { ...listeners, ...attributes })}
        className="flex-shrink-0 mt-0.5 cursor-grab active:cursor-grabbing text-[#d1d5db] hover:text-[#9ca3af] transition-colors touch-none"
        tabIndex={-1}
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      {/* Number */}
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#e5e7eb] text-[10px] font-bold text-[#6b7280] flex items-center justify-center mt-0.5">
        {globalNum}
      </span>

      {/* Question text */}
      <p className="text-xs text-[#374151] leading-relaxed flex-1 line-clamp-2">
        {question.question}
      </p>

      {/* Badges */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span
          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${difficultyColor(question.difficulty)}`}
        >
          {question.difficulty}
        </span>
        <span className="text-[9px] text-[#9ca3af]">{question.marks}m</span>
      </div>
    </div>
  );
}
