"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Clock, GraduationCap, Info, School, Tag } from "lucide-react";
import type { PaperMeta, PaperSection, PaperQuestion } from "./PaperDocument";
import DraggableSection from "./DraggableSection";
import DraggableQuestion from "./DraggableQuestion";

// ── helpers ───────────────────────────────────────────────────────────────────

function FieldLabel({
  icon,
  label,
  optional,
}: {
  icon: React.ReactNode;
  label: string;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="text-[#9ca3af]">{icon}</span>
      <span className="text-xs font-semibold text-[#374151]">{label}</span>
      {optional && (
        <span className="text-[10px] text-[#9ca3af] ml-0.5">(optional)</span>
      )}
    </div>
  );
}

const inputCls =
  "w-full bg-white border border-[#e5e7eb] rounded-xl px-3.5 py-2.5 text-sm text-[#111827] placeholder:text-[#c4c9d4] focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-all";

// ── main component ────────────────────────────────────────────────────────────

interface EditorPanelProps {
  meta: PaperMeta;
  onMetaChange: (updates: Partial<PaperMeta>) => void;
  sections: PaperSection[];
  onSectionsChange: (sections: PaperSection[]) => void;
  showAnswerKey: boolean;
  onToggleAnswerKey: (val: boolean) => void;
}

type SectionMetaUpdates = Pick<PaperSection, "title"> &
  Partial<Pick<PaperSection, "subtitle" | "instruction">>;

export default function EditorPanel({
  meta,
  onMetaChange,
  sections,
  onSectionsChange,
  showAnswerKey,
  onToggleAnswerKey,
}: EditorPanelProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // ── drag handlers ──

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Section drag
    const isSectionDrag = sections.some((s) => s.id === activeId);
    if (isSectionDrag) {
      const oldIdx = sections.findIndex((s) => s.id === activeId);
      const newIdx = sections.findIndex((s) => s.id === overId);
      if (oldIdx !== -1 && newIdx !== -1) {
        onSectionsChange(arrayMove(sections, oldIdx, newIdx));
      }
      return;
    }

    // Question drag — find which section owns it
    onSectionsChange(
      sections.map((section) => {
        const oldIdx = section.questions.findIndex((q) => q.id === activeId);
        if (oldIdx === -1) return section;
        const newIdx = section.questions.findIndex((q) => q.id === overId);
        if (newIdx === -1) return section;
        return {
          ...section,
          questions: arrayMove(section.questions, oldIdx, newIdx),
        };
      }),
    );
  };

  const handleDragCancel = () => setActiveId(null);

  // ── section metadata edit ──
  const handleSectionUpdate = (sectionId: string, updates: SectionMetaUpdates) => {
    onSectionsChange(
      sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s)),
    );
  };

  // ── overlay content ──

  const activeSection = activeId
    ? sections.find((s) => s.id === activeId)
    : null;

  const activeQuestion: (PaperQuestion & { globalNum: number }) | null = (() => {
    if (!activeId || activeSection) return null;
    let offset = 0;
    for (const section of sections) {
      const qi = section.questions.findIndex((q) => q.id === activeId);
      if (qi !== -1) {
        return { ...section.questions[qi]!, globalNum: offset + qi + 1 };
      }
      offset += section.questions.length;
    }
    return null;
  })();

  const sectionIds = sections.map((s) => s.id);
  const totalQuestions = sections.reduce(
    (s, sec) => s + sec.questions.length,
    0,
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-col gap-0">
        {/* ── Paper Details ── */}
        <div className="px-5 pt-5 pb-4 border-b border-[#f3f4f6]">
          <p className="text-[10px] font-bold tracking-widest text-[#9ca3af] uppercase mb-4">
            Paper Details
          </p>

          <div className="flex flex-col gap-3.5">
            {/* School Name */}
            <div>
              <FieldLabel
                icon={<School className="w-3.5 h-3.5" />}
                label="School Name"
                optional
              />
              <input
                type="text"
                value={meta.schoolName}
                onChange={(e) => onMetaChange({ schoolName: e.target.value })}
                placeholder="e.g. Delhi Public School"
                className={inputCls}
              />
            </div>

            {/* Subject + Class row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <FieldLabel
                  icon={<Tag className="w-3.5 h-3.5" />}
                  label="Subject"
                  optional
                />
                <input
                  type="text"
                  value={meta.subject}
                  onChange={(e) => onMetaChange({ subject: e.target.value })}
                  placeholder="e.g. Biology"
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel
                  icon={<GraduationCap className="w-3.5 h-3.5" />}
                  label="Class / Standard"
                  optional
                />
                <input
                  type="text"
                  value={meta.classStandard}
                  onChange={(e) =>
                    onMetaChange({ classStandard: e.target.value })
                  }
                  placeholder="e.g. Grade 10"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <FieldLabel
                icon={<Clock className="w-3.5 h-3.5" />}
                label="Test Duration"
                optional
              />
              <input
                type="text"
                value={meta.duration}
                onChange={(e) => onMetaChange({ duration: e.target.value })}
                placeholder="e.g. 45 minutes"
                className={inputCls}
              />
            </div>

            {/* Instructions */}
            <div>
              <FieldLabel
                icon={<Info className="w-3.5 h-3.5" />}
                label="Instructions"
              />
              <textarea
                value={meta.instructions}
                onChange={(e) =>
                  onMetaChange({ instructions: e.target.value })
                }
                rows={2}
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* Answer Key toggle */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-[#374151]">
                  Include Answer Key
                </span>
                <span className="text-[10px] text-[#9ca3af]">
                  Printed on a separate page
                </span>
              </div>
              <button
                role="switch"
                aria-checked={showAnswerKey}
                onClick={() => onToggleAnswerKey(!showAnswerKey)}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  showAnswerKey ? "bg-[#111827]" : "bg-[#d1d5db]"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    showAnswerKey ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ── Questions (draggable) ── */}
        <div className="px-5 pt-4 pb-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold tracking-widest text-[#9ca3af] uppercase">
              Questions
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#9ca3af]">
                drag to reorder
              </span>
              <span className="text-[10px] font-semibold text-[#6b7280] bg-[#f3f4f6] border border-[#e5e7eb] px-2 py-0.5 rounded-full">
                {totalQuestions} total
              </span>
            </div>
          </div>

          {sections.length === 0 && (
            <p className="text-sm text-[#9ca3af] text-center py-6">
              No questions found.
            </p>
          )}

          {/* Sortable sections */}
          <SortableContext
            items={sectionIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-4">
              {sections.map((section, si) => {
                const offset = sections
                  .slice(0, si)
                  .reduce((a, s) => a + s.questions.length, 0);
                return (
                  <DraggableSection
                    key={section.id}
                    section={section}
                    questionOffset={offset}
                    onSectionUpdate={(updates) =>
                      handleSectionUpdate(section.id, updates)
                    }
                  />
                );
              })}
            </div>
          </SortableContext>
        </div>
      </div>

      {/* ── Drag overlay ── */}
      <DragOverlay dropAnimation={null}>
        {activeSection && (
          <DraggableSection
            section={activeSection}
            questionOffset={sections
              .slice(0, sections.findIndex((s) => s.id === activeSection.id))
              .reduce((a, s) => a + s.questions.length, 0)}
            isOverlay
          />
        )}
        {activeQuestion && (
          <DraggableQuestion
            question={activeQuestion}
            globalNum={activeQuestion.globalNum}
            isOverlay
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
