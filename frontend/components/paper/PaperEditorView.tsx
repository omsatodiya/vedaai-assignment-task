"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Eye, PenLine, SlidersHorizontal } from "lucide-react";
import type { IAssignment } from "../../store/assignmentStore";
import EditorPanel from "./EditorPanel";
import DownloadButton from "./DownloadButton";
import type { PaperMeta, PaperSection, PaperQuestion } from "./PaperDocument";

// ── Client-only PDF preview (heavy bundle, skips SSR) ─────────────────────────
const PDFPreview = dynamic(() => import("./PDFPreview"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[780px] bg-[#f3f4f6] rounded-2xl border border-[#e5e7eb]">
      <p className="text-sm text-[#9ca3af]">Preparing preview…</p>
    </div>
  ),
});

// ── helpers ───────────────────────────────────────────────────────────────────

function initSections(assignment: IAssignment): PaperSection[] {
  if (!assignment.generatedPaper) return [];
  return assignment.generatedPaper.sections.map((s, si) => ({
    id: `section-${si}`,
    title: s.title,
    instruction: s.instruction,
    configIndex: si, // locked to original questionConfigs position — survives local reordering
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
  const [sections, setSections] = useState<PaperSection[]>(() =>
    initSections(assignment),
  );
  const [meta, setMeta] = useState<PaperMeta>(defaultMeta);
  const [mobileTab, setMobileTab] = useState<MobileTab>("edit");
  const [showAnswerKey, setShowAnswerKey] = useState(true);

  const handleMetaChange = (updates: Partial<PaperMeta>) =>
    setMeta((prev) => ({ ...prev, ...updates }));

  const isEmpty = sections.length === 0;

  // Called only when user clicks Download — avoids building the PDF tree on every render
  const getPDFProps = () => ({
    title: assignment.title,
    totalMarks: assignment.totalMarks,
    meta,
    sections,
    showAnswerKey,
  });

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
          getPDFProps={getPDFProps}
          fileName={assignment.title}
          empty={isEmpty}
        />
      </div>

      {/* ── Mobile tab bar (hidden on lg+) ── */}
      <TabBar active={mobileTab} onChange={setMobileTab} />

      {/* ── Split layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Left — Editor */}
        <div
          className={`${
            mobileTab === "edit" ? "flex" : "hidden"
          } lg:flex flex-col bg-[#fafafa] border border-[#e5e7eb] rounded-2xl shadow-sm`}
        >
          <EditorPanel
            assignmentId={assignment._id as string}
            meta={meta}
            onMetaChange={handleMetaChange}
            sections={sections}
            onSectionsChange={setSections}
            showAnswerKey={showAnswerKey}
            onToggleAnswerKey={setShowAnswerKey}
          />
        </div>

        {/* Right — Live PDF preview (real pages, not flat HTML) */}
        <div
          className={`${
            mobileTab === "preview" ? "block" : "hidden"
          } lg:block rounded-2xl overflow-hidden border border-[#e5e7eb] shadow-sm lg:sticky lg:top-6`}
        >
          <PDFPreview
            title={assignment.title}
            totalMarks={assignment.totalMarks}
            meta={meta}
            sections={sections}
            showAnswerKey={showAnswerKey}
          />
        </div>
      </div>
    </div>
  );
}
