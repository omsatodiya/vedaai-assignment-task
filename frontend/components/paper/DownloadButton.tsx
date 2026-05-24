"use client";

import React, { useState } from "react";
import { Download, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import type { PaperPDFProps } from "./PaperPDF";

type DownloadState = "idle" | "generating" | "saving" | "error";

const STATE_LABEL: Record<DownloadState, string> = {
  idle: "Download as PDF",
  generating: "Building PDF…",
  saving: "Saving…",
  error: "Failed — retry?",
};

interface DownloadButtonProps {
  /** Factory called on click — avoids rendering the heavy PDF tree until needed */
  getPDFProps: () => PaperPDFProps;
  fileName: string;
  /** Disable while paper has no content */
  empty?: boolean;
}

export default function DownloadButton({
  getPDFProps,
  fileName,
  empty = false,
}: DownloadButtonProps) {
  const [state, setState] = useState<DownloadState>("idle");
  const [successFlash, setSuccessFlash] = useState(false);

  const isLoading = state === "generating" || state === "saving";

  const handleDownload = async () => {
    if (isLoading || empty) return;

    setState("generating");
    setSuccessFlash(false);

    try {
      // Lazy-load to keep the initial bundle lean
      const [{ pdf }, { PaperPDFDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./PaperPDF"),
      ]);

      const React = await import("react");
      const docElement = React.createElement(PaperPDFDocument, getPDFProps());
      const blob = await pdf(docElement).toBlob();

      setState("saving");

      // Sanitise filename
      const safe = fileName
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
        .slice(0, 60)
        .replace(/^-+|-+$/g, "");

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safe || "assignment"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      setSuccessFlash(true);
      setTimeout(() => setSuccessFlash(false), 2500);
    } catch (err) {
      console.error("[DownloadButton] PDF generation failed:", err);
      setState("error");
      setTimeout(() => setState("idle"), 3000);
      return;
    }

    setState("idle");
  };

  // ── Render ──

  if (successFlash) {
    return (
      <button
        disabled
        className="flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full transition-all"
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        Saved!
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading || empty}
      title={empty ? "No content to export" : undefined}
      className={`cursor-pointer flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-all shadow-sm active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60
        ${
          state === "error"
            ? "text-red-600 bg-red-50 border border-red-200 hover:bg-red-100"
            : "text-white bg-[#111827] hover:bg-[#1f2937]"
        }`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {STATE_LABEL[state]}
        </>
      ) : state === "error" ? (
        <>
          <AlertCircle className="w-3.5 h-3.5" />
          {STATE_LABEL.error}
        </>
      ) : (
        <>
          <Download className="w-3.5 h-3.5" />
          {STATE_LABEL.idle}
        </>
      )}
    </button>
  );
}
