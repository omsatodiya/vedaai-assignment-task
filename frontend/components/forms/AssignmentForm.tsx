"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function AssignmentForm() {
  const router = useRouter();

  const { formDraft, updateFormDraft, setFormStep, formStep } =
    useAssignmentStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [validationError, setValidationError] = useState<string | null>(null);

  const [dragActive, setDragActive] = useState(false);

  // ================= FILE HANDLERS =================

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      updateFormDraft({
        file: e.dataTransfer.files[0],
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateFormDraft({
        file: e.target.files[0],
      });
    }
  };

  const removeFile = () => {
    updateFormDraft({
      file: null,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ================= ROWS =================

  const addRow = () => {
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
  };

  const removeRow = (index: number) => {
    const updated = [...formDraft.questionConfigs];

    updated.splice(index, 1);

    updateFormDraft({
      questionConfigs: updated,
    });
  };

  const updateRow = (
    index: number,
    field: keyof IQuestionConfig,
    value: any,
  ) => {
    const updated = [...formDraft.questionConfigs];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    updateFormDraft({
      questionConfigs: updated,
    });
  };

  const handleCounter = (
    index: number,
    field: "noOfQuestions" | "marksPerQuestion",
    operation: "inc" | "dec",
  ) => {
    const config = formDraft.questionConfigs[index]!;

    const currentValue = config[field];

    if (operation === "dec" && currentValue <= 1) return;

    const newValue = operation === "inc" ? currentValue + 1 : currentValue - 1;

    updateRow(index, field, newValue);
  };

  // ================= TOTALS =================

  const totalQuestions = formDraft.questionConfigs.reduce(
    (sum, config) => sum + config.noOfQuestions,
    0,
  );

  const totalMarks = formDraft.questionConfigs.reduce(
    (sum, config) => sum + config.noOfQuestions * config.marksPerQuestion,
    0,
  );

  // ================= SUBMIT =================

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formDraft.title.trim()) {
      setValidationError("Assignment Title is required.");

      return;
    }

    setValidationError(null);

    setFormStep(2);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      <form
        onSubmit={handleSubmit}
        className="
          max-w-3xl
          mx-auto

          rounded-[32px]

          bg-white/50

          border
          border-slate-200

          shadow-[0_10px_30px_rgba(15,23,42,0.08)]

          px-6
          py-6

          flex
          flex-col

          relative
          overflow-hidden
        "
      >
        <div className="relative z-10">
          {/* ================= HEADER ================= */}

          <div className="pb-4">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Assignment Details
            </h2>

            <p className="mt-1 text-sm text-slate-500 font-medium">
              Basic information about your assignment
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            <label className="text-[13px] font-semibold text-[#1f2937]">
              Assignment Title
            </label>
            <Input
              value={formDraft.title}
              onChange={(e) =>
                updateFormDraft({
                  title: e.target.value,
                })
              }
              placeholder="e.g. Biology Midterm Exam"
              className="rounded-xl border border-[#d1d5db] bg-white/80 px-4 py-5 text-[13px] font-medium shadow-sm shadow-slate-100 focus:border-[#f97316] focus:ring-2 focus:ring-[#f9731660]"
            />
            <p className="text-[12px] text-[#6b7280]">
              Enter the assignment or quiz name shown to students.
            </p>
          </div>

          {/* ================= FILE UPLOAD ================= */}

          <div className="mt-5">
            <motion.div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                rounded-[20px]
                border
                border-dashed
                transition-all
                cursor-pointer

                flex
                flex-col
                items-center
                justify-center
                text-center

                px-8
                py-10

                bg-white/80
                shadow-sm

                ${
                  dragActive
                    ? "border-[#f97316] bg-orange-50/60"
                    : "border-[#e5e7eb] bg-white/80"
                }
              `}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              {formDraft.file ? (
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                    <File className="w-6 h-6 text-[#f97316]" />
                  </div>

                  <h3 className="mt-4 text-[14px] font-medium text-[#111827]">
                    {formDraft.file.name}
                  </h3>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    className="
                      mt-4
                      h-[42px]
                      px-5
                      rounded-full

                      border
                      border-white/60

                      bg-white/65
                      hover:bg-white/90

                      text-[13px]
                      font-medium

                      transition-all
                      backdrop-blur-sm
                    "
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-white/70 border border-white/60 shadow-sm flex items-center justify-center">
                    <Upload className="w-6 h-6 text-[#6b7280]" />
                  </div>

                  <h3 className="mt-5 text-[16px] font-medium text-[#111827]">
                    Choose a file or drag & drop it here
                  </h3>

                  <p className="mt-1 text-[13px] text-[#98a2b3]">
                    JPEG, PNG, upto 10MB
                  </p>

                  <button
                    type="button"
                    className="
                      mt-5
                      h-10.5
                      px-5
                      rounded-full

                      border
                      border-white/60

                      bg-white/65
                      hover:bg-white/90

                      text-[13px]
                      font-medium

                      transition-all
                      backdrop-blur-sm
                    "
                  >
                    Browse Files
                  </button>
                </>
              )}
            </motion.div>

            <p className="mt-3 text-center text-[12px] text-[#98a2b3]">
              Upload images of your preferred document/image
            </p>
          </div>

          {/* ================= DUE DATE ================= */}

          <div className="mt-7">
            <label className="text-[13px] font-semibold text-[#1f2937]">
              Due Date
            </label>

            <Popover>
              <PopoverTrigger
                className="
                  mt-3

                  h-13
                  w-full

                  rounded-xl

                  border
                  border-[#e5e7eb]

                  bg-white/80

                  px-4
                  py-3

                  flex
                  items-center
                  justify-between

                  text-[13px]
                  font-medium

                  text-[#111827]
                  cursor-pointer
                "
              >
                {formDraft.dueDate
                  ? new Date(formDraft.dueDate).toLocaleDateString("en-GB")
                  : "DD-MM-YYYY"}

                <CalendarIcon className="w-4 h-4 text-[#98a2b3]" />
              </PopoverTrigger>

              <PopoverContent align="start" className="p-0 border-[#ececec]">
                <Calendar
                  mode="single"
                  selected={
                    formDraft.dueDate ? new Date(formDraft.dueDate) : undefined
                  }
                  onSelect={(date) => {
                    if (date) {
                      const isoDate = date.toISOString().split("T")[0];

                      updateFormDraft({
                        dueDate: isoDate,
                      });
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* ================= QUESTION TYPES ================= */}

          <div className="mt-8 rounded-2xl border border-[#e5e7eb] bg-white/80 p-6 shadow-sm">
            {/* TABLE HEADERS */}
            <div className="grid grid-cols-12 gap-6 pb-4 mb-4 border-b border-[#e5e7eb]">
              <div className="col-span-6">
                <span className="text-[12px] font-semibold text-[#6b7280]">
                  Question Type
                </span>
              </div>
              <div className="col-span-3 text-center">
                <span className="text-[12px] font-semibold text-[#6b7280]">
                  No. of Questions
                </span>
              </div>
              <div className="col-span-3 text-center">
                <span className="text-[12px] font-semibold text-[#6b7280]">
                  Marks
                </span>
              </div>
            </div>

            {/* TABLE ROWS */}
            <div className="flex flex-col gap-4">
              <AnimatePresence initial={false}>
                {formDraft.questionConfigs.map((config, index) => (
                  <motion.div
                    key={`${index}-${config.questionType}`}
                    layout
                    className="grid grid-cols-12 gap-6 items-center py-1"
                  >
                    {/* SELECT DROPDOWN */}
                    <div className="col-span-6 flex items-center gap-2">
                      <Select
                        value={config.questionType}
                        onValueChange={(value) =>
                          updateRow(index, "questionType", value)
                        }
                      >
                        <SelectTrigger className="h-10 rounded-lg border border-[#e5e7eb] bg-white/80 px-3 text-[13px] font-medium shadow-sm cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {QUESTION_TYPES.map((type) => (
                            <SelectItem
                              key={type}
                              value={type}
                              className="cursor-pointer"
                            >
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4 text-[#9ca3af]" />
                      </button>
                    </div>

                    {/* COUNTER CONTROLS */}
                    <div className="col-span-3 flex justify-center">
                      <div className="flex items-center gap-2 bg-white/50 rounded-lg px-2 py-1 border border-[#e5e7eb]">
                        <button
                          type="button"
                          onClick={() =>
                            handleCounter(index, "noOfQuestions", "dec")
                          }
                          className="w-5 h-5 flex items-center justify-center hover:bg-slate-200 rounded transition-all cursor-pointer"
                        >
                          <Minus className="w-3 h-3 text-[#9ca3af]" />
                        </button>
                        <span className="w-6 text-center text-[13px] font-semibold text-slate-900">
                          {config.noOfQuestions}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCounter(index, "noOfQuestions", "inc")
                          }
                          className="w-5 h-5 flex items-center justify-center hover:bg-slate-200 rounded transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3 text-[#9ca3af]" />
                        </button>
                      </div>
                    </div>

                    {/* MARKS COUNTER */}
                    <div className="col-span-3 flex justify-center">
                      <div className="flex items-center gap-2 bg-white/50 rounded-lg px-2 py-1 border border-[#e5e7eb]">
                        <button
                          type="button"
                          onClick={() =>
                            handleCounter(index, "marksPerQuestion", "dec")
                          }
                          className="w-5 h-5 flex items-center justify-center hover:bg-slate-200 rounded transition-all cursor-pointer"
                        >
                          <Minus className="w-3 h-3 text-[#9ca3af]" />
                        </button>
                        <span className="w-6 text-center text-[13px] font-semibold text-slate-900">
                          {config.marksPerQuestion}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCounter(index, "marksPerQuestion", "inc")
                          }
                          className="w-5 h-5 flex items-center justify-center hover:bg-slate-200 rounded transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3 text-[#9ca3af]" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* ADD BUTTON */}
            <button
              type="button"
              onClick={addRow}
              className="mt-6 h-10 px-4 rounded-full bg-[#18181b] hover:bg-black flex items-center justify-center gap-2 text-[13px] font-semibold text-white transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Question Type
            </button>

            {/* TOTALS */}
            <div className="mt-6 pt-4 border-t border-[#e5e7eb] flex flex-col items-end gap-2">
              <span className="text-[12px] font-semibold text-[#6b7280]">
                Total Questions:{" "}
                <strong className="text-slate-900">{totalQuestions}</strong>
              </span>
              <span className="text-[12px] font-semibold text-[#6b7280]">
                Total Marks:{" "}
                <strong className="text-slate-900">{totalMarks}</strong>
              </span>
            </div>
          </div>

          {/* ================= ADDITIONAL INFO ================= */}

          <div className="mt-8">
            <label className="text-[13px] font-semibold text-[#1f2937]">
              Additional Information
            </label>

            <div className="relative mt-3">
              <Textarea
                placeholder="e.g Generate a question paper for 3 hour exam duration..."
                value={formDraft.additionalInfo}
                onChange={(e) =>
                  updateFormDraft({
                    additionalInfo: e.target.value,
                  })
                }
                className="
                  min-h-[140px]

                  rounded-xl

                  border
                  border-[#e5e7eb]

                  bg-white/80

                  px-4
                  py-4
                  pr-12

                  text-[13px]
                  font-medium

                  resize-none

                  shadow-sm

                  focus:border-[#f97316]
                  focus:ring-2
                  focus:ring-[#f9731660]
                "
              />

              <button
                type="button"
                className="
                  absolute
                  right-4
                  bottom-4

                  w-9
                  h-9

                  rounded-full

                  bg-white/80

                  border
                  border-white/60

                  flex
                  items-center
                  justify-center
                "
              >
                <Mic className="w-4 h-4 text-[#6b7280]" />
              </button>
            </div>
          </div>

          {/* ================= ERROR ================= */}

          {validationError && (
            <div
              className="
                mt-6

                rounded-2xl

                border
                border-red-100

                bg-red-50

                px-5
                py-4

                flex
                items-center
                gap-3
              "
            >
              <AlertCircle className="w-5 h-5 text-red-500" />

              <span className="text-[13px] font-medium text-red-600">
                {validationError}
              </span>
            </div>
          )}

          {/* ================= FOOTER ================= */}

          <div
            className={`mt-9 flex items-center ${formStep !== 1 ? "justify-between" : "justify-end"}`}
          >
            {formStep !== 1 && (
              <button
                type="button"
                onClick={() => router.push("/")}
                className="
                  h-12
                  px-6

                  rounded-full

                  border
                  border-white/60

                  bg-white/65
                  hover:bg-white/90

                  text-[13px]
                  font-medium

                  transition-all
                  backdrop-blur-sm
                "
              >
                ← Previous
              </button>
            )}

            <button
              type="submit"
              className="
                h-12
                px-7

                rounded-full

                bg-[#18181b]
                hover:bg-black

                text-white

                text-[13px]
                font-medium

                shadow-lg
                shadow-black/5

                transition-all
              "
            >
              Next →
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
