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
  Menu,
  X,
  Plus,
} from "lucide-react";
import { useAssignmentStore } from "../store/assignmentStore";
import { motion, AnimatePresence } from "framer-motion";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: "Home", icon: LayoutGrid, path: "Home" },
    { name: "My Groups", icon: Users, path: "My Groups" },
    { name: "Assignments", icon: FileText, path: "Assignments" },
    {
      name: "AI Teacher's Toolkit",
      icon: BookOpen,
      path: "AI Teacher's Toolkit",
    },
    { name: "My Library", icon: Library, path: "My Library" },
  ] as const;

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    if (pathname !== "/") {
      router.push("/");
    }
  };

  const isCreatePage = pathname === "/create";
  const isDetailsPage = pathname.startsWith("/assignment/");

  // Mobile navigation bottom items
  const mobileNavItems = [
    { name: "Home", icon: LayoutGrid, tab: "Home" },
    { name: "Assignments", icon: FileText, tab: "Assignments" },
    { name: "Library", icon: Library, tab: "My Library" },
    { name: "AI Toolkit", icon: Sparkles, tab: "AI Teacher's Toolkit" },
  ] as const;

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between">
      <div className="flex flex-col gap-6">
        {/* Logo Section */}
        <div
          className={`flex items-center ${sidebarOpen ? "justify-between" : "justify-center"} px-1`}
        >
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-[#ea580c] via-[#d97706] to-[#f97316] rounded-xl flex items-center justify-center shadow-md text-white font-extrabold text-2xl shrink-0">
                  V
                </div>
                <span className="font-bold text-xl tracking-tight text-[#111827]">
                  VedaAI
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="hidden md:flex w-8 h-8 rounded-xl items-center justify-center hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="hidden md:flex w-10 h-10 rounded-xl items-center justify-center hover:bg-slate-100 text-slate-400 cursor-pointer"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Create Assignment Button */}
        <button
          onClick={() => {
            setMobileMenuOpen(false);
            router.push("/create");
          }}
          className="w-full bg-[#202020] hover:bg-[#111111] active:scale-[0.98] transition-all duration-200 py-3.5 px-4 rounded-2xl font-semibold text-xs text-white flex items-center justify-center gap-2 border border-[#f59c73] shadow-sm cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-white fill-white" />
          {sidebarOpen && <span>Create Assignment</span>}
        </button>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1.5 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === "/" && activeTab === item.path;
            return (
              <motion.button
                key={item.name}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTabClick(item.path as TabType)}
                className={`w-full flex items-center ${sidebarOpen ? "justify-between px-3.5" : "justify-center"} py-3 rounded-xl cursor-pointer text-left font-medium text-sm group relative ${
                  isActive
                    ? "text-[#111827] font-semibold"
                    : "text-[#7b7b7b] hover:text-[#111827]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeDesktopSidebarTab"
                    className="absolute inset-0 bg-[#f1f3f5] rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <div className="flex items-center gap-3 z-10">
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-[#374151]" : "text-[#9ca3af] group-hover:text-[#374151]"}`}
                  />
                  {sidebarOpen && (
                    <span className="tracking-wide">{item.name}</span>
                  )}
                </div>
                {sidebarOpen &&
                  item.path === "Assignments" &&
                  assignments.length > 0 && (
                    <span
                      className={`px-2 py-0.5 text-[10px] rounded-full font-bold transition-colors z-10 ${
                        isActive
                          ? "bg-[#ea580c] text-white"
                          : "bg-[#ffedd5] text-[#ea580c]"
                      }`}
                    >
                      {assignments.length}
                    </span>
                  )}
                {sidebarOpen && item.path === "My Library" && (
                  <span className="px-2 py-0.5 text-[10px] rounded-full font-bold bg-[#f3f4f6] text-[#7b7b7b] z-10">
                    32
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Footer Area with Settings and School Card */}
      <div className="flex flex-col gap-4">
        <motion.button
          onClick={() => handleTabClick("Settings")}
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center ${sidebarOpen ? "gap-3 px-3.5" : "justify-center"} py-3 rounded-xl cursor-pointer text-left font-medium text-sm group relative ${
            pathname === "/" && activeTab === "Settings"
              ? "text-[#111827] font-semibold"
              : "text-[#7b7b7b] hover:text-[#111827]"
          }`}
        >
          {pathname === "/" && activeTab === "Settings" && (
            <motion.div
              layoutId="activeDesktopSidebarTab"
              className="absolute inset-0 bg-[#f1f3f5] rounded-xl -z-10"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <div className="flex items-center gap-3 z-10">
            <Settings className="w-5 h-5 shrink-0 text-[#9ca3af]" />
            {sidebarOpen && <span className="tracking-wide">Settings</span>}
          </div>
        </motion.button>

        {/* School Card with Generated Monkey Avatar */}
        {sidebarOpen && (
          <motion.div
            whileHover={{ scale: 1.015 }}
            className="bg-[#f3f4f6] p-3 rounded-2xl flex items-center gap-3 border border-[#f3f4f6] cursor-pointer"
          >
            <img
              src="/monkey_avatar.png"
              alt="School Mascot"
              className="w-10 h-10 rounded-full border border-slate-200 shadow-sm object-cover shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs text-[#111827] tracking-wide truncate">
                Delhi Public School
              </span>
              <span className="text-[10px] text-[#6b7280] font-normal truncate mt-0.5">
                Bokaro Steel City
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#efefef] p-4 font-sans overflow-x-hidden relative">
      <div className="flex min-h-[calc(100vh-32px)] gap-4 items-stretch">
        {/* --- DESKTOP SIDEBAR SPACER & ASIDE --- */}
        <div
          className={`hidden md:block ${sidebarOpen ? "w-63.75" : "w-19"} shrink-0 transition-all duration-300`}
        />

        <aside
          className={`hidden md:flex fixed left-4 top-4 bottom-4 z-20 bg-white border border-[#e9e9e9] rounded-[26px] shadow-sm transition-all duration-300 flex-col justify-between overflow-hidden ${
            sidebarOpen ? "w-63.75 px-4 py-5" : "w-19 px-3 py-5"
          }`}
        >
          <SidebarContent />
        </aside>

        {/* --- MOBILE DRAWER OVERLAY & MENU --- */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/40 z-40 md:hidden"
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-4 bottom-4 left-4 z-50 bg-white border border-[#e9e9e9] rounded-[26px] shadow-2xl p-5 flex flex-col justify-between md:hidden w-63.75"
              >
                {/* Close button inside drawer */}
                <div className="absolute top-4 right-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
                <SidebarContent />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* --- MOBILE FLOATING HEADER CARD --- */}
        <header className="fixed top-4 left-4 right-4 h-15 bg-white border border-[#e9e9e9] rounded-2xl px-4 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.03)] z-30 md:hidden">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8.5 h-8.5 bg-black rounded-xl flex items-center justify-center shadow-sm shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 text-white"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4.5 5.5C6.5 5.5 7.5 7.5 9 11L12 18L15 11C16.5 7.5 17.5 5.5 19.5 5.5" />
              </svg>
            </div>
            <span className="font-bold text-base tracking-tight text-[#111827] ml-0.5">
              VedaAI
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-full bg-[#f3f4f6] hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-all">
              <Bell
                className="w-4.5 h-4.5 text-[#111827] fill-[#111827]/10"
                strokeWidth={2}
              />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#ea580c] rounded-full border-2 border-white" />
            </button>
            <img
              src="/john_doe.png"
              alt="User Avatar"
              className="w-9 h-9 rounded-full object-cover border border-slate-100 shrink-0 shadow-sm"
            />
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="w-8 h-8 flex items-center justify-center text-slate-800 cursor-pointer"
            >
              <Menu className="w-6 h-6 stroke-[2]" />
            </button>
          </div>
        </header>

        {/* --- MAIN CONTENT FRAME --- */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* --- DESKTOP FIXED TOP HEADER --- */}
          <header
            className={`hidden md:flex h-18.5 bg-[#fafafa]/95 backdrop-blur-md border border-[#e9e9e9] rounded-[22px] px-8 items-center justify-between shadow-sm fixed top-4 right-4 z-30 transition-all duration-300 ${
              sidebarOpen ? "left-[287px]" : "left-[108px]"
            }`}
          >
            <div className="flex items-center gap-4">
              {(isCreatePage || isDetailsPage) && (
                <motion.button
                  onClick={() => router.push("/")}
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl border border-[#ececec] flex items-center justify-center hover:bg-[#f7f7f7] transition-all cursor-pointer animate-in fade-in"
                >
                  <ArrowLeft className="w-4 h-4 text-[#444]" />
                </motion.button>
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

            <div className="flex items-center gap-5">
              <button className="relative cursor-pointer">
                <Bell className="w-5 h-5 text-[#444]" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <img
                    src="/john_doe.png"
                    alt="User Avatar"
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
                  />
                  <span className="text-sm font-semibold text-[#222]">
                    John Doe
                  </span>
                  <ChevronDown className="w-4 h-4 text-[#666]" />
                </button>
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-47.5 bg-white rounded-2xl border border-[#ececec] shadow-lg p-2 z-50"
                    >
                      <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f5f5f5] text-sm transition-all cursor-pointer">
                        My Profile
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f5f5f5] text-sm text-red-500 transition-all cursor-pointer">
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* --- CONTENT CONTAINER (Mobile/Desktop responsive paddings) --- */}
          <div className="flex-1 pt-[84px] md:pt-[90px] pb-24 md:pb-4 flex flex-col px-0 md:px-0">
            <div className="flex-1 bg-transparent md:border border-none rounded-none md:rounded-[24px] shadow-none min-h-[calc(100vh-122px)] p-0 md:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* --- MOBILE FLOATING BOTTOM NAV BAR --- */}
      <nav className="fixed bottom-4 left-4 right-4 h-16 bg-[#111111] rounded-[22px] px-6 flex items-center justify-between shadow-2xl z-30 md:hidden">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            (pathname === "/" && activeTab === item.tab) ||
            (pathname.startsWith("/create") && item.tab === "Assignments") ||
            (pathname.startsWith("/assignment/") && item.tab === "Assignments");
          return (
            <motion.button
              key={item.name}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleTabClick(item.tab as TabType)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-150 py-1 ${
                isActive
                  ? "text-white font-semibold"
                  : "text-[#7b7b7b] hover:text-white/80"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${isActive ? "stroke-[2.2]" : "stroke-[1.8]"}`}
              />
              <span className="text-[9px] font-medium tracking-wide">
                {item.name}
              </span>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}
