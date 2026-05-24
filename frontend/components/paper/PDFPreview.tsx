"use client";

/**
 * Client-only PDF preview — dynamically imported in PaperEditorView.
 * Uses @react-pdf/renderer's PDFViewer which renders the real PDF in an
 * embedded iframe so the user sees proper A4 pages, not flat HTML.
 */

import React, { useEffect, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { PaperPDFDocument } from "./PaperPDF";
import type { PaperPDFProps } from "./PaperPDF";

export default function PDFPreview(props: PaperPDFProps) {
  // PDFViewer needs the DOM — guard against hydration mismatch
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-[780px] bg-[#f3f4f6] rounded-2xl border border-[#e5e7eb]">
        <p className="text-sm text-[#9ca3af]">Preparing preview…</p>
      </div>
    );
  }

  return (
    <PDFViewer
      width="100%"
      height="780"
      showToolbar
      style={{ border: "none", borderRadius: "16px" }}
    >
      <PaperPDFDocument {...props} />
    </PDFViewer>
  );
}
