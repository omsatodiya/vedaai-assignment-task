"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
import * as api from "../../../lib/api";
import type { IAssignment } from "../../../store/assignmentStore";
import PaperEditorView from "../../../components/paper/PaperEditorView";

// ── helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<IAssignment["status"], string> = {
  queued: "Queued",
  generating: "Generating questions…",
  formatting: "Formatting paper…",
  completed: "Completed",
  failed: "Failed",
};

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full h-1.5 rounded-full bg-[#e5e7eb] overflow-hidden">
      <motion.div
        className="h-full bg-[#111827] rounded-full"
        animate={{ width: `${progress}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      />
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [assignment, setAssignment] = useState<IAssignment | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Loading…");
  const [loadError, setLoadError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);

  // Initial fetch
  useEffect(() => {
    if (!id) return;

    api
      .getAssignment(id)
      .then((data) => {
        setAssignment(data);
        if (data.status === "completed") {
          setProgress(100);
          setStatusText("Completed");
        } else if (data.status === "failed") {
          setStatusText("Failed");
        } else {
          setStatusText(STATUS_LABELS[data.status]);
        }
      })
      .catch(() => setLoadError("Could not load assignment. Is the server running?"));
  }, [id]);

  // Socket.io — only connect while still in-progress
  useEffect(() => {
    if (!assignment || assignment.status === "completed" || assignment.status === "failed") return;
    if (!id) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000");
    socketRef.current = socket;

    socket.on(
      `progress:assignment_${id}`,
      (payload: { status: IAssignment["status"]; progress: number; statusText: string }) => {
        setProgress(payload.progress);
        setStatusText(payload.statusText);

        if (payload.status === "completed" || payload.status === "failed") {
          socket.disconnect();
          // Re-fetch to get the final paper
          api.getAssignment(id).then(setAssignment).catch(() => null);
        } else {
          setAssignment((prev) =>
            prev ? { ...prev, status: payload.status } : prev,
          );
        }
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [assignment?.status, id]);

  // ── Render states ──

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="max-w-3xl mx-auto flex items-center gap-2 text-sm text-[#6b7280]">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading assignment…
      </div>
    );
  }

  const inProgress =
    assignment.status === "queued" ||
    assignment.status === "generating" ||
    assignment.status === "formatting";

  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : null;

  const isCompleted =
    assignment.status === "completed" && assignment.generatedPaper;

  return (
    // Widen to full container when showing the split editor
    <div className={`flex flex-col gap-6 ${isCompleted ? "w-full" : "max-w-3xl mx-auto"}`}>
      {/* Back */}
      <button
        onClick={() => router.push("/")}
        className="cursor-pointer self-start flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#111827] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to assignments
      </button>

      {/* Header card */}
      <div className="bg-[#fafafa] border border-[#e5e7eb] rounded-2xl px-6 py-5 flex flex-col gap-3 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#111827] flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-[#111827] truncate">{assignment.title}</h1>
            <div className="mt-0.5 flex items-center gap-3 flex-wrap text-xs text-[#6b7280]">
              <span>
                {assignment.totalQuestions} questions · {assignment.totalMarks} marks
              </span>
              {formatDate(assignment.dueDate) && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Due {formatDate(assignment.dueDate)}
                </span>
              )}
            </div>
          </div>
          {/* Status badge */}
          <span
            className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              assignment.status === "completed"
                ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                : assignment.status === "failed"
                  ? "bg-red-50 border-red-100 text-red-600"
                  : "bg-amber-50 border-amber-100 text-amber-600"
            }`}
          >
            {assignment.status}
          </span>
        </div>

        {/* Progress */}
        <AnimatePresence>
          {inProgress && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-2"
            >
              <ProgressBar progress={progress} />
              <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                <Loader2 className="w-3 h-3 animate-spin" />
                {statusText}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error state */}
      {assignment.status === "failed" && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Generation failed</p>
            {assignment.errorDetails && (
              <p className="mt-0.5 text-red-500">{assignment.errorDetails}</p>
            )}
          </div>
        </div>
      )}

      {/* Split editor — completed state */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 22 }}
        >
          <PaperEditorView assignment={assignment} />
        </motion.div>
      )}

      {/* In-progress placeholder */}
      {inProgress && (
        <div className="flex flex-col items-center gap-3 py-16 text-[#9ca3af]">
          <Sparkles className="w-8 h-8" />
          <p className="text-sm">AI is crafting your assignment…</p>
        </div>
      )}
    </div>
  );
}
