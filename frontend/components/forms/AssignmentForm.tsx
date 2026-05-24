"use client";

import React, { useRef, useState } from "react";
import {
  Upload,
  Calendar as CalendarIcon,
  Mic,
  X,
  Plus,
  Minus,
  File,
  AlertCircle,
} from "lucide-react";
import {
  useAssignmentStore,
  IQuestionConfig,
} from "../../store/assignmentStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const QUESTION_TYPES = [
  "Multiple Choice Questions",
  "Short Questions",
  "Long Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
];

function Counter({
  value,
  onInc,
  onDec,
  className,
}: {
  value: number;
  onInc: () => void;
  onDec: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border border-[#e5e7eb] rounded-lg px-2.5 py-1.5 bg-[#f3f4f6]",
        className,
      )}
    >
      <button
        type="button"
        onClick={onDec}
        className="w-5 h-5 flex items-center justify-center text-[#6b7280] hover:text-[#111827] transition-colors cursor-pointer"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="flex-1 text-center text-sm font-semibold text-[#111827]">
        {value}
      </span>
      <button
        type="button"
        onClick={onInc}
        className="w-5 h-5 flex items-center justify-center text-[#6b7280] hover:text-[#111827] transition-colors cursor-pointer"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

export default function AssignmentForm() {
  const { formDraft, updateFormDraft, setFormStep } = useAssignmentStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [titleError, setTitleError] = useState(false);

  // ── File handlers ──────────────────────────────────────────
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) updateFormDraft({ file: f });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) updateFormDraft({ file: f });
  };

  const removeFile = () => {
    updateFormDraft({ file: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Question config helpers ────────────────────────────────
  const addRow = () =>
    updateFormDraft({
      questionConfigs: [
        ...formDraft.questionConfigs,
        {
          questionType: "Multiple Choice Questions",
          noOfQuestions: 5,
          marksPerQuestion: 1,
        },
      ],
    });

  const removeRow = (i: number) => {
    const next = [...formDraft.questionConfigs];
    next.splice(i, 1);
    updateFormDraft({ questionConfigs: next });
  };

  const updateRow = (
    i: number,
    field: keyof IQuestionConfig,
    val: string | number | null,
  ) => {
    if (val === null) return;
    const next = [...formDraft.questionConfigs];
    next[i] = { ...next[i]!, [field]: val };
    updateFormDraft({ questionConfigs: next });
  };

  const counter = (
    i: number,
    field: "noOfQuestions" | "marksPerQuestion",
    op: "inc" | "dec",
  ) => {
    const cur = formDraft.questionConfigs[i]![field];
    if (op === "dec" && cur <= 1) return;
    updateRow(i, field, op === "inc" ? cur + 1 : cur - 1);
  };

  // ── Totals ─────────────────────────────────────────────────
  const totalQuestions = formDraft.questionConfigs.reduce(
    (s, c) => s + c.noOfQuestions,
    0,
  );
  const totalMarks = formDraft.questionConfigs.reduce(
    (s, c) => s + c.noOfQuestions * c.marksPerQuestion,
    0,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDraft.title.trim()) {
      setTitleError(true);
      return;
    }
    setTitleError(false);
    setFormStep(2);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#fafafa] rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden"
    >
      <div className="px-6 py-6 md:px-8 md:py-7 flex flex-col gap-7">
        {/* ── Section header ── */}
        <div className="pb-5 border-b border-[#f3f4f6]">
          <h2 className="text-base font-semibold text-[#111827]">
            Assignment Details
          </h2>
          <p className="mt-0.5 text-sm text-[#6b7280]">
            Basic information about your assignment
          </p>
        </div>

        {/* ── Assignment title ── */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#111827]">
            Assignment Title <span className="text-red-500">*</span>
          </label>
          <Input
            value={formDraft.title}
            onChange={(e) => {
              updateFormDraft({ title: e.target.value });
              if (titleError && e.target.value.trim()) setTitleError(false);
            }}
            placeholder="e.g. Biology Midterm Exam"
            className={`h-10 rounded-lg px-4 text-sm bg-[#f9fafb] border-[#d1d5db] focus-visible:border-[#111827] focus-visible:ring-1 focus-visible:ring-[#11182730] ${
              titleError
                ? "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-200"
                : ""
            }`}
          />
          {titleError && (
            <div className="flex items-center gap-1.5 text-xs text-red-500">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              Assignment title is required.
            </div>
          )}
        </div>

        {/* ── File upload ── */}
        <div>
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center text-center px-6 py-10 transition-colors select-none ${
              dragActive
                ? "border-[#f97316] bg-orange-50/40"
                : "border-[#d1d5db] bg-[#f9fafb] hover:border-[#9ca3af] hover:bg-[#f3f4f6]"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/jpeg,image/png"
            />

            {formDraft.file ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                  <File className="w-5 h-5 text-[#f97316]" />
                </div>
                <p className="text-sm font-medium text-[#111827]">
                  {formDraft.file.name}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="cursor-pointer text-xs font-medium text-[#6b7280] border border-[#e5e7eb] bg-[#f3f4f6] px-4 py-1.5 rounded-full hover:border-red-200 hover:text-red-500 transition-colors"
                >
                  Remove File
                </button>
              </div>
            ) : (
              <>
                <Upload
                  className="w-8 h-8 text-[#9ca3af] mb-3"
                  strokeWidth={1.5}
                />
                <p className="text-sm font-medium text-[#111827]">
                  Choose a file or drag & drop it here
                </p>
                <p className="mt-1 text-xs text-[#9ca3af]">
                  JPEG, PNG, upto 10MB
                </p>
                <button
                  type="button"
                  className="cursor-pointer mt-4 text-xs font-medium text-[#374151] border border-[#d1d5db] bg-[#f3f4f6] hover:bg-[#e5e7eb] px-5 py-2 rounded-full transition-colors"
                >
                  Browse Files
                </button>
              </>
            )}
          </div>
          <p className="mt-2 text-center text-xs text-[#9ca3af]">
            Upload images of your preferred document/image
          </p>
        </div>

        {/* ── Due date ── */}
        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2">
            Due Date
          </label>
          <Popover>
            <PopoverTrigger className="cursor-pointer w-full flex items-center justify-between border border-[#d1d5db] rounded-lg px-4 py-2.5 bg-[#f9fafb] text-sm hover:border-[#9ca3af] transition-colors focus:outline-none">
              <span
                className={
                  formDraft.dueDate ? "text-[#111827]" : "text-[#9ca3af]"
                }
              >
                {formDraft.dueDate
                  ? new Date(formDraft.dueDate).toLocaleDateString("en-GB")
                  : "DD-MM-YYYY"}
              </span>
              <CalendarIcon className="w-4 h-4 text-[#6b7280]" />
            </PopoverTrigger>
            <PopoverContent align="start" className="p-0 border-[#e5e7eb]">
              <Calendar
                mode="single"
                selected={
                  formDraft.dueDate ? new Date(formDraft.dueDate) : undefined
                }
                onSelect={(date) => {
                  if (date)
                    updateFormDraft({
                      dueDate: date.toISOString().split("T")[0],
                    });
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* ── Question types ── */}
        <div>
          {/* Desktop column headers */}
          <div className="hidden md:grid grid-cols-12 gap-4 mb-3">
            <div className="col-span-6 text-xs font-semibold text-[#6b7280]">
              Question Type
            </div>
            <div className="col-span-3 text-center text-xs font-semibold text-[#6b7280]">
              No. of Questions
            </div>
            <div className="col-span-3 text-center text-xs font-semibold text-[#6b7280]">
              Marks
            </div>
          </div>

          {/* Rows */}
          <div className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {formDraft.questionConfigs.map((config, idx) => (
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* ── Desktop row ── */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-6 flex items-center gap-2">
                      <Select
                        value={config.questionType}
                        onValueChange={(v) =>
                          updateRow(idx, "questionType", v)
                        }
                      >
                        <SelectTrigger className="cursor-pointer h-10 rounded-lg border-[#d1d5db] bg-[#f9fafb] text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {QUESTION_TYPES.map((t) => (
                            <SelectItem
                              key={t}
                              value={t}
                              className="cursor-pointer"
                            >
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        className="cursor-pointer w-7 h-7 rounded-lg flex items-center justify-center text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#374151] transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="col-span-3 flex justify-center">
                      <Counter
                        value={config.noOfQuestions}
                        onInc={() => counter(idx, "noOfQuestions", "inc")}
                        onDec={() => counter(idx, "noOfQuestions", "dec")}
                      />
                    </div>
                    <div className="col-span-3 flex justify-center">
                      <Counter
                        value={config.marksPerQuestion}
                        onInc={() => counter(idx, "marksPerQuestion", "inc")}
                        onDec={() => counter(idx, "marksPerQuestion", "dec")}
                      />
                    </div>
                  </div>

                  {/* ── Mobile card ── */}
                  <div className="md:hidden bg-[#f3f4f6] border border-[#e5e7eb] rounded-2xl p-4 flex flex-col gap-3">
                    {/* Dropdown + remove */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex-1 min-w-0">
                        <Select
                          value={config.questionType}
                          onValueChange={(v) =>
                            updateRow(idx, "questionType", v)
                          }
                        >
                          <SelectTrigger className="cursor-pointer h-10 w-full rounded-xl border-[#d1d5db] bg-[#fafafa] text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {QUESTION_TYPES.map((t) => (
                              <SelectItem
                                key={t}
                                value={t}
                                className="cursor-pointer"
                              >
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        className="cursor-pointer w-10 h-10 rounded-xl flex items-center justify-center border border-[#e5e7eb] bg-[#fafafa] text-[#9ca3af] hover:bg-[#ebebeb] hover:text-[#374151] flex-shrink-0 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Counters */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium text-[#6b7280]">
                          No. of Questions
                        </span>
                        <Counter
                          value={config.noOfQuestions}
                          onInc={() => counter(idx, "noOfQuestions", "inc")}
                          onDec={() => counter(idx, "noOfQuestions", "dec")}
                          className="w-full justify-between px-3 py-2"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium text-[#6b7280]">
                          Marks
                        </span>
                        <Counter
                          value={config.marksPerQuestion}
                          onInc={() =>
                            counter(idx, "marksPerQuestion", "inc")
                          }
                          onDec={() =>
                            counter(idx, "marksPerQuestion", "dec")
                          }
                          className="w-full justify-between px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── Add Question Type button ── */}
          <button
            type="button"
            onClick={addRow}
            className="cursor-pointer mt-4 flex items-center gap-2.5 text-sm font-semibold text-[#111827] bg-[#f3f4f6] hover:bg-[#eaebec] active:scale-[0.98] border border-[#e5e7eb] px-4 py-2.5 rounded-2xl transition-all duration-150 shadow-sm"
          >
            <span className="w-5 h-5 rounded-full bg-[#111827] flex items-center justify-center flex-shrink-0">
              <Plus className="w-3 h-3 text-white" />
            </span>
            Add Question Type
          </button>

          {/* Totals */}
          <div className="mt-5 flex flex-col items-end gap-1 text-sm text-[#6b7280]">
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

        {/* ── Additional information ── */}
        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2">
            Additional Information{" "}
            <span className="font-normal text-[#6b7280]">
              (For better output)
            </span>
          </label>
          <div className="relative">
            <Textarea
              placeholder="e.g Generate a question paper for 3 hour exam duration..."
              value={formDraft.additionalInfo}
              onChange={(e) =>
                updateFormDraft({ additionalInfo: e.target.value })
              }
              className="min-h-[120px] rounded-xl border-[#d1d5db] bg-[#f9fafb] px-4 py-3 pr-12 text-sm resize-none focus-visible:ring-1 focus-visible:ring-[#f97316] focus-visible:border-[#f97316]"
            />
            <button
              type="button"
              className="cursor-pointer absolute right-3 bottom-3 w-8 h-8 rounded-full bg-[#ebebeb] flex items-center justify-center text-[#6b7280] hover:bg-[#e0e0e0] transition-colors"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <div className="px-6 md:px-8 py-5 border-t border-[#f3f4f6] flex items-center justify-end">
        <button
          type="submit"
          className="cursor-pointer flex items-center gap-1.5 text-sm font-semibold text-white bg-[#111827] hover:bg-[#1f2937] active:scale-[0.98] px-6 py-2.5 rounded-full transition-all shadow-sm"
        >
          Next →
        </button>
      </div>
    </form>
  );
}
