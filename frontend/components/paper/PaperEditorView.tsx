"use client";

import React, { useRef, useState } from "react";
import { Eye, PenLine, SlidersHorizontal } from "lucide-react";
import type { IAssignment } from "../../store/assignmentStore";
import PaperDocument from "./PaperDocument";
import EditorPanel from "./EditorPanel";
import DownloadButton from "./DownloadButton";
import type { PaperMeta, PaperSection, PaperQuestion } from "./PaperDocument";

// ── helpers ───────────────────────────────────────────────────────────────────

function initSections(assignment: IAssignment): PaperSection[] {
  if (!assignment.generatedPaper) return [];
  return assignment.generatedPaper.sections.map((s, si) => ({
    id: `section-${si}`,
    title: s.title,
    instruction: s.instruction,
    questions: s.questions.map(
      (q, qi): PaperQuestion => ({
        id: `q-${si}-${qi}`,
        question: q.question,
        options: q.options,
        answer: q.answer ?? undefined,
        difficulty: q.difficulty,
        marks: q.marks,
      }),
    ),
  }));
}

const defaultMeta: PaperMeta = {
  schoolName: "",
  subject: "",
  classStandard: "",
  duration: "",
  instructions: "All questions are compulsory unless stated otherwise.",
};

// ── mobile tab toggle ─────────────────────────────────────────────────────────

type MobileTab = "edit" | "preview";

function TabBar({
  active,
  onChange,
}: {
  active: MobileTab;
  onChange: (t: MobileTab) => void;
}) {
  return (
    <div className="flex lg:hidden bg-[#f3f4f6] rounded-xl p-1 gap-1">
      {(["edit", "preview"] as MobileTab[]).map((tab) => {
        const isActive = active === tab;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 rounded-lg transition-all ${
              isActive
                ? "bg-white text-[#111827] shadow-sm"
                : "text-[#9ca3af] hover:text-[#6b7280]"
            }`}
          >
            {tab === "edit" ? (
              <PenLine className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
            {tab === "edit" ? "Edit" : "Preview"}
          </button>
        );
      })}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

interface PaperEditorViewProps {
  assignment: IAssignment;
}

export default function PaperEditorView({ assignment }: PaperEditorViewProps) {
  const docRef = useRef<HTMLDivElement | null>(null);

  const [sections, setSections] = useState<PaperSection[]>(() =>
    initSections(assignment),
  );
  const [meta, setMeta] = useState<PaperMeta>(defaultMeta);
  const [mobileTab, setMobileTab] = useState<MobileTab>("edit");
  const [showAnswerKey, setShowAnswerKey] = useState(true);

  const handleMetaChange = (updates: Partial<PaperMeta>) =>
    setMeta((prev) => ({ ...prev, ...updates }));

  const isEmpty = sections.length === 0;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
          <SlidersHorizontal className="w-4 h-4 text-[#6b7280]" />
          <span className="hidden sm:inline">Assignment Output</span>
          <span className="sm:hidden">Output</span>
        </div>

        <DownloadButton
          docRef={docRef}
          fileName={assignment.title}
          empty={isEmpty}
        />
      </div>

      {/* ── Mobile tab bar (hidden on lg+) ── */}
      <TabBar active={mobileTab} onChange={setMobileTab} />

      {/* ── Split layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Left — Editor (hidden on mobile when preview tab active) */}
        <div
          className={`${
            mobileTab === "edit" ? "flex" : "hidden"
          } lg:flex flex-col bg-[#fafafa] border border-[#e5e7eb] rounded-2xl shadow-sm`}
        >
          <EditorPanel
            meta={meta}
            onMetaChange={handleMetaChange}
            sections={sections}
            onSectionsChange={setSections}
            showAnswerKey={showAnswerKey}
            onToggleAnswerKey={setShowAnswerKey}
          />
        </div>

        {/* Right — Preview (hidden on mobile when edit tab active) */}
        <div
          className={`${
            mobileTab === "preview" ? "block" : "hidden"
          } lg:block rounded-2xl border border-[#e5e7eb] shadow-sm`}
        >
          <PaperDocument
            title={assignment.title}
            totalMarks={assignment.totalMarks}
            meta={meta}
            sections={sections}
            docRef={docRef}
            showAnswerKey={showAnswerKey}
          />
        </div>
      </div>
    </div>
  );
}
