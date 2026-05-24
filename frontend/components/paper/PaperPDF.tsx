"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { PaperMeta, PaperSection } from "./PaperDocument";

// ── Styles ────────────────────────────────────────────────────────────────────
// Rules:
//  • Never use `gap` on flex rows — not reliable across react-pdf versions.
//  • Never use percentage widths inside flex:1 containers — use flex instead.
//  • Use explicit width/marginRight for spacing.

const S = StyleSheet.create({
  page: {
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 58,
    fontSize: 10.5,
    fontFamily: "Times-Roman",
    color: "#111827",
    lineHeight: 1.5,
  },

  // ── Header ──
  headerWrap: { alignItems: "center", marginBottom: 6 },
  schoolName: {
    fontFamily: "Times-Bold",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  paperTitle: { fontFamily: "Times-Bold", fontSize: 12, marginBottom: 2 },
  headerMeta: { fontSize: 10, marginBottom: 1 },
  headerMetaBold: { fontFamily: "Times-Bold", fontSize: 10 },

  // ── Divider ──
  divider: {
    borderBottomWidth: 0.75,
    borderBottomColor: "#9ca3af",
    marginVertical: 8,
  },

  // ── Meta row (Time / Marks) ──
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 10,
    marginBottom: 2,
  },
  metaBold: { fontFamily: "Times-Bold", fontSize: 10 },

  // ── General instructions ──
  instructions: { fontSize: 10, color: "#374151", marginTop: 4 },

  // ── Student fields ──
  studentRow: { flexDirection: "row", marginTop: 10, marginBottom: 2 },
  studentField: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginRight: 24,
  },
  studentLabel: { fontSize: 9, color: "#374151", marginRight: 4 },
  studentLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#374151",
    width: 80,
    marginBottom: 1,
  },

  // ── Section ──
  sectionWrap: { marginTop: 16 },
  sectionTitle: {
    fontFamily: "Times-Bold",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: "Times-Bold",
    fontSize: 10.5,
    marginBottom: 2,
  },
  sectionInstruction: {
    fontFamily: "Times-Italic",
    fontSize: 9.5,
    color: "#374151",
    marginBottom: 8,
  },

  // ── Question ──
  questionWrap: { marginBottom: 10 },
  questionRow: { flexDirection: "row" },
  // Fixed-width number column so body text always starts at the same indent
  questionNum: {
    fontFamily: "Times-Bold",
    fontSize: 10.5,
    width: 22,
    flexShrink: 0,
  },
  questionBody: { flex: 1, fontSize: 10.5 },
  marksTag: { fontSize: 9, color: "#6b7280" },

  // ── MCQ options — two explicit columns, no flexWrap ──
  optionRow: {
    flexDirection: "row",
    marginLeft: 22,
    marginTop: 3,
  },
  optionCell: { flex: 1, fontSize: 9.5 },

  // ── End of paper ──
  endText: {
    fontFamily: "Times-Bold",
    fontSize: 10.5,
    textAlign: "center",
    marginTop: 30,
  },

  // ── Answer Key page ──
  akTitle: { fontFamily: "Times-Bold", fontSize: 12, marginBottom: 6 },
  akRow: { flexDirection: "row", marginBottom: 5 },
  akNum: {
    fontFamily: "Times-Bold",
    fontSize: 10.5,
    width: 22,
    flexShrink: 0,
  },
  akAnswer: { flex: 1, fontSize: 10.5, color: "#374151" },
});

// ── Helper: render MCQ options as explicit 2-column rows ─────────────────────
// Avoids flexWrap + percentage widths which are unreliable in react-pdf.

function OptionRows({ options }: { options: string[] }) {
  const rows: Array<[string, number, string | null, number | null]> = [];
  for (let i = 0; i < options.length; i += 2) {
    rows.push([
      options[i] ?? "",
      i,
      options[i + 1] ?? null,
      options[i + 1] != null ? i + 1 : null,
    ]);
  }
  return (
    <>
      {rows.map(([left, li, right, ri]) => (
        <View key={li} style={S.optionRow}>
          <Text style={S.optionCell}>
            ({String.fromCharCode(97 + li)}) {left}
          </Text>
          {right !== null && ri !== null ? (
            <Text style={S.optionCell}>
              ({String.fromCharCode(97 + ri)}) {right}
            </Text>
          ) : (
            <View style={S.optionCell} />
          )}
        </View>
      ))}
    </>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface PaperPDFProps {
  title: string;
  totalMarks: number;
  meta: PaperMeta;
  sections: PaperSection[];
  showAnswerKey: boolean;
}

// ── Main document ─────────────────────────────────────────────────────────────

export function PaperPDFDocument({
  title,
  totalMarks,
  meta,
  sections,
  showAnswerKey,
}: PaperPDFProps) {
  // Build answer key
  let globalIdx = 0;
  const answerKeyItems: { num: number; answer: string }[] = [];
  sections.forEach((s) => {
    s.questions.forEach((q) => {
      globalIdx++;
      if (q.answer) answerKeyItems.push({ num: globalIdx, answer: q.answer });
    });
  });
  const hasAnswerKey = showAnswerKey && answerKeyItems.length > 0;

  return (
    <Document>
      {/* ══════════════════════════════════════
          Question Paper page(s)
      ══════════════════════════════════════ */}
      <Page size="A4" style={S.page}>

        {/* Header */}
        <View style={S.headerWrap}>
          {meta.schoolName ? (
            <Text style={S.schoolName}>{meta.schoolName}</Text>
          ) : null}
          <Text style={S.paperTitle}>{title}</Text>
          {meta.subject ? (
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Text style={S.headerMetaBold}>Subject: </Text>
              <Text style={S.headerMeta}>{meta.subject}</Text>
            </View>
          ) : null}
          {meta.classStandard ? (
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Text style={S.headerMetaBold}>Class: </Text>
              <Text style={S.headerMeta}>{meta.classStandard}</Text>
            </View>
          ) : null}
        </View>

        <View style={S.divider} />

        {/* Time + Marks row */}
        {(meta.duration || totalMarks > 0) ? (
          <View style={S.metaRow}>
            <View style={{ flexDirection: "row" }}>
              {meta.duration ? (
                <>
                  <Text style={S.metaBold}>Time Allowed: </Text>
                  <Text style={{ fontSize: 10 }}>{meta.duration}</Text>
                </>
              ) : (
                <Text> </Text>
              )}
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={S.metaBold}>Maximum Marks: </Text>
              <Text style={{ fontSize: 10 }}>{String(totalMarks)}</Text>
            </View>
          </View>
        ) : null}

        {/* General instructions */}
        {meta.instructions ? (
          <Text style={S.instructions}>{meta.instructions}</Text>
        ) : null}

        {/* Student fields: Name / Roll Number / Class */}
        <View style={S.studentRow}>
          {["Name", "Roll Number", "Class"].map((label) => (
            <View key={label} style={S.studentField}>
              <Text style={S.studentLabel}>{label}:</Text>
              <View style={S.studentLine} />
            </View>
          ))}
        </View>

        <View style={S.divider} />

        {/* Sections */}
        {sections.map((section, si) => {
          const offset = sections
            .slice(0, si)
            .reduce((acc, s) => acc + s.questions.length, 0);

          return (
            <View key={section.id} style={S.sectionWrap}>
              <Text style={S.sectionTitle}>{section.title}</Text>

              {section.subtitle ? (
                <Text style={S.sectionSubtitle}>{section.subtitle}</Text>
              ) : null}

              {section.instruction ? (
                <Text style={S.sectionInstruction}>{section.instruction}</Text>
              ) : null}

              {section.questions.map((q, qi) => {
                const num = offset + qi + 1;
                const hasOptions = q.options && q.options.length > 0;
                return (
                  // wrap={false} prevents a question from being split mid-page
                  <View key={q.id} style={S.questionWrap} wrap={false}>
                    <View style={S.questionRow}>
                      <Text style={S.questionNum}>{num}.</Text>
                      <Text style={S.questionBody}>
                        {q.question}
                        {"  "}
                        <Text style={S.marksTag}>
                          [{q.marks} {q.marks === 1 ? "Mark" : "Marks"} | {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}]
                        </Text>
                      </Text>
                    </View>

                    {/* MCQ options rendered as explicit 2-column rows */}
                    {hasOptions ? (
                      <OptionRows options={q.options!} />
                    ) : null}
                  </View>
                );
              })}
            </View>
          );
        })}

        <Text style={S.endText}>— End of Question Paper —</Text>
      </Page>

      {/* ══════════════════════════════════════
          Answer Key — always a fresh page
      ══════════════════════════════════════ */}
      {hasAnswerKey ? (
        <Page size="A4" style={S.page}>
          <Text style={S.akTitle}>Answer Key</Text>
          <View style={S.divider} />
          {answerKeyItems.map(({ num, answer }) => (
            <View key={num} style={S.akRow} wrap={false}>
              <Text style={S.akNum}>{num}.</Text>
              <Text style={S.akAnswer}>{answer}</Text>
            </View>
          ))}
        </Page>
      ) : null}
    </Document>
  );
}
