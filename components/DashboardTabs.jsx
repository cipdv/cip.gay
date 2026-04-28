"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  createTask,
  deleteTask,
  reorderTasks,
  updateTask,
} from "@/app/_actions";

function SubmitButton({ children, className = "" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={`btn border border-black rounded-none ${className}`}
      disabled={pending}
    >
      {pending ? "Saving..." : children}
    </button>
  );
}

function formatDateOnly(value) {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function sortTasks(tasks) {
  return [...tasks]
    .filter((t) => t.status === "active")
    .sort((a, b) => {
      const ao = Number.isFinite(Number(a.sort_order))
        ? Number(a.sort_order)
        : Infinity;
      const bo = Number.isFinite(Number(b.sort_order))
        ? Number(b.sort_order)
        : Infinity;
      if (ao !== bo) return ao - bo;

      const ad = a.due_date ? new Date(a.due_date).getTime() : Infinity;
      const bd = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      if (ad !== bd) return ad - bd;

      const ac = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bc = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bc - ac;
    });
}

export default function DashboardTabs({ initialTasks, projects = [] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [tasks, setTasks] = useState(() =>
    sortTasks(Array.isArray(initialTasks) ? initialTasks : [])
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setTasks(sortTasks(Array.isArray(initialTasks) ? initialTasks : []));
  }, [initialTasks]);

  const timeZone = "America/Toronto";
  const localDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    []
  );
  const today = localDateFormatter.format(new Date());

  const completedToday = useMemo(() => {
    const arr = Array.isArray(initialTasks) ? initialTasks : [];
    return arr.filter((t) => {
      if (t.status !== "completed" || !t.completed_at) return false;
      try {
        const completedLocal = localDateFormatter.format(
          new Date(t.completed_at)
        );
        return completedLocal === today;
      } catch {
        return false;
      }
    });
  }, [initialTasks, today, localDateFormatter]);

  const moveTask = (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return;

    const fromIndex = tasks.findIndex((task) => task.id === fromId);
    const toIndex = tasks.findIndex((task) => task.id === toId);
    if (fromIndex === -1 || toIndex === -1) return;

    const nextTasks = [...tasks];
    const [moved] = nextTasks.splice(fromIndex, 1);
    nextTasks.splice(toIndex, 0, moved);

    setTasks(nextTasks);
    startTransition(async () => {
      await reorderTasks(nextTasks.map((task) => task.id));
      router.refresh();
    });
  };

  return (
    <div className="border border-black p-6">
      <form
        action={async (formData) => {
          await createTask(formData);
          router.refresh();
        }}
        className="border border-black p-4 mb-6"
      >
        <h2 className="font-bold mb-3">New task</h2>

        <div className="grid gap-3">
          <input
            name="title"
            placeholder="Task title"
            className="border border-black p-2 rounded-none bg-transparent"
            required
          />

          <input
            name="dueDate"
            type="date"
            defaultValue=""
            className="border border-black p-2 rounded-none bg-transparent"
          />

          <select
            name="projectId"
            defaultValue=""
            className="border border-black p-2 rounded-none bg-transparent"
          >
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>

          <textarea
            name="details"
            placeholder="Details (optional)"
            className="border border-black p-2 rounded-none bg-transparent"
            rows={3}
          />

          <SubmitButton>Create task</SubmitButton>
        </div>
      </form>

      <div className="border border-black p-3 mb-6">
        <h2 className="font-semibold text-sm mb-2">Completed today</h2>
        {completedToday.length === 0 ? (
          <p className="text-sm">No tasks completed today.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {completedToday.map((t) => (
              <li
                key={t.id}
                className="p-1 border-b border-dotted border-black/50 last:border-b-0"
              >
                {t.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      {tasks.length === 0 ? (
        <p>No upcoming tasks.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {tasks.map((t) => {
            const isEditing = editingId === t.id;
            const dueDateStr = formatDateOnly(t.due_date);

            return (
              <li
                key={t.id}
                draggable={!isEditing && !isPending}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", t.id);
                  setDraggingId(t.id);
                }}
                onDragOver={(event) => {
                  if (!isEditing) event.preventDefault();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const droppedId =
                    event.dataTransfer.getData("text/plain") || draggingId;
                  moveTask(droppedId, t.id);
                  setDraggingId(null);
                }}
                onDragEnd={() => setDraggingId(null)}
                className={`border border-black p-3 bg-white/70 ${
                  draggingId === t.id ? "opacity-60" : ""
                } ${!isEditing ? "cursor-move" : ""}`}
              >
                {!isEditing ? (
                  <div className="flex justify-between gap-4 items-start">
                    <div className="min-w-0 flex-1 space-y-1 break-words">
                      <div className="font-bold break-words">{t.title}</div>
                      {dueDateStr && (
                        <div className="text-sm break-words">
                          Due: {dueDateStr}
                        </div>
                      )}
                      {t.details && (
                        <div className="text-sm mt-2 break-words">
                          {t.details}
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0 flex items-stretch gap-2">
                      <form
                        action={async (formData) => {
                          await updateTask(formData);
                          router.refresh();
                        }}
                        className="flex"
                      >
                        <input type="hidden" name="taskId" value={t.id} />
                        <input type="hidden" name="status" value="completed" />
                        <SubmitButton className="h-full min-w-[6.75rem]">
                          Complete
                        </SubmitButton>
                      </form>

                      <div className="flex flex-col gap-2 h-full">
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (
                              typeof window !== "undefined" &&
                              !window.confirm("Delete this task?")
                            ) {
                              return;
                            }
                            await deleteTask(t.id);
                            router.refresh();
                          }}
                          className="flex-1"
                        >
                          <button
                            type="submit"
                            className="border border-black rounded-none p-2 w-10 h-full min-h-10 hover:bg-[#e0e5c7]"
                            aria-label="Delete task"
                            title="Delete task"
                          >
                            <i
                              className="fa-solid fa-trash-can"
                              aria-hidden="true"
                            ></i>
                          </button>
                        </form>
                        <button
                          type="button"
                          className="border border-black rounded-none p-2 w-10 flex-1 min-h-10 hover:bg-[#e0e5c7]"
                          aria-label="Edit task"
                          title="Edit task"
                          onClick={() => setEditingId(t.id)}
                        >
                          <i
                            className="fa-regular fa-pen-to-square"
                            aria-hidden="true"
                          ></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form
                    action={async (formData) => {
                      await updateTask(formData);
                      setEditingId(null);
                      router.refresh();
                    }}
                    className="grid gap-3"
                  >
                    <input type="hidden" name="taskId" value={t.id} />

                    <input
                      name="title"
                      defaultValue={t.title}
                      className="border border-black p-2 rounded-none"
                      required
                    />

                    <input
                      name="dueDate"
                      type="date"
                      defaultValue={dueDateStr || ""}
                      className="border border-black p-2 rounded-none"
                    />

                    <select
                      name="projectId"
                      defaultValue={t.project_id || ""}
                      className="border border-black p-2 rounded-none"
                    >
                      <option value="">No project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.title}
                        </option>
                      ))}
                    </select>

                    <textarea
                      name="details"
                      defaultValue={t.details || ""}
                      className="border border-black p-2 rounded-none"
                      rows={3}
                    />

                    <div className="flex gap-2">
                      <SubmitButton>Save</SubmitButton>
                      <button
                        type="button"
                        className="btn border border-black"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
