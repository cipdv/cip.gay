"use client";

import { useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { updateWebsiteTask, deleteWebsiteTask } from "@/app/_actions";

const formatDate = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

const WebsiteTasksList = ({ tasks, websites }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const siteLookup = useMemo(() => {
    const map = {};
    (websites || []).forEach((w) => {
      map[w.id] = w.title;
    });
    return map;
  }, [websites]);

  if (!tasks?.length) {
    return <p className="mt-4">No website tasks yet.</p>;
  }

  const handleComplete = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await updateWebsiteTask(null, formData);
      router.refresh();
    });
  };

  const handleDelete = (event) => {
    event.preventDefault();
    if (typeof window !== "undefined" && !window.confirm("Delete this website task?")) {
      return;
    }
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await deleteWebsiteTask(formData);
      router.refresh();
    });
  };

  const activeTasks = tasks.filter((t) => t.status === "active");
  if (!activeTasks.length) return <p className="mt-4">No website tasks yet.</p>;

  return (
    <div className="space-y-3">
      <h2 className="font-bold text-lg">Website Tasks</h2>
      {activeTasks.map((task) => (
        <div
          key={task.id}
          className="border border-black rounded-none p-3 bg-white/70 flex justify-between gap-4 items-start"
        >
          <div className="min-w-0 space-y-1 break-words flex-1">
            <div className="font-bold break-words">{task.title}</div>
            {task.website_id && (
              <div className="text-sm">
                Site: {siteLookup[task.website_id] || task.website_id}
              </div>
            )}
            {task.due_date && (
              <div className="text-sm">Due: {formatDate(task.due_date)}</div>
            )}
            {task.details && (
              <div
                className="text-sm break-words"
                dangerouslySetInnerHTML={{
                  __html: task.details.replace(/\n/g, "<br />"),
                }}
              />
            )}
            {task.created_at && (
              <div className="text-xs text-gray-700">
                Created: {formatDate(task.created_at)}
              </div>
            )}
          </div>

          <div className="flex-shrink-0 flex items-stretch gap-2">
            <form className="flex" onSubmit={handleComplete}>
              <input type="hidden" name="id" value={task.id} />
              <input type="hidden" name="status" value="completed" />
              <button
                type="submit"
                className="btn border border-black rounded-none h-full"
              >
                Complete
              </button>
            </form>

            <form className="flex-1" onSubmit={handleDelete}>
              <input type="hidden" name="id" value={task.id} />
              <button
                type="submit"
                className="border border-black rounded-none p-2 w-10 h-full hover:bg-[#e0e5c7]"
                aria-label="Delete task"
                title="Delete task"
              >
                <img src="/images/icons8-eye-16.png" alt="Delete task" />
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WebsiteTasksList;
