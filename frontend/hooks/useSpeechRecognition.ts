"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechState = "idle" | "listening" | "unsupported";

interface Options {
  /** Appended to the current field value each time a final result is committed */
  onFinalResult: (text: string) => void;
  /** Called on every interim update so the UI can show live text */
  onInterimResult?: (text: string) => void;
  /** BCP-47 language tag. Defaults to browser locale */
  lang?: string;
}

// Minimal type declarations — the full Web Speech API isn't in every TS DOM lib
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult | undefined;
}
interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative | undefined;
}
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface ISpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

export function useSpeechRecognition({
  onFinalResult,
  onInterimResult,
  lang,
}: Options) {
  const [state, setState] = useState<SpeechState>("idle");
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // ── Hydration-safe supported flag ─────────────────────────────────────────
  // Initialised as false on both server and client so SSR HTML matches the
  // first client render. useEffect runs only in the browser, after hydration,
  // so by the time the user can click the mic button the real value is set.
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported(
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window,
    );
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setState("idle");
  }, []);

  const start = useCallback(() => {
    if (!supported || state === "listening") return;

    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    const recognition = new Ctor();

    recognition.lang = lang ?? navigator.language ?? "en-US";
    recognition.interimResults = true;
    recognition.continuous = true; // keep listening through pauses until user stops

    recognition.onstart = () => setState("listening");
    recognition.onend = () => setState("idle");
    recognition.onerror = () => setState("idle");

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (!result) continue;
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) final += transcript;
        else interim += transcript;
      }

      if (interim) onInterimResult?.(interim);
      if (final) onFinalResult(final.trim());
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [lang, onFinalResult, onInterimResult, state, supported]);

  const toggle = useCallback(() => {
    if (state === "listening") stop();
    else start();
  }, [state, start, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return {
    state: (supported ? state : "unsupported") as SpeechState,
    listening: state === "listening",
    supported,
    start,
    stop,
    toggle,
  };
}
