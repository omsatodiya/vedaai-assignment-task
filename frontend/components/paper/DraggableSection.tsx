"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BookOpen, GripVertical } from "lucide-react";
import type { PaperSection } from "./PaperDocument";
import DraggableQuestion from "./DraggableQuestion";

interface DraggableSectionProps {
  section: PaperSection;
  questionOffset: number; // global question number offset before this section
  isOverlay?: boolean;
}

export default function DraggableSection({
  section,
  questionOffset,
  isOverlay = false,
}: DraggableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const questionIds = section.questions.map((q) => q.id);

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={isOverlay ? undefined : style}
      className={`flex flex-col gap-1.5 transition-opacity ${
        isDragging ? "opacity-40" : ""
      } ${isOverlay ? "cursor-grabbing" : ""}`}
    >
      {/* Section header with drag handle */}
      <div
        className={`flex items-center gap-2 px-1 py-1 rounded-lg group ${
          isOverlay ? "" : "hover:bg-[#f3f4f6]"
        } transition-colors`}
      >
        {/* Drag handle */}
        <button
          {...(isOverlay ? {} : { ...listeners, ...attributes })}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing text-[#d1d5db] hover:text-[#9ca3af] transition-colors touch-none"
          tabIndex={-1}
          aria-label="Drag section to reorder"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        <div className="w-6 h-6 rounded-lg bg-[#111827] flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-3 h-3 text-white" />
        </div>

        <span className="text-xs font-bold text-[#111827] flex-1 truncate">
          {section.title}
        </span>

        <span className="text-[10px] text-[#9ca3af] flex-shrink-0">
          {section.questions.length} Qs
        </span>
      </div>

      {/* Questions */}
      <div className="flex flex-col gap-1.5 pl-3">
        {isOverlay ? (
          section.questions.length > 0 ? (
            section.questions.map((q, qi) => (
              <div
                key={q.id}
                className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl px-3 py-2 text-xs text-[#9ca3af] truncate"
              >
                {questionOffset + qi + 1}. {q.question}
              </div>
            ))
          ) : null
        ) : section.questions.length === 0 ? (
          // Empty section fallback
          <div className="border-2 border-dashed border-[#e5e7eb] rounded-xl px-3 py-4 text-center">
            <p className="text-xs text-[#c4c9d4]">No questions in this section</p>
          </div>
        ) : (
          <SortableContext
            items={questionIds}
            strategy={verticalListSortingStrategy}
          >
            {section.questions.map((q, qi) => (
              <DraggableQuestion
                key={q.id}
                question={q}
                globalNum={questionOffset + qi + 1}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}
