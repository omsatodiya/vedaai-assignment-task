"use client";

import React from "react";
import { useAssignmentStore } from "../../store/assignmentStore";
import AssignmentForm from "../../components/forms/AssignmentForm";
import ReviewForm from "../../components/forms/ReviewForm";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateAssignment() {
  const formStep = useAssignmentStore((state) => state.formStep);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-4 px-4 sm:px-0">
      <div className="w-full max-w-3xl mx-auto">
        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
          <motion.div
            className="h-full bg-slate-700"
            initial={{ width: formStep === 1 ? "50%" : "100%" }}
            animate={{ width: formStep === 1 ? "50%" : "100%" }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
          />
        </div>
      </div>

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
