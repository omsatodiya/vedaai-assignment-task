"use client";

import React from "react";

// ── shared types (reused by EditorPanel + DnD in later phases) ────────────────

export interface PaperMeta {
  schoolName: string;
  subject: string;
  classStandard: string;
  duration: string;
  instructions: string;
}

export interface PaperQuestion {
  id: string;
  question: string;
  options?: string[];
  answer?: string;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
}

export interface PaperSection {
  id: string;
  title: string;
  instruction?: string;
  questions: PaperQuestion[];
}

export interface PaperDocumentProps {
  title: string;
  totalMarks: number;
  meta: PaperMeta;
  sections: PaperSection[];
  docRef: React.RefObject<HTMLDivElement | null>;
  showAnswerKey: boolean;
}

// ── helpers ───────────────────────────────────────────────────────────────────

function HR() {
  return <div className="w-full border-t border-[#d1d5db] my-3" />;
}

function BlankLine({ label }: { label: string }) {
  return (
    <span className="inline-flex items-end gap-1 mr-6">
      <span className="text-xs text-[#374151]">{label}:</span>
      <span className="inline-block w-28 border-b border-[#374151]" />
    </span>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function PaperDocument({
  title,
  totalMarks,
  meta,
  sections,
  docRef,
  showAnswerKey,
}: PaperDocumentProps) {
  const hasAnswers = sections.some((s) =>
    s.questions.some((q) => q.answer),
  );

  // flatten questions for answer key, preserving global numbering
  let globalIndex = 0;
  const answerKeyItems: { num: number; answer: string }[] = [];
  sections.forEach((s) => {
    s.questions.forEach((q) => {
      globalIndex++;
      if (q.answer) answerKeyItems.push({ num: globalIndex, answer: q.answer });
    });
  });

  return (
    <div className="bg-[#f3f4f6] p-4">
      {/* A4-ish paper sheet */}
      <div
        ref={docRef}
        className="bg-white mx-auto shadow-md rounded-lg px-4 sm:px-8 py-4 sm:py-6 text-[#111827]"
        style={{ maxWidth: 760, fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        {/* ── Header ── */}
        <div className="text-center flex flex-col gap-0.5">
          {meta.schoolName && (
            <p className="text-[11px] font-bold tracking-wide uppercase">
              {meta.schoolName}
            </p>
          )}
          <p className="text-[10px] font-bold">{title}</p>
          {meta.subject && (
            <p className="text-[10px]">
              <span className="font-semibold">Subject:</span> {meta.subject}
            </p>
          )}
          {meta.classStandard && (
            <p className="text-[10px]">
              <span className="font-semibold">Class:</span> {meta.classStandard}
            </p>
          )}
        </div>

        <HR />

        {/* ── Meta row ── */}
        {(meta.duration || totalMarks) && (
          <div className="flex items-center justify-between text-[10px]">
            {meta.duration ? (
              <span>
                <span className="font-semibold">Time Allowed:</span>{" "}
                {meta.duration}
              </span>
            ) : (
              <span />
            )}
            <span>
              <span className="font-semibold">Maximum Marks:</span> {totalMarks}
            </span>
          </div>
        )}

        {/* ── Instructions ── */}
        {meta.instructions && (
          <p className="mt-2 text-[10px] text-[#374151]">{meta.instructions}</p>
        )}

        {/* ── Student fields ── */}
        <div className="mt-4 flex flex-wrap gap-y-2">
          <BlankLine label="Name" />
          <BlankLine label="Roll Number" />
          <BlankLine label="Class" />
        </div>

        <HR />

        {/* ── Sections ── */}
        {sections.map((section, si) => {
          // track per-section question numbering offset
          const offset = sections
            .slice(0, si)
            .reduce((acc, s) => acc + s.questions.length, 0);

          return (
            <div key={section.id} className="mt-6">
              {/* Section heading */}
              <h2 className="text-center text-[10px] font-bold uppercase tracking-widest mb-1">
                {section.title}
              </h2>
              {section.instruction && (
                <p className="text-center text-[10px] italic text-[#6b7280] mb-2">
                  {section.instruction}
                </p>
              )}

              {/* Questions */}
              <ol className="flex flex-col gap-3" style={{ listStyleType: "none" }}>
                {section.questions.map((q, qi) => {
                  const num = offset + qi + 1;
                  return (
                    <li key={q.id} className="flex flex-col gap-1.5">
                      {/* Question text */}
                      <div className="flex gap-2 text-[10px]">
                        <span className="font-semibold shrink-0">{num}.</span>
                        <span className="flex-1 leading-relaxed">
                          {q.question}
                          <span className="ml-2 text-[9px] text-[#6b7280] not-italic">
                            [{q.marks} {q.marks === 1 ? "Mark" : "Marks"}]
                          </span>
                        </span>
                      </div>

                      {/* MCQ options */}
                      {q.options && q.options.length > 0 && (
                        <div className="ml-5 grid grid-cols-2 gap-x-6 gap-y-0.5">
                          {q.options.map((opt, oi) => (
                            <span key={oi} className="text-[10px]">
                              ({String.fromCharCode(97 + oi)}){" "}
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}

        {/* ── End of paper ── */}
        <p className="mt-6 text-[10px] font-bold text-center">
          — End of Question Paper —
        </p>

        {/* ── Answer Key (separate page) ── */}
        {showAnswerKey && hasAnswers && answerKeyItems.length > 0 && (
          <div>
            {/* Visual page-break separator — hidden from PDF via data-pdf-hide */}
            <div data-pdf-hide="true" className="my-8 flex items-center gap-3 select-none">
              <div className="flex-1 border-t-2 border-dashed border-[#e5e7eb]" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#c4c9d4] px-2">
                Page Break — Answer Key
              </span>
              <div className="flex-1 border-t-2 border-dashed border-[#e5e7eb]" />
            </div>

            <h2 className="text-[10px] font-bold mb-2">Answer Key:</h2>
            <ol className="flex flex-col gap-1" style={{ listStyleType: "none" }}>
              {answerKeyItems.map(({ num, answer }) => (
                <li key={num} className="flex gap-2 text-[10px]">
                  <span className="font-semibold shrink-0">{num}.</span>
                  <span className="text-[#374151]">{answer}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
