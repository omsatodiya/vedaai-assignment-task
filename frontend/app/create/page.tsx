"use client";

import React from "react";
import { useAssignmentStore } from "../../store/assignmentStore";
import AssignmentForm from "../../components/forms/AssignmentForm";
import ReviewForm from "../../components/forms/ReviewForm";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateAssignment() {
  const formStep = useAssignmentStore((state) => state.formStep);

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="w-full h-1 rounded-full bg-[#e5e7eb] overflow-hidden">
        <motion.div
          className="h-full bg-[#111827] rounded-full"
          animate={{ width: formStep === 1 ? "50%" : "100%" }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
        />
      </div>

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-[#111827] tracking-tight">
          Create Assignment
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Set up a new assignment for your students
        </p>
      </div>

      {/* Form */}
      <AnimatePresence mode="wait">
        <motion.div
          key={formStep}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {formStep === 1 ? <AssignmentForm /> : <ReviewForm />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
