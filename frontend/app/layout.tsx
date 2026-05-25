import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DashboardLayout from "../components/DashboardLayout";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "VedaAI – AI Assessment Creator",
    template: "%s | VedaAI",
  },
  description:
    "Generate structured, professional exam papers in seconds with AI. Powered by GPT-4, real-time WebSocket progress, and a fully editable output editor.",
  keywords: [
    "AI assessment",
    "exam paper generator",
    "question paper",
    "EdTech",
    "teacher tools",
    "AI grading",
  ],
  authors: [{ name: "VedaAI", url: "https://myvedaai.com" }],
  openGraph: {
    title: "VedaAI – AI Assessment Creator",
    description:
      "Generate structured, professional exam papers in seconds with AI.",
    type: "website",
    siteName: "VedaAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "VedaAI – AI Assessment Creator",
    description:
      "Generate structured, professional exam papers in seconds with AI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="h-full bg-[#f4f5f6]" suppressHydrationWarning>
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}
