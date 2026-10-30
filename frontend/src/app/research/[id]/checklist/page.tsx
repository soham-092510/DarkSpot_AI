"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  RefreshCw,
  CheckSquare,
  Square,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Save,
  ShieldCheck,
} from "lucide-react";
import { getProject, getChecklist, updateTask, Project, TaskItem } from "@/lib/api";
import { ResearchTabs } from "@/components/dashboard/ResearchTabs";

export default function VerificationChecklistPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [savingTask, setSavingTask] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [proj, tsk] = await Promise.all([
        getProject(projectId),
        getChecklist(projectId),
      ]);
      setProject(proj);
      setTasks(tsk);
      const notesInit: Record<string, string> = {};
      tsk.forEach((t) => {
        notesInit[t.id] = t.notes || "";
      });
      setEditingNotes(notesInit);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleStatusChange = async (task: TaskItem, newStatus: string) => {
    try {
      const updated = await updateTask(task.id, { status: newStatus });
      setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleSaveNotes = async (taskId: string) => {
    try {
      setSavingTask(taskId);
      const updated = await updateTask(taskId, { notes: editingNotes[taskId] });
      setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
    } catch (err: any) {
      alert("Failed to save notes: " + err.message);
    } finally {
      setSavingTask(null);
    }
  };

  if (loading || !project) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <RefreshCw className="h-4 w-4 animate-spin text-brand-600" />
          <span>Loading Verification Checklist...</span>
        </div>
      </div>
    );
  }

  const filteredTasks = tasks.filter((t) => {
    if (filterPriority === "ALL") return true;
    return t.priority === filterPriority;
  });

  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-600 uppercase">
                  Actionable Verification
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">Decision Readiness</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Prioritized Verification Checklist
              </h1>
              <p className="mt-1 text-xs text-slate-600">
                Ranked action items addressing detected gaps and conflicting claims before you finalize decisions.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs text-slate-700">
              Progress: <strong className="text-brand-600">{completedCount}</strong> of <strong>{tasks.length}</strong> Completed
            </div>
          </div>
        </div>
      </div>

      <ResearchTabs projectId={project.id} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-6">
        {/* Priority Filter Bar */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">Filter by Priority:</span>
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                filterPriority === p
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Task Cards */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
              No tasks found for the selected filter.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`rounded-xl border bg-white p-5 shadow-2xs space-y-4 transition ${
                  task.status === "COMPLETED" ? "border-slate-200 opacity-75" : "border-slate-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() =>
                        handleStatusChange(
                          task,
                          task.status === "COMPLETED" ? "PENDING" : "COMPLETED"
                        )
                      }
                      className="mt-0.5 text-slate-400 hover:text-brand-600 transition"
                    >
                      {task.status === "COMPLETED" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : task.status === "IN_PROGRESS" ? (
                        <Clock className="h-5 w-5 text-amber-500" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>

                    <div>
                      <h3
                        className={`text-sm font-bold ${
                          task.status === "COMPLETED" ? "line-through text-slate-500" : "text-slate-900"
                        }`}
                      >
                        {task.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {task.action_required}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        task.priority === "CRITICAL"
                          ? "bg-rose-100 text-rose-800"
                          : task.priority === "HIGH"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {task.priority} Priority
                    </span>

                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                      className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 focus:outline-none"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Rationale & Target Authority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Underlying Rationale
                    </span>
                    <span className="text-slate-700">{task.rationale}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Recommended Verification Target
                    </span>
                    <span className="text-brand-700 font-medium">
                      {task.recommended_source || "Official Scheme Gazette / Helpdesk"}
                    </span>
                  </div>
                </div>

                {/* User Notes */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <input
                    type="text"
                    value={editingNotes[task.id] || ""}
                    onChange={(e) =>
                      setEditingNotes({ ...editingNotes, [task.id]: e.target.value })
                    }
                    placeholder="Add personal verification notes or contact findings..."
                    className="flex-1 rounded border border-slate-200 px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500"
                  />
                  <button
                    onClick={() => handleSaveNotes(task.id)}
                    disabled={savingTask === task.id}
                    className="flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    <Save className="h-3 w-3" />
                    <span>{savingTask === task.id ? "Saving..." : "Save Note"}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
