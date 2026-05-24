"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  File,
  Calendar,
  BookOpen,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAssignmentStore } from "../../store/assignmentStore";
import * as api from "../../lib/api";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader } from "../ui/card";

export default function ReviewForm() {
  const router = useRouter();
  const { formDraft, setFormStep, addAssignment, resetFormDraft } =
    useAssignmentStore();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stagger variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  } as const;

  const totalQuestions = formDraft.questionConfigs.reduce(
    (sum, config) => sum + config.noOfQuestions,
    0,
  );
  const totalMarks = formDraft.questionConfigs.reduce(
    (sum, config) => sum + config.noOfQuestions * config.marksPerQuestion,
    0,
  );

  const handleBack = () => {
    setFormStep(1);
  };

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Call API helper to submit data as multi-part form-data
      const newAssignment = await api.createAssignment(
        formDraft.title,
        formDraft.questionConfigs,
        formDraft.dueDate,
        formDraft.additionalInfo,
        formDraft.file,
      );

      // Add to Zustand store list
      addAssignment(newAssignment);

      // Save ID to transition, reset draft
      const newId = newAssignment._id;
      resetFormDraft();

      // Redirect to assignment details/generation status page
      router.push(`/assignment/${newId}`);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to trigger assignment generation. Please check that the server is online.",
      );
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Format date helper
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border border-[#e5e7eb] rounded-[28px] p-6 shadow-sm shadow-slate-200/40 flex flex-col gap-5 animate-in fade-in duration-300">
      {/* Title & Subtext */}
      <div className="flex flex-col gap-1 border-b border-[#f3f4f6] pb-4">
        <h2 className="font-semibold text-xl text-slate-900 tracking-tight">
          Review & Confirm
        </h2>
        <p className="text-slate-500 text-sm font-normal">
          Review assessment parameters before starting AI generation
        </p>
      </div>

      {/* Review details grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-5"
      >
        {/* Core fields */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Card className="border-[#e5e7eb] shadow-xs hover:border-slate-300 transition-colors">
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-bold tracking-wider">
                ASSIGNMENT TITLE
              </span>
              <span className="text-xs font-bold text-slate-800">
                {formDraft.title}
              </span>
            </CardContent>
          </Card>

          <Card className="border-[#e5e7eb] shadow-xs hover:border-slate-300 transition-colors">
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-bold tracking-wider">
                DUE DATE
              </span>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                {formatDate(formDraft.dueDate)}
              </span>
            </CardContent>
          </Card>
        </motion.div>

        {/* Uploaded File summary */}
        {formDraft.file && (
          <motion.div variants={itemVariants}>
            <Card className="border-[#e5e7eb] shadow-xs hover:border-slate-300 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center border border-orange-200 text-[#f97316]">
                    <File className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold">
                      CONTEXT SOURCE
                    </span>
                    <span className="text-xs font-bold text-slate-850 truncate max-w-[300px]">
                      {formDraft.file.name}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {(formDraft.file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Question Configurations summary */}
        <motion.div variants={itemVariants}>
          <Card className="border-[#e5e7eb] shadow-xs hover:border-slate-300 transition-colors overflow-hidden">
            <CardHeader className="bg-slate-100 px-4 py-2">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider">
                QUESTION CONFIGURATIONS
              </span>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-[#e5e7eb]">
              {formDraft.questionConfigs.map((config, index) => (
                <div
                  key={index}
                  className="px-4 py-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-700">
                      {config.questionType}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 font-semibold text-slate-500">
                    <span>
                      Questions:{" "}
                      <strong className="text-slate-800">
                        {config.noOfQuestions}
                      </strong>
                    </span>
                    <span>
                      Marks:{" "}
                      <strong className="text-slate-800">
                        {config.marksPerQuestion}
                      </strong>
                    </span>
                  </div>
                </div>
              ))}
              {/* Summary Footer */}
              <div className="bg-slate-50 px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-600 border-t border-[#e5e7eb]">
                <Badge variant="outline">
                  Types: {formDraft.questionConfigs.length}
                </Badge>
                <div className="flex items-center gap-6">
                  <span>Total Questions: {totalQuestions}</span>
                  <span>Total Marks: {totalMarks}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional instructions summary */}
        {formDraft.additionalInfo.trim() && (
          <motion.div variants={itemVariants}>
            <Card className="border-[#e5e7eb] shadow-xs hover:border-slate-300 transition-colors">
              <CardContent className="p-4 flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold tracking-wider">
                  ADDITIONAL INSTRUCTIONS
                </span>
                <p className="text-xs font-medium text-slate-600 leading-relaxed italic bg-white p-3 rounded-lg border border-[#f3f4f6]">
                  "{formDraft.additionalInfo}"
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Error alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-xl p-3 flex items-center gap-2 text-xs font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between border-t border-[#f3f4f6] pt-6 select-none">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={submitting}
            className="border-[#e5e7eb] hover:bg-slate-50 py-3 px-5 rounded-full font-semibold text-xs cursor-pointer flex items-center gap-1.5 shadow-sm h-10"
          >
            ← Previous
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="bg-[#111827] text-white hover:bg-slate-800 py-3 px-5 rounded-full font-semibold text-xs cursor-pointer flex items-center gap-2 shadow-lg shadow-slate-900/10 h-10"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Starting AI Generation...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Generate Assessment →
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
