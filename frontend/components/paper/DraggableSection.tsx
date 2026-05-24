"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BookOpen, GripVertical, Pencil, Check, X } from "lucide-react";
import type { PaperSection } from "./PaperDocument";
import DraggableQuestion from "./DraggableQuestion";

type SectionMetaUpdates = Pick<PaperSection, "title"> &
  Partial<Pick<PaperSection, "subtitle" | "instruction">>;

interface DraggableSectionProps {
  section: PaperSection;
  questionOffset: number;
  isOverlay?: boolean;
  onSectionUpdate?: (updates: SectionMetaUpdates) => void;
}

const inputCls =
  "w-full bg-white border border-[#e5e7eb] rounded-lg px-3 py-2 text-xs text-[#111827] placeholder:text-[#c4c9d4] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-all";

export default function DraggableSection({
  section,
  questionOffset,
  isOverlay = false,
  onSectionUpdate,
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

  // ── inline edit state ──
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(section.title);
  const [draftSubtitle, setDraftSubtitle] = useState(section.subtitle ?? "");
  const [draftInstruction, setDraftInstruction] = useState(section.instruction ?? "");

  const openEdit = () => {
    setDraftTitle(section.title);
    setDraftSubtitle(section.subtitle ?? "");
    setDraftInstruction(section.instruction ?? "");
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!draftTitle.trim()) return; // title is required
    onSectionUpdate?.({
      title: draftTitle.trim(),
      subtitle: draftSubtitle.trim() || undefined,
      instruction: draftInstruction.trim() || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
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
      {/* ── Section header ── */}
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

        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-[#111827] truncate block">
            {section.title}
          </span>
          {section.subtitle && (
            <span className="text-[10px] text-[#6b7280] truncate block">
              {section.subtitle}
            </span>
          )}
        </div>

        <span className="text-[10px] text-[#9ca3af] flex-shrink-0">
          {section.questions.length} Qs
        </span>

        {/* Edit icon — hidden in overlay */}
        {!isOverlay && onSectionUpdate && (
          <button
            onClick={openEdit}
            className="flex-shrink-0 p-1 rounded-md text-[#9ca3af] hover:text-[#111827] hover:bg-[#e5e7eb] transition-colors opacity-0 group-hover:opacity-100"
            title="Edit section"
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* ── Inline edit form ── */}
      {isEditing && (
        <div className="ml-3 bg-white border border-[#e5e7eb] rounded-xl p-3 flex flex-col gap-2 shadow-sm">
          <div>
            <label className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wider mb-1 block">
              Section Title <span className="text-red-400">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              placeholder="e.g. Section A"
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wider mb-1 block">
              Sub-heading <span className="text-[#c4c9d4]">(optional)</span>
            </label>
            <input
              type="text"
              value={draftSubtitle}
              onChange={(e) => setDraftSubtitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              placeholder="e.g. Short Answer Questions"
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wider mb-1 block">
              Instruction <span className="text-[#c4c9d4]">(optional)</span>
            </label>
            <input
              type="text"
              value={draftInstruction}
              onChange={(e) => setDraftInstruction(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              placeholder="e.g. Attempt all questions. Each question carries 2 marks"
              className={inputCls}
            />
          </div>

          {/* Save / Cancel */}
          <div className="flex gap-2 pt-0.5">
            <button
              onClick={handleSave}
              disabled={!draftTitle.trim()}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-white bg-[#111827] hover:bg-[#1f2937] px-3 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Check className="w-3 h-3" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6b7280] hover:text-[#111827] bg-[#f3f4f6] hover:bg-[#e5e7eb] px-3 py-1.5 rounded-lg transition-colors"
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Questions ── */}
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
