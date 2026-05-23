"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileSearch,
  Search,
  SlidersHorizontal,
  MoreVertical,
  Calendar,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useAssignmentStore, IAssignment } from "../store/assignmentStore";
import * as api from "../lib/api";

export default function Home() {
  const router = useRouter();

  // Zustand store
  const { assignments, setAssignments, deleteAssignment } =
    useAssignmentStore();

  // Local state
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Fetch assignments on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getAssignments();
        setAssignments(data);
      } catch (err) {
        console.error("Failed to load assignments:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [setAssignments]);

  // Click away listener for card dropdowns
  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdownId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this assignment?")) {
      try {
        await api.deleteAssignment(id);
        deleteAssignment(id);
      } catch (err) {
        alert("Failed to delete assignment");
        console.error(err);
      }
    }
  };

  const getStatusColor = (status: IAssignment["status"]) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "generating":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "formatting":
        return "bg-indigo-50 text-indigo-600 border-indigo-200";
      case "queued":
        return "bg-slate-50 text-slate-500 border-slate-200";
      case "failed":
        return "bg-rose-50 text-rose-600 border-rose-200";
      default:
        return "bg-slate-50 text-slate-500 border-slate-200";
    }
  };

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Filter assignments based on search & filter options
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch = a.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-100">
        <Loader2 className="w-8 h-8 text-[#f97316] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col justify-between select-none">
      {assignments.length === 0 ? (
        /* --- EMPTY STATE VIEW --- */
        <div className="flex-1 flex flex-col items-center justify-center py-20 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-112.5 bg-white rounded-[32px] p-8 border border-[#e5e7eb] flex flex-col items-center text-center shadow-xl shadow-slate-100/50">
            {/* Visual Magnifier Cross graphic */}
            <div className="relative w-28 h-28 bg-[#f9fafb] border border-[#f3f4f6] rounded-[24px] flex items-center justify-center mb-6">
              <FileSearch className="w-14 h-14 text-slate-300 stroke-[1.2]" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold border-4 border-white shadow-md text-sm">
                ✕
              </div>
            </div>

            <h2 className="font-bold text-lg text-slate-800 tracking-tight">
              No assignments yet
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm mt-3 font-normal">
              Create your first assignment to start collecting and grading
              student submissions. You can set up rubrics, define marking
              criteria, and let AI assist with grading.
            </p>

            <button
              onClick={() => router.push("/create")}
              className="mt-8 bg-[#111827] text-white hover:bg-slate-800 py-3.5 px-6 rounded-full font-semibold text-xs flex items-center gap-2 cursor-pointer transition-all duration-200 active:scale-[0.98] shadow-lg shadow-slate-900/10"
            >
              <Plus className="w-4 h-4" />
              Create Your First Assignment
            </button>
          </div>
        </div>
      ) : (
        /* --- FILLED STATE GRID VIEW --- */
        <div className="flex flex-col gap-6 flex-1 pb-20">
          {/* Search and Filters panel */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white border border-[#e5e7eb] p-4 rounded-2xl shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#9ca3af]" />
              <input
                type="text"
                placeholder="Search Assignment"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f9fafb] border border-[#e5e7eb] focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-all rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 select-none">
              <div className="relative flex items-center border border-[#e5e7eb] bg-[#f9fafb] rounded-xl px-3 py-2 cursor-pointer hover:bg-slate-50 transition-all font-medium text-xs text-[#374151] w-full sm:w-auto gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#6b7280]" />
                <span>Filter Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent font-semibold outline-none cursor-pointer text-[#111827] pr-2"
                >
                  <option value="all">All Statuses</option>
                  <option value="queued">Queued</option>
                  <option value="generating">Generating</option>
                  <option value="formatting">Formatting</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300">
            {filteredAssignments.map((assignment) => (
              <div
                key={assignment._id}
                onClick={() => router.push(`/assignment/${assignment._id}`)}
                className="bg-white border border-[#e5e7eb] hover:border-orange-200 hover:shadow-lg hover:shadow-slate-100/80 transition-all duration-300 p-6 rounded-2xl flex flex-col justify-between gap-5 relative cursor-pointer group"
              >
                {/* Card Top */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-2 min-w-0">
                    <h3 className="font-bold text-[#111827] text-base group-hover:text-[#f97316] transition-colors leading-tight truncate">
                      {assignment.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(assignment.status)}`}
                      >
                        {assignment.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {assignment.totalQuestions} Questions •{" "}
                        {assignment.totalMarks} Marks
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Action Trigger */}
                  <div className="relative shrink-0 select-none">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownId(
                          activeDropdownId === assignment._id
                            ? null
                            : assignment._id,
                        );
                      }}
                      className="w-8 h-8 rounded-full border border-transparent hover:border-[#e5e7eb] hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <MoreVertical className="w-4.5 h-4.5 text-[#6b7280]" />
                    </button>

                    {activeDropdownId === assignment._id && (
                      <div className="absolute right-0 mt-1 w-36 bg-white border border-[#e5e7eb] rounded-xl shadow-xl py-1.5 z-40 animate-in fade-in-50 duration-150">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/assignment/${assignment._id}`);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Paper
                        </button>
                        <button
                          onClick={(e) => handleDelete(assignment._id, e)}
                          className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-xs font-semibold text-rose-600 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Bottom */}
                <div className="flex items-center justify-between border-t border-[#f3f4f6] pt-3.5 text-[11px] text-[#6b7280] font-normal">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#9ca3af]" />
                    <span>Assigned on: {formatDate(assignment.createdAt)}</span>
                  </div>
                  <span className="text-[#111827]">
                    Due: {formatDate(assignment.dueDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Center bottom Create Assignment Action */}
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-30 sm:left-[calc(50%+130px)]">
            <button
              onClick={() => router.push("/create")}
              className="bg-[#111827] text-white hover:bg-slate-800 active:scale-95 transition-all duration-200 py-3.5 px-6 rounded-full font-semibold text-xs flex items-center gap-2 shadow-2xl shadow-slate-950/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Assignment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
