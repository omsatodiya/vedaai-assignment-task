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
import { Button } from "../ui/button";
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
  const { formDraft, updateFormDraft, setFormStep } = useAssignmentStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local validation state
  const [validationError, setValidationError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // File Upload Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      // Type checks: Image, PDF, Text
      const allowedTypes = [
        "application/pdf",
        "text/plain",
        "image/jpeg",
        "image/png",
      ];
      if (allowedTypes.includes(file.type) || file.name.endsWith(".txt")) {
        updateFormDraft({ file });
        setValidationError(null);
      } else {
        setValidationError(
          "Invalid file type. Please upload a PDF, TXT, JPEG, or PNG.",
        );
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      updateFormDraft({ file });
      setValidationError(null);
    }
  };

  const removeFile = () => {
    updateFormDraft({ file: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Question Configuration Rows Handlers
  const addRow = () => {
    const currentTypes = formDraft.questionConfigs.map((c) => c.questionType);
    // Find first unused type
    const unusedType =
      QUESTION_TYPES.find((t) => !currentTypes.includes(t)) ||
      QUESTION_TYPES[0];

    updateFormDraft({
      questionConfigs: [
        ...formDraft.questionConfigs,
        { questionType: unusedType!, noOfQuestions: 5, marksPerQuestion: 5 },
      ],
    });
  };

  const removeRow = (index: number) => {
    if (formDraft.questionConfigs.length <= 1) {
      setValidationError("At least one question type is required.");
      return;
    }
    const updated = [...formDraft.questionConfigs];
    updated.splice(index, 1);
    updateFormDraft({ questionConfigs: updated });
    setValidationError(null);
  };

  const updateRow = (
    index: number,
    field: keyof IQuestionConfig,
    value: any,
  ) => {
    const updated = [...formDraft.questionConfigs];
    updated[index] = { ...updated[index]!, [field]: value };
    updateFormDraft({ questionConfigs: updated });
    setValidationError(null);
  };

  const handleCounter = (
    index: number,
    field: "noOfQuestions" | "marksPerQuestion",
    operation: "inc" | "dec",
  ) => {
    const config = formDraft.questionConfigs[index]!;
    const currentValue = config[field];

    if (operation === "dec" && currentValue <= 1) return; // Prevent less than 1

    const newValue = operation === "inc" ? currentValue + 1 : currentValue - 1;
    updateRow(index, field, newValue);
  };

  // Calculations
  const totalQuestions = formDraft.questionConfigs.reduce(
    (sum, config) => sum + config.noOfQuestions,
    0,
  );
  const totalMarks = formDraft.questionConfigs.reduce(
    (sum, config) => sum + config.noOfQuestions * config.marksPerQuestion,
    0,
  );

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formDraft.title.trim()) {
      setValidationError("Assignment Title is required.");
      return;
    }
    if (!formDraft.dueDate) {
      setValidationError("Due Date is required.");
      return;
    }
    const selectedDate = new Date(formDraft.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setValidationError("Due Date cannot be in the past.");
      return;
    }
    if (formDraft.questionConfigs.length === 0) {
      setValidationError("At least one question configuration is required.");
      return;
    }

    setValidationError(null);
    setFormStep(2); // Move to Step 2
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-[760px] mx-auto bg-white border border-[#e5e7eb] rounded-[32px] p-8 shadow-xl shadow-slate-100/50 flex flex-col gap-6 animate-in fade-in duration-300"
    >
      {/* Title & Description */}
      <div className="flex flex-col gap-1 border-b border-[#f3f4f6] pb-4">
        <h2 className="font-bold text-lg text-slate-800 tracking-tight">
          Assignment Details
        </h2>
        <p className="text-slate-400 text-xs font-normal">
          Basic information about your assignment
        </p>
      </div>

      {/* Custom Title Input */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-700">
          Assignment Title
        </label>
        <Input
          type="text"
          placeholder="e.g. Quiz on Electricity"
          value={formDraft.title}
          onChange={(e) => updateFormDraft({ title: e.target.value })}
          className="bg-[#f9fafb] border-[#e5e7eb] focus-visible:border-[#f97316] focus-visible:ring-[#f97316]/20 py-5 px-4 text-xs font-medium rounded-xl outline-none"
        />
      </div>

      {/* File Upload Area */}
      <div className="flex flex-col gap-2">
        <motion.div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          animate={{
            borderColor: dragActive ? "#ea580c" : "#e5e7eb",
            backgroundColor: dragActive
              ? "rgba(254, 243, 199, 0.2)"
              : "rgba(249, 250, 251, 1)",
          }}
          whileHover={{ borderColor: "#fed7aa" }}
          transition={{ duration: 0.15 }}
          className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.txt,image/jpeg,image/png"
            className="hidden"
          />

          {formDraft.file ? (
            <div
              className="flex flex-col items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center border border-orange-200 text-[#f97316] shadow-sm">
                <File className="w-6 h-6" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-slate-800 max-w-[250px] truncate">
                  {formDraft.file.name}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {(formDraft.file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={removeFile}
                className="mt-2 text-rose-600 hover:text-rose-700 text-[10px] font-bold border border-rose-200 hover:bg-rose-50 px-3 py-1 rounded-full cursor-pointer flex items-center gap-1 transition-all h-7"
              >
                <X className="w-3 h-3" />
                Remove File
              </Button>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 bg-white border border-[#e5e7eb] rounded-xl flex items-center justify-center text-[#6b7280] shadow-sm">
                <Upload className="w-5 h-5" />
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-xs font-bold text-slate-800">
                  Choose a file or drag & drop it here
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  PDF, TXT, JPEG, PNG up to 10MB
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-white border border-[#e5e7eb] hover:bg-slate-50 py-1 px-4 rounded-full font-semibold text-[10px] shadow-sm select-none cursor-pointer h-7"
              >
                Browse Files
              </Button>
            </>
          )}
        </motion.div>
        <p className="text-[10px] text-slate-400 font-normal text-center select-none">
          Upload files or images of your preferred document/image
        </p>
      </div>

      {/* Due Date Picker */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-700">Due Date</label>
        <Popover>
          <PopoverTrigger className="w-full text-left bg-[#f9fafb] border border-[#e5e7eb] hover:bg-[#f9fafb] py-5 px-4 text-xs font-semibold rounded-xl text-[#111827] cursor-pointer flex items-center justify-between">
            {formDraft.dueDate
              ? new Date(formDraft.dueDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "Pick a date"}
            <CalendarIcon className="w-4 h-4 text-[#9ca3af]" />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={
                formDraft.dueDate ? new Date(formDraft.dueDate) : undefined
              }
              onSelect={(date) => {
                if (date) {
                  const isoDate = date.toISOString().split("T")[0];
                  updateFormDraft({ dueDate: isoDate });
                }
              }}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Question Type List */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-12 gap-4 text-[10px] font-bold text-slate-400 select-none pb-1 border-b border-[#f3f4f6]">
          <span className="col-span-6 pl-2">QUESTION TYPE</span>
          <span className="col-span-3 text-center">NO. OF QUESTIONS</span>
          <span className="col-span-3 text-center">MARKS</span>
        </div>

        <div className="flex flex-col gap-3 overflow-hidden">
          <AnimatePresence initial={false}>
            {formDraft.questionConfigs.map((config, index) => (
              <motion.div
                key={`${index}-${config.questionType}`}
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="grid grid-cols-12 items-center gap-4 pb-1 overflow-hidden"
              >
                {/* Question Type Selection */}
                <div className="col-span-6 flex items-center gap-2">
                  <Select
                    value={config.questionType}
                    onValueChange={(value) =>
                      updateRow(index, "questionType", value)
                    }
                  >
                    <SelectTrigger className="w-full bg-[#f9fafb] border-[#e5e7eb] focus:border-[#f97316] focus:ring-[#f97316]/20 py-2 px-3 text-xs font-bold text-[#374151] rounded-xl h-auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-[#e5e7eb] rounded-xl">
                      {QUESTION_TYPES.map((type) => (
                        <SelectItem
                          key={type}
                          value={type}
                          className="text-xs cursor-pointer"
                        >
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Delete Row Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeRow(index)}
                    className="hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer shrink-0 border border-transparent hover:border-rose-100 rounded-lg size-7"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* No. of Questions Counter */}
                <div className="col-span-3 flex items-center justify-center gap-2 select-none">
                  <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl flex items-center p-1 justify-between w-[90px]">
                    <button
                      type="button"
                      onClick={() =>
                        handleCounter(index, "noOfQuestions", "dec")
                      }
                      className="w-6 h-6 rounded-lg hover:bg-slate-100 text-[#6b7280] flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <div className="relative overflow-hidden w-6 h-5 flex items-center justify-center">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={config.noOfQuestions}
                          initial={{ y: 6, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -6, opacity: 0 }}
                          transition={{ duration: 0.12 }}
                          className="absolute text-xs font-bold text-slate-800 text-center"
                        >
                          {config.noOfQuestions}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCounter(index, "noOfQuestions", "inc")
                      }
                      className="w-6 h-6 rounded-lg hover:bg-slate-100 text-[#6b7280] flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Marks Counter */}
                <div className="col-span-3 flex items-center justify-center gap-2 select-none">
                  <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl flex items-center p-1 justify-between w-[90px]">
                    <button
                      type="button"
                      onClick={() =>
                        handleCounter(index, "marksPerQuestion", "dec")
                      }
                      className="w-6 h-6 rounded-lg hover:bg-slate-100 text-[#6b7280] flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <div className="relative overflow-hidden w-6 h-5 flex items-center justify-center">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={config.marksPerQuestion}
                          initial={{ y: 6, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -6, opacity: 0 }}
                          transition={{ duration: 0.12 }}
                          className="absolute text-xs font-bold text-slate-800 text-center"
                        >
                          {config.marksPerQuestion}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCounter(index, "marksPerQuestion", "inc")
                      }
                      className="w-6 h-6 rounded-lg hover:bg-slate-100 text-[#6b7280] flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add row trigger */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-fit mt-1"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRow}
            className="border-[#e5e7eb] hover:border-slate-400 hover:bg-slate-50 py-1.5 px-3.5 rounded-xl font-semibold text-[10px] flex items-center gap-1.5 cursor-pointer h-8"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            Add Question Type
          </Button>
        </motion.div>

        {/* Totals panel */}
        <div className="flex flex-col items-end gap-0.5 border-t border-[#f3f4f6] pt-3 text-[11px] font-bold text-slate-500">
          <span>Total Questions : {totalQuestions}</span>
          <span>Total Marks : {totalMarks}</span>
        </div>
      </div>

      {/* Additional Instructions */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-700">
          Additional Information (For better output)
        </label>
        <div className="relative">
          <Textarea
            placeholder="e.g Generate a question paper for 3 hour exam duration..."
            value={formDraft.additionalInfo}
            onChange={(e) =>
              updateFormDraft({ additionalInfo: e.target.value })
            }
            rows={4}
            className="bg-[#f9fafb] border-[#e5e7eb] focus-visible:border-[#f97316] focus-visible:ring-[#f97316]/20 rounded-2xl py-3 px-4 pr-12 text-xs font-medium outline-none resize-none leading-relaxed min-h-24"
          />
          {/* Static mic button */}
          <button
            type="button"
            className="absolute right-4 bottom-4 w-8 h-8 rounded-full border border-[#e5e7eb] bg-white text-slate-400 flex items-center justify-center cursor-not-allowed select-none shadow-sm"
            title="Voice input coming soon"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action / Validation Alerts */}
      {validationError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-xl p-3 flex items-center gap-2 text-xs font-bold animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Step navigation triggers */}
      <div className="flex items-center justify-between border-t border-[#f3f4f6] pt-6 select-none">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
            className="border-[#e5e7eb] hover:bg-slate-50 py-4 px-6 rounded-full font-semibold text-xs cursor-pointer shadow-sm h-9"
          >
            ← Previous
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            className="bg-[#111827] text-white hover:bg-slate-800 py-4 px-6 rounded-full font-semibold text-xs cursor-pointer shadow-lg shadow-slate-900/10 h-9"
          >
            Next →
          </Button>
        </motion.div>
      </div>
    </form>
  );
}
