"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  File,
  CalendarDays,
  BookOpen,
  Sparkles,
  AlertCircle,
  Loader2,
  Upload,
  MessageSquareText,
} from "lucide-react";
import { useAssignmentStore } from "../../store/assignmentStore";
import * as api from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 120, damping: 16 },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-bold tracking-widest text-[#9ca3af] uppercase">
      {children}
    </span>
  );
}

export default function ReviewForm() {
  const router = useRouter();
  const { formDraft, setFormStep, addAssignment, resetFormDraft } =
    useAssignmentStore();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalQuestions = formDraft.questionConfigs.reduce(
    (s, c) => s + c.noOfQuestions,
    0,
  );
  const totalMarks = formDraft.questionConfigs.reduce(
    (s, c) => s + c.noOfQuestions * c.marksPerQuestion,
    0,
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const newAssignment = await api.createAssignment(
        formDraft.title,
        formDraft.questionConfigs,
        formDraft.dueDate,
        formDraft.additionalInfo,
        formDraft.file,
      );
      addAssignment(newAssignment);
      const newId = newAssignment._id;
      resetFormDraft();
      router.push(`/assignment/${newId}`);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(
        apiErr?.response?.data?.message ??
          "Failed to trigger assignment generation. Please check that the server is online.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fafafa] rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden">
      <div className="px-6 py-6 md:px-8 md:py-7 flex flex-col gap-6">
        {/* ── Header ── */}
        <div className="pb-5 border-b border-[#f3f4f6]">
          <h2 className="text-base font-semibold text-[#111827]">
            Review &amp; Confirm
          </h2>
          <p className="mt-0.5 text-sm text-[#6b7280]">
            Review your assignment details before generating
          </p>
        </div>

        {/* ── Animated sections ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4"
        >
          {/* Title + Due Date row */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {/* Assignment title */}
            <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-4 flex flex-col gap-1.5">
              <SectionLabel>Assignment Title</SectionLabel>
              <p className="text-sm font-semibold text-[#111827] leading-snug">
                {formDraft.title || (
                  <span className="text-[#9ca3af] font-normal italic">
                    Untitled
                  </span>
                )}
              </p>
            </div>

            {/* Due date */}
            <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-4 flex flex-col gap-1.5">
              <SectionLabel>Due Date</SectionLabel>
              {formatDate(formDraft.dueDate) ? (
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#6b7280] flex-shrink-0" />
                  <p className="text-sm font-semibold text-[#111827]">
                    {formatDate(formDraft.dueDate)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-[#9ca3af] italic font-normal">
                  Not set
                </p>
              )}
            </div>
          </motion.div>

          {/* Context file */}
          <motion.div variants={itemVariants}>
            <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-4">
              <SectionLabel>Context File</SectionLabel>
              {formDraft.file ? (
                <div className="mt-2 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                    <File className="w-5 h-5 text-[#f97316]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111827] truncate">
                      {formDraft.file.name}
                    </p>
                    <p className="text-xs text-[#9ca3af] mt-0.5">
                      {(formDraft.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f3f4f6] border border-[#e5e7eb] flex items-center justify-center flex-shrink-0">
                    <Upload className="w-4 h-4 text-[#c4c9d4]" />
                  </div>
                  <p className="text-sm text-[#9ca3af] italic font-normal">
                    No file uploaded
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Question configurations */}
          <motion.div variants={itemVariants}>
            <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl overflow-hidden">
              {/* Card header */}
              <div className="px-4 py-3 bg-[#f3f4f6] border-b border-[#e5e7eb] flex items-center justify-between">
                <SectionLabel>Question Configurations</SectionLabel>
                <span className="text-[10px] font-semibold text-[#6b7280] bg-[#e5e7eb] px-2 py-0.5 rounded-full">
                  {formDraft.questionConfigs.length}{" "}
                  {formDraft.questionConfigs.length === 1 ? "type" : "types"}
                </span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-[#f3f4f6]">
                {formDraft.questionConfigs.map((config, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#f3f4f6] border border-[#e5e7eb] flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-3.5 h-3.5 text-[#6b7280]" />
                      </div>
                      <span className="text-sm font-medium text-[#111827] truncate">
                        {config.questionType}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 text-xs text-[#6b7280]">
                      <span>
                        Qs:{" "}
                        <strong className="text-[#111827] font-semibold">
                          {config.noOfQuestions}
                        </strong>
                      </span>
                      <span>
                        Marks:{" "}
                        <strong className="text-[#111827] font-semibold">
                          {config.marksPerQuestion}
                        </strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals footer */}
              <div className="px-4 py-3 bg-[#f3f4f6] border-t border-[#e5e7eb] flex items-center justify-end gap-5 text-xs text-[#6b7280]">
                <span>
                  Total Questions:{" "}
                  <strong className="text-[#111827] font-semibold">
                    {totalQuestions}
                  </strong>
                </span>
                <span>
                  Total Marks:{" "}
                  <strong className="text-[#111827] font-semibold">
                    {totalMarks}
                  </strong>
                </span>
              </div>
            </div>
          </motion.div>

          {/* Additional information */}
          <motion.div variants={itemVariants}>
            <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <MessageSquareText className="w-3.5 h-3.5 text-[#9ca3af]" />
                <SectionLabel>Additional Information</SectionLabel>
              </div>
              {formDraft.additionalInfo.trim() ? (
                <p className="text-sm text-[#374151] leading-relaxed bg-[#f3f4f6] border border-[#e5e7eb] rounded-lg px-3.5 py-3 italic">
                  &ldquo;{formDraft.additionalInfo}&rdquo;
                </p>
              ) : (
                <p className="text-sm text-[#9ca3af] italic font-normal">
                  No additional information provided
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* ── Error ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation ── */}
      <div className="px-6 md:px-8 py-5 border-t border-[#f3f4f6] flex items-center justify-between">
        <button
          type="button"
          onClick={() => setFormStep(1)}
          disabled={submitting}
          className="cursor-pointer flex items-center gap-1.5 text-sm font-medium text-[#374151] border border-[#d1d5db] bg-[#f9fafb] hover:bg-[#f3f4f6] active:scale-[0.98] px-6 py-2.5 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={submitting}
          className="cursor-pointer flex items-center gap-2 text-sm font-semibold text-white bg-[#111827] hover:bg-[#1f2937] active:scale-[0.98] px-6 py-2.5 rounded-full transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Assessment
            </>
          )}
        </button>
      </div>
    </div>
  );
}
