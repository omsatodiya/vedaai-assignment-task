"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import {
  LayoutGrid,
  Users,
  FileText,
  BookOpen,
  Library,
  Settings,
  Bell,
  ChevronDown,
  ArrowLeft,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { useAssignmentStore } from "../store/assignmentStore";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

type TabType =
  | "Home"
  | "My Groups"
  | "Assignments"
  | "AI Teacher's Toolkit"
  | "My Library"
  | "Settings";

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const assignments = useAssignmentStore((state) => state.assignments);

  const [activeTab, setActiveTab] = useState<TabType>("Assignments");

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    {
      name: "Home",
      icon: LayoutGrid,
      path: "Home",
    },
    {
      name: "My Groups",
      icon: Users,
      path: "My Groups",
    },
    {
      name: "Assignments",
      icon: FileText,
      path: "Assignments",
    },
    {
      name: "AI Teacher's Toolkit",
      icon: BookOpen,
      path: "AI Teacher's Toolkit",
    },
    {
      name: "My Library",
      icon: Library,
      path: "My Library",
    },
  ] as const;

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);

    if (pathname !== "/") {
      router.push("/");
    }
  };

  const isCreatePage = pathname === "/create";

  const isDetailsPage = pathname.startsWith("/assignment/");

  return (
    <div className="w-screen h-screen bg-[#efefef] p-4 overflow-hidden font-sans">
      <div className="flex h-full gap-4">
        {/* ================= SIDEBAR ================= */}

        <aside
          className={`
            relative
            bg-[#fafafa]
            border
            border-[#e9e9e9]
            rounded-[26px]
            shadow-sm
            transition-all
            duration-300
            flex
            flex-col
            justify-between
            overflow-hidden
            ${sidebarOpen ? "w-63.75 px-4 py-5" : "w-19 px-3 py-5"}
          `}
        >
          {/* ================= TOP ================= */}

          <div>
            {/* LOGO + TOGGLE */}
            <div
              className={`
                flex items-center
                ${sidebarOpen ? "justify-between" : "justify-center"}
              `}
            >
              {sidebarOpen ? (
                <>
                  {/* LOGO */}
                  <div className="flex items-center gap-3">
                    <img
                      src="/logo-o.png"
                      alt="VedaAI"
                      className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0"
                    />

                    <h1 className="text-[28px] font-bold tracking-[-1px] text-[#1f2937]">
                      VedaAI
                    </h1>
                  </div>

                  {/* TOGGLE */}
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="
                      w-9
                      h-9
                      rounded-xl
                      flex
                      items-center
                      justify-center
                      hover:bg-[#f1f1f1]
                      transition-all
                      cursor-pointer
                    "
                  >
                    <PanelLeftClose className="w-5 h-5 text-[#6b7280]" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="
                    w-10
                    h-10
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    hover:bg-[#f1f1f1]
                    transition-all
                    cursor-pointer
                  "
                >
                  <PanelLeftOpen className="w-5 h-5 text-[#6b7280]" />
                </button>
              )}
            </div>

            {/* CREATE BUTTON */}

            <button
              onClick={() => router.push("/create")}
              className="
                mt-8
                w-full
                h-13
                rounded-2xl
                bg-[#202020]
                hover:bg-[#111111]
                border
                border-[#f59c73]
                transition-all
                shadow-sm
                flex
                items-center
                justify-center
                gap-2
                cursor-pointer
              "
            >
              <Sparkles className="w-4 h-4 text-white" />

              {sidebarOpen && (
                <span className="text-sm font-medium text-white">
                  Create Assignment
                </span>
              )}
            </button>

            {/* NAVIGATION */}

            <nav className="mt-10 flex flex-col gap-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;

                const isActive = pathname === "/" && activeTab === item.path;

                return (
                  <button
                    key={item.name}
                    onClick={() => handleTabClick(item.path as TabType)}
                    className={`
                      h-12
                      rounded-2xl
                      transition-all
                      duration-200
                      flex
                      items-center
                      cursor-pointer
                      ${sidebarOpen ? "px-4 gap-3" : "justify-center"}
                      ${
                        isActive
                          ? "bg-[#ececec] text-[#111827]"
                          : "text-[#7b7b7b] hover:bg-white hover:shadow-sm"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 shrink-0" />

                    {sidebarOpen && (
                      <span className="text-[14px] font-medium">
                        {item.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* ================= BOTTOM ================= */}

          <div>
            {/* SETTINGS */}

            <button
              className={`
                w-full
                h-12
                rounded-2xl
                transition-all
                duration-200
                flex
                items-center
                cursor-pointer
                text-[#7b7b7b]
                hover:bg-white
                hover:shadow-sm
                ${sidebarOpen ? "px-4 gap-3" : "justify-center"}
              `}
            >
              <Settings className="w-5 h-5 shrink-0" />

              {sidebarOpen && (
                <span className="text-[14px] font-medium">Settings</span>
              )}
            </button>

            {/* SCHOOL CARD */}

            {sidebarOpen && (
              <div className="mt-4 bg-[#f3f4f6] rounded-2xl p-3 flex items-center gap-3 border border-[#ededed]">
                <img
                  src="/monkey_avatar.png"
                  alt="school"
                  className="w-11 h-11 rounded-full object-cover"
                />

                <div>
                  <p className="text-[13px] font-semibold text-[#222]">
                    Delhi Public School
                  </p>

                  <p className="text-[11px] text-[#7b7b7b] mt-0.5">
                    Bokaro Steel City
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ================= MAIN CONTENT ================= */}

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* ================= TOPBAR ================= */}

          <header className="h-18.5 bg-[#fafafa] border border-[#e9e9e9] rounded-[22px] px-8 flex items-center justify-between shadow-sm">
            {/* LEFT */}

            <div className="flex items-center gap-4">
              {(isCreatePage || isDetailsPage) && (
                <button
                  onClick={() => router.push("/")}
                  className="
                    w-10
                    h-10
                    rounded-xl
                    border
                    border-[#ececec]
                    flex
                    items-center
                    justify-center
                    hover:bg-[#f7f7f7]
                    transition-all
                    cursor-pointer
                  "
                >
                  <ArrowLeft className="w-4 h-4 text-[#444]" />
                </button>
              )}

              <div className="flex items-center gap-2 text-[#666]">
                <LayoutGrid className="w-4 h-4" />

                <span className="text-sm font-medium">
                  {isCreatePage
                    ? "Create Assignment"
                    : isDetailsPage
                      ? "Assignment"
                      : activeTab}
                </span>
              </div>
            </div>

            {/* RIGHT */}

            <div className="flex items-center gap-5">
              {/* NOTIFICATION */}

              <button className="relative cursor-pointer">
                <Bell className="w-5 h-5 text-[#444]" />

                <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
              </button>

              {/* PROFILE */}

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <img
                    src="/avatar.png"
                    alt="avatar"
                    className="w-9 h-9 rounded-full object-cover"
                  />

                  <span className="text-sm font-semibold text-[#222]">
                    John Doe
                  </span>

                  <ChevronDown className="w-4 h-4 text-[#666]" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-12 w-47.5 bg-white rounded-2xl border border-[#ececec] shadow-lg p-2 z-50">
                    <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f5f5f5] text-sm transition-all cursor-pointer">
                      My Profile
                    </button>

                    <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f5f5f5] text-sm text-red-500 transition-all cursor-pointer">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ================= CONTENT PANEL ================= */}

          <div className="flex-1 pt-4 overflow-hidden">
            <div className="h-full bg-[#fafafa] border border-[#e9e9e9] rounded-[24px] shadow-sm overflow-y-auto">
              {/* EMPTY STATE */}

              {pathname === "/" &&
              activeTab === "Assignments" &&
              assignments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                  <img
                    src="/empty-assignment.png"
                    alt="No Assignments"
                    className="w-62.5 mb-8 opacity-95"
                  />

                  <h2 className="text-[30px] font-bold text-[#222]">
                    No assignments yet
                  </h2>

                  <p className="mt-3 text-[#7a7a7a] text-[15px] leading-7 max-w-140">
                    Create your first assignment to start collecting and grading
                    student submissions. You can set up rubrics, define marking
                    criteria, and let AI assist with grading.
                  </p>

                  <button
                    onClick={() => router.push("/create")}
                    className="
                      mt-8
                      h-13
                      px-7
                      rounded-2xl
                      bg-[#191919]
                      hover:bg-black
                      transition-all
                      text-white
                      text-sm
                      font-medium
                      flex
                      items-center
                      gap-2
                      cursor-pointer
                    "
                  >
                    <Sparkles className="w-4 h-4" />
                    Create Your First Assignment
                  </button>
                </div>
              ) : (
                <div className="h-full">{children}</div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
