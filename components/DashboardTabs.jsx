"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  createTask,
  updateTask,
  deleteTask,
  upsertJournalEntry,
  createDream,
} from "@/app/_actions";

function SubmitButton({ children }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn border border-black"
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
  const [tab, setTab] = useState("tasks"); // tasks | journal | dreams
  const [editingId, setEditingId] = useState(null);

  const today = new Date().toISOString().slice(0, 10);

  const tasks = useMemo(() => {
    const arr = Array.isArray(initialTasks) ? initialTasks : [];
    return arr
      .filter((t) => t.status !== "completed")
      .sort((a, b) => {
        const ad = a.scheduled_for
          ? new Date(a.scheduled_for).getTime()
          : Infinity;
        const bd = b.scheduled_for
          ? new Date(b.scheduled_for).getTime()
          : Infinity;
        if (ad !== bd) return ad - bd;

        const ac = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bc = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bc - ac;
      });
  }, [initialTasks]);

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
            <form action={createTask} className="border border-black p-4 mb-6">
              <h2 className="font-bold mb-3">New task</h2>

              <div className="grid gap-3">
                <input
                  name="title"
                  placeholder="Task title"
                  className="border border-black p-2"
                  required
                />

                <input
                  name="scheduledFor"
                  type="date"
                  defaultValue={today}
                  className="border border-black p-2"
                />

                <textarea
                  name="details"
                  placeholder="Details (optional)"
                  className="border border-black p-2"
                  rows={3}
                />

                <SubmitButton>Create task</SubmitButton>
              </div>
            </form>

            {/* Upcoming tasks list */}
            <div className="border border-black p-4">
              <h2 className="font-bold mb-3">Upcoming tasks</h2>

              {tasks.length === 0 ? (
                <p>No upcoming tasks.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {tasks.map((t) => {
                    const isEditing = editingId === t.id;
                    const scheduledDate = formatDateOnly(t.scheduled_for);

                    return (
                      <li key={t.id} className="border border-black p-3">
                        {!isEditing ? (
                          <div className="flex justify-between gap-4">
                            <div>
                              <div className="font-bold">{t.title}</div>
                              {scheduledDate && (
                                <div className="text-sm">
                                  Scheduled: {scheduledDate}
                                </div>
                              )}
                              {t.details && (
                                <div className="text-sm mt-2">{t.details}</div>
                              )}
                            </div>

                            <div className="flex gap-2 items-start">
                              {/* Complete (no inline server action; uses exported updateTask) */}
                              <form action={updateTask}>
                                <input
                                  type="hidden"
                                  name="taskId"
                                  value={t.id}
                                />
                                <input
                                  type="hidden"
                                  name="status"
                                  value="completed"
                                />
                                <SubmitButton>Complete</SubmitButton>
                              </form>

                              <button
                                type="button"
                                className="btn border border-black"
                                onClick={() => setEditingId(t.id)}
                              >
                                Edit
                              </button>

                              {/* Delete (deleteTask takes taskId param, so bind it) */}
                              <form action={deleteTask.bind(null, t.id)}>
                                <button
                                  type="submit"
                                  className="btn border border-black"
                                >
                                  Delete
                                </button>
                              </form>
                            </div>
                          </div>
                        ) : (
                          <form action={updateTask} className="grid gap-3">
                            <input type="hidden" name="taskId" value={t.id} />

                            <input
                              name="title"
                              defaultValue={t.title}
                              className="border border-black p-2"
                            />

                            <input
                              name="scheduledFor"
                              type="date"
                              defaultValue={scheduledDate || ""}
                              className="border border-black p-2"
                            />

                            <textarea
                              name="details"
                              defaultValue={t.details || ""}
                              className="border border-black p-2"
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
          </div>
        )}

        {tab === "journal" && (
          <div className="border border-black p-4">
            <h2 className="font-bold mb-3">Today’s journal</h2>

            <form action={upsertJournalEntry} className="grid gap-3">
              <input
                type="date"
                name="entryDate"
                defaultValue={today}
                className="border border-black p-2"
              />

              <select
                name="privacy"
                className="border border-black p-2"
                defaultValue="private"
              >
                <option value="private">private</option>
                <option value="public">public</option>
              </select>

              <input
                name="moodStart"
                placeholder="Mood (start)"
                className="border border-black p-2"
              />
              <input
                name="moodEnd"
                placeholder="Mood (end)"
                className="border border-black p-2"
              />

              <textarea
                name="reflections"
                placeholder="Reflections"
                className="border border-black p-2"
                rows={6}
              />

              <textarea
                name="lessonLearned"
                placeholder="Lesson learned"
                className="border border-black p-2"
                rows={3}
              />

              <SubmitButton>Save journal</SubmitButton>
            </form>
          </div>
        )}

        {tab === "dreams" && (
          <div className="border border-black p-4">
            <h2 className="font-bold mb-3">Tell me last night’s dream…</h2>

            <form action={createDream} className="grid gap-3">
              <input
                type="date"
                name="dreamDate"
                defaultValue={today}
                className="border border-black p-2"
              />

              <textarea
                name="dream"
                placeholder="text area to write dreams"
                className="border border-black p-2"
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
