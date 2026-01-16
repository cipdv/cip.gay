"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  createTask,
  updateTask,
  deleteTask,
  upsertJournalEntry,
  createDream,
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

export default function DashboardTabs({ initialTasks }) {
  const router = useRouter();
  const [tab, setTab] = useState("tasks"); // tasks | journal | dreams
  const [editingId, setEditingId] = useState(null);

  const [journalState, journalAction] = useActionState(
    async (prevState, formData) => {
      const result = await upsertJournalEntry(formData);
      router.refresh();
      return result || { message: "" };
    },
    { message: "" }
  );

  const timeZone = "America/Toronto";
  const localDateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const today = localDateFormatter.format(new Date());

  const tasks = useMemo(() => {
    const arr = Array.isArray(initialTasks) ? initialTasks : [];
    return arr
      .filter((t) => t.status === "active")
      .sort((a, b) => {
        const ad = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const bd = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        if (ad !== bd) return ad - bd;

        const ac = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bc = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bc - ac;
      });
  }, [initialTasks]);

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

  return (
    <div className="border border-black">
      {/* Tabs header */}
      <div className="flex border-b border-black">
        <button
          type="button"
          className={`px-6 py-3 border-r border-black ${
            tab === "tasks" ? "bg-blue-100" : ""
          }`}
          onClick={() => setTab("tasks")}
        >
          Tasks
        </button>
        <button
          type="button"
          className={`px-6 py-3 border-r border-black ${
            tab === "journal" ? "bg-blue-100" : ""
          }`}
          onClick={() => setTab("journal")}
        >
          Journal
        </button>
        <button
          type="button"
          className={`px-6 py-3 ${tab === "dreams" ? "bg-blue-100" : ""}`}
          onClick={() => setTab("dreams")}
        >
          Dreams
        </button>
      </div>

      {/* Panel */}
      <div className="p-6">
        {tab === "tasks" && (
          <div>
            {/* Create task */}
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

                <textarea
                  name="details"
                  placeholder="Details (optional)"
                  className="border border-black p-2 rounded-none bg-transparent"
                  rows={3}
                />

                <SubmitButton>Create task</SubmitButton>
              </div>
            </form>

            {/* Completed today */}
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

            {/* Upcoming tasks list */}
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
                      className="border border-black p-3 bg-white/70"
                    >
                      {!isEditing ? (
                        <div className="flex justify-between gap-4 items-start">
                          <div className="min-w-0 flex-1 space-y-1 break-words">
                            <div className="font-bold break-words">
                              {t.title}
                            </div>
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
                              <input
                                type="hidden"
                                name="status"
                                value="completed"
                              />
                              <SubmitButton className="h-full">
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
                                  className="border border-black rounded-none p-2 w-full h-full hover:bg-[#e0e5c7]"
                                  aria-label="Delete task"
                                  title="Delete task"
                                >
                                  <img
                                    src="/images/icons8-eye-16.png"
                                    alt="Delete task"
                                  />
                                </button>
                              </form>
                              <button
                                type="button"
                                className="border border-black rounded-none p-2 w-full h-full hover:bg-[#e0e5c7]"
                                aria-label="Edit task"
                                title="Edit task"
                                onClick={() => setEditingId(t.id)}
                              >
                                <img
                                  src="/images/icons8-hide-16.png"
                                  alt="Edit task"
                                />
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
                          />

                          <input
                            name="dueDate"
                            type="date"
                            defaultValue={dueDateStr || ""}
                            className="border border-black p-2 rounded-none"
                          />

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
        )}

        {tab === "journal" && (
          <div className="border border-black p-4">
            <h2 className="font-bold mb-3">Today's journal</h2>

            <form action={journalAction} className="grid gap-3">
              <input
                type="date"
                name="entryDate"
                defaultValue={today}
                className="border border-black p-2 rounded-none"
              />

              <select
                name="privacy"
                className="border border-black p-2 rounded-none"
                defaultValue="private"
              >
                <option value="private">private</option>
                <option value="public">public</option>
              </select>

              <input
                name="moodStart"
                placeholder="Mood (start)"
                className="border border-black p-2 rounded-none"
              />
              <input
                name="moodEnd"
                placeholder="Mood (end)"
                className="border border-black p-2 rounded-none"
              />

              <input
                name="exercise"
                placeholder="Exercise"
                className="border border-black p-2 rounded-none"
              />

              <input
                name="food"
                placeholder="Food"
                className="border border-black p-2 rounded-none"
              />

              <textarea
                name="reflections"
                placeholder="Reflections"
                className="border border-black p-2 rounded-none"
                rows={6}
              />

              <textarea
                name="lessonLearned"
                placeholder="Lesson learned"
                className="border border-black p-2 rounded-none"
                rows={3}
              />

              <SubmitButton>Save journal</SubmitButton>
              {journalState?.message ? (
                <p className="text-error text-sm">{journalState.message}</p>
              ) : null}
            </form>
          </div>
        )}

        {tab === "dreams" && (
          <div className="border border-black p-4">
            <h2 className="font-bold mb-3">Tell me last night's dream</h2>

            <form
              action={async (formData) => {
                await createDream(formData);
                router.refresh();
              }}
              className="grid gap-3"
            >
              <input
                type="text"
                name="title"
                placeholder="Title (optional)"
                className="border border-black p-2 rounded-none bg-transparent"
              />

              <input
                type="date"
                name="dreamDate"
                defaultValue={today}
                className="border border-black p-2 rounded-none bg-transparent"
              />

              <textarea
                name="dream"
                placeholder=""
                className="border border-black p-2 rounded-none bg-transparent"
                rows={10}
                required
              />

              <SubmitButton>send to the dream lab</SubmitButton>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
