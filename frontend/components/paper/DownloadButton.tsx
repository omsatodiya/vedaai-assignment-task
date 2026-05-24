"use client";

import React, { useState } from "react";
import { Download, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

type DownloadState = "idle" | "capturing" | "generating" | "saving" | "error";

const STATE_LABEL: Record<DownloadState, string> = {
  idle: "Download as PDF",
  capturing: "Capturing layout…",
  generating: "Building PDF…",
  saving: "Saving…",
  error: "Failed — retry?",
};

interface DownloadButtonProps {
  docRef: React.RefObject<HTMLDivElement | null>;
  fileName: string;
  /** Disable while paper has no content */
  empty?: boolean;
}

export default function DownloadButton({
  docRef,
  fileName,
  empty = false,
}: DownloadButtonProps) {
  const [state, setState] = useState<DownloadState>("idle");
  const [successFlash, setSuccessFlash] = useState(false);

  const isLoading =
    state === "capturing" || state === "generating" || state === "saving";

  const handleDownload = async () => {
    if (!docRef.current || isLoading || empty) return;

    setState("capturing");
    setSuccessFlash(false);

    try {
      // ── Lazy-load heavy libs so they don't bloat the initial bundle ──
      // html-to-image: handles modern CSS color functions (oklch, lab, lch)
      // that html2canvas can't parse — required for Tailwind v4 + shadcn/ui
      const [{ toJpeg }, { default: jsPDF }] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
      ]);

      // ── Capture via SVG foreignObject — browser renders natively ──
      const el = docRef.current;

      const imgData = await toJpeg(el, {
        quality: 0.92,
        backgroundColor: "#ffffff",
        pixelRatio: 2, // retina-sharp output
        width: el.scrollWidth,
        height: el.scrollHeight,
        // Strip the visual page-break separator from the captured image
        filter: (node: Node) => {
          if (node instanceof HTMLElement) {
            return node.dataset["pdfHide"] !== "true";
          }
          return true;
        },
      });

      setState("generating");

      // ── Build PDF in mm (A4 = 210 × 297 mm) ──
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageW = pdf.internal.pageSize.getWidth(); // 210 mm
      const pageH = pdf.internal.pageSize.getHeight(); // 297 mm

      // Derive pixel dimensions from the data URL
      const img = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.src = imgData;
      });
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;

      // Scale to fit page width
      const scale = pageW / imgW;
      const scaledH = imgH * scale; // total image height in mm

      // ── Multi-page: slice the image across pages ──
      let remaining = scaledH;
      let page = 0;

      while (remaining > 0) {
        if (page > 0) pdf.addPage();
        // Negative y shifts the image up so the correct slice shows per page
        pdf.addImage(imgData, "JPEG", 0, -(page * pageH), pageW, scaledH);
        remaining -= pageH;
        page++;
      }

      // ── Save with sanitised filename ──
      setState("saving");

      const safe = fileName
        .replace(/[^\w\s-]/g, "") // strip special chars
        .replace(/\s+/g, "-") // spaces → hyphens
        .toLowerCase()
        .slice(0, 60) // cap length
        .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens

      pdf.save(`${safe || "assignment"}.pdf`);

      // ── Brief success flash ──
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
