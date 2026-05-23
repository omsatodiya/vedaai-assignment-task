"use client";

import React from "react";
import { useAssignmentStore } from "../../store/assignmentStore";
import AssignmentForm from "../../components/forms/AssignmentForm";
import ReviewForm from "../../components/forms/ReviewForm";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateAssignment() {
  const formStep = useAssignmentStore((state) => state.formStep);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-4">
      {/* Step Indicator Progress Bar */}
      <div className="w-full max-w-md mx-auto flex flex-col gap-2 select-none px-4">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
          <span className={formStep >= 1 ? "text-[#ea580c] transition-colors duration-200" : ""}>
            1. ASSIGNMENT DETAILS
          </span>
          <span className={formStep >= 2 ? "text-[#ea580c] transition-colors duration-200" : ""}>
            2. REVIEW & CONFIRM
          </span>
        </div>

        {/* Gray track, dark gray/orange fill */}
        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#f97316] to-[#ea580c]"
            initial={{ width: "50%" }}
            animate={{ width: formStep === 1 ? "50%" : "100%" }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
          />
        </div>
      </div>

      {/* Conditionally Render Step Components with animations */}
      <div className="flex-1 mt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={formStep}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {formStep === 1 ? <AssignmentForm /> : <ReviewForm />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
