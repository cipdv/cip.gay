"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createWebsiteTask,
  deleteWebsite,
  deleteWebsiteTask,
  updateWebsite,
  updateWebsiteTask,
} from "@/app/_actions";

const formatDate = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

const formatDateInput = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

const WebsitesList = ({ websites, tasks }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState(null);
  const [addingFor, setAddingFor] = useState(null);
  const [editingWebsiteId, setEditingWebsiteId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [showCompletedFor, setShowCompletedFor] = useState({});

  const tasksBySite = useMemo(() => {
    const map = {};
    (tasks || []).forEach((t) => {
      const key = t.website_id;
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks]);

  if (!websites?.length) {
    return <p className="mt-4">No websites yet.</p>;
  }

  const handleUpdateWebsite = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await updateWebsite(null, formData);
      setEditingWebsiteId(null);
      router.refresh();
    });
  };

  const handleDelete = (event) => {
    event.preventDefault();
    if (
      typeof window !== "undefined" &&
      !window.confirm("Delete this website? This will remove its tasks too.")
    ) {
      return;
    }
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await deleteWebsite(formData);
      setEditingWebsiteId(null);
      router.refresh();
    });
  };

  const handleAddTask = (event, siteId) => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const formData = new FormData(formEl);
    formData.set("websiteId", siteId);
    startTransition(async () => {
      await createWebsiteTask(null, formData);
      setAddingFor(null);
      formEl?.reset?.();
      router.refresh();
    });
  };

  const handleCompleteTask = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await updateWebsiteTask(null, formData);
      setEditingTaskId(null);
      router.refresh();
    });
  };

  const handleUpdateTask = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await updateWebsiteTask(null, formData);
      setEditingTaskId(null);
      router.refresh();
    });
  };

  const handleDeleteTask = (event) => {
    event.preventDefault();
    if (
      typeof window !== "undefined" &&
      !window.confirm("Delete this website task?")
    ) {
      return;
    }
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await deleteWebsiteTask(formData);
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <h2 className="font-bold text-lg">Websites</h2>
      {websites.map((site) => {
        const siteTasks = tasksBySite[site.id] || [];
        const expanded = expandedId === site.id;
        const showAdd = addingFor === site.id;
        const editingWebsite = editingWebsiteId === site.id;

        return (
          <div
            key={site.id}
            className="border border-black rounded-none p-3 bg-white/70"
          >
            {editingWebsite ? (
              <form
                onSubmit={handleUpdateWebsite}
                className="grid gap-3 border border-black p-3 rounded-none bg-white/70"
              >
                <input type="hidden" name="id" value={site.id} />

                <label className="font-semibold" htmlFor={`site-title-${site.id}`}>
                  Title
                </label>
                <input
                  id={`site-title-${site.id}`}
                  name="title"
                  defaultValue={site.title || ""}
                  className="border border-black p-2 rounded-none bg-transparent"
                  required
                />

                <label className="font-semibold" htmlFor={`site-link-${site.id}`}>
                  Link (optional)
                </label>
                <input
                  id={`site-link-${site.id}`}
                  name="link"
                  defaultValue={site.link || ""}
                  className="border border-black p-2 rounded-none bg-transparent"
                />

                <label className="font-semibold" htmlFor={`site-host-${site.id}`}>
                  Host (optional)
                </label>
                <input
                  id={`site-host-${site.id}`}
                  name="host"
                  defaultValue={site.host || ""}
                  className="border border-black p-2 rounded-none bg-transparent"
                />

                <label
                  className="font-semibold"
                  htmlFor={`site-domain-${site.id}`}
                >
                  Domain host (optional)
                </label>
                <input
                  id={`site-domain-${site.id}`}
                  name="domainHost"
                  defaultValue={site.domain_host || ""}
                  className="border border-black p-2 rounded-none bg-transparent"
                />

                <label
                  className="font-semibold"
                  htmlFor={`site-project-${site.id}`}
                >
                  Project ID (optional)
                </label>
                <input
                  id={`site-project-${site.id}`}
                  name="projectId"
                  defaultValue={site.project_id || ""}
                  className="border border-black p-2 rounded-none bg-transparent"
                  placeholder="UUID of project"
                />

                <label
                  className="font-semibold"
                  htmlFor={`site-details-${site.id}`}
                >
                  Details (optional)
                </label>
                <textarea
                  id={`site-details-${site.id}`}
                  name="details"
                  defaultValue={site.details || ""}
                  className="border border-black p-2 rounded-none bg-transparent h-24"
                />

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="btn border border-black rounded-none"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="border border-black rounded-none px-4"
                    onClick={() => setEditingWebsiteId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-between gap-4 items-start">
                <button
                  type="button"
                  className="min-w-0 text-left space-y-1 break-words flex-1"
                  onClick={() =>
                    setExpandedId((prev) => (prev === site.id ? null : site.id))
                  }
                >
                  <div className="font-bold break-words">{site.title}</div>
                  {site.link && (
                    <div className="text-blue-700 underline break-words">
                      <a href={site.link} target="_blank" rel="noreferrer">
                        {site.link.replace(/^https?:\/\//i, "")}
                      </a>
                    </div>
                  )}
                  {site.details && (
                    <div className="text-sm break-words">{site.details}</div>
                  )}
                </button>

                <div className="flex-shrink-0 flex flex-col gap-2">
                  <button
                    type="button"
                    className="border border-black rounded-none p-2 w-10 h-10 hover:bg-[#e0e5c7]"
                    aria-label="Edit website"
                    title="Edit website"
                    onClick={() => {
                      setExpandedId(site.id);
                      setEditingWebsiteId(site.id);
                    }}
                  >
                    <i
                      className="fa-regular fa-pen-to-square"
                      aria-hidden="true"
                    ></i>
                  </button>
                  <form onSubmit={handleDelete}>
                    <input type="hidden" name="id" value={site.id} />
                    <button
                      type="submit"
                      className="border border-black rounded-none p-2 w-10 h-10 hover:bg-[#e0e5c7]"
                      aria-label="Delete website"
                      title="Delete website"
                    >
                      <i className="fa-solid fa-trash-can" aria-hidden="true"></i>
                    </button>
                  </form>
                </div>
              </div>
            )}

            {expanded && !editingWebsite && (
              <div className="mt-3 space-y-3">
                <div className="text-sm">
                  {site.host && <div>Host: {site.host}</div>}
                  {site.domain_host && <div>Domain: {site.domain_host}</div>}
                  {site.created_at && (
                    <div className="text-xs text-gray-700 mt-1">
                      Created: {formatDate(site.created_at)}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 justify-between">
                  <h3 className="font-semibold">Tasks</h3>
                  <button
                    type="button"
                    className="btn border border-black rounded-none"
                    onClick={() =>
                      setAddingFor((prev) =>
                        prev === site.id ? null : site.id
                      )
                    }
                  >
                    {showAdd ? "Close task form" : "Add task"}
                  </button>
                </div>

                {showAdd && (
                  <form
                    onSubmit={(e) => handleAddTask(e, site.id)}
                    className="border border-black p-3 rounded-none bg-white/70 grid gap-3"
                  >
                    <input type="hidden" name="websiteId" value={site.id} />

                    <label className="font-semibold" htmlFor={`title-${site.id}`}>
                      Title
                    </label>
                    <input
                      id={`title-${site.id}`}
                      name="title"
                      className="border border-black p-2 rounded-none bg-transparent"
                      required
                    />

                    <label className="font-semibold" htmlFor={`due-${site.id}`}>
                      Due date (optional)
                    </label>
                    <input
                      id={`due-${site.id}`}
                      name="dueDate"
                      type="date"
                      className="border border-black p-2 rounded-none bg-transparent"
                    />

                    <label className="font-semibold" htmlFor={`details-${site.id}`}>
                      Details (optional)
                    </label>
                    <textarea
                      id={`details-${site.id}`}
                      name="details"
                      className="border border-black p-2 rounded-none bg-transparent h-24"
                    />

                    <button
                      type="submit"
                      className="btn border border-black rounded-none"
                    >
                      Submit
                    </button>
                  </form>
                )}

                {siteTasks.length === 0 ? (
                  <p className="text-sm">No tasks yet.</p>
                ) : (
                  <div className="space-y-2">
                    {siteTasks
                      .filter(
                        (task) =>
                          task.status === "active" ||
                          showCompletedFor[site.id] === true
                      )
                      .map((task) => {
                        const editingTask = editingTaskId === task.id;

                        return (
                          <div
                            key={task.id}
                            className="border border-black rounded-none p-3 bg-white/70"
                          >
                            {editingTask ? (
                              <form
                                onSubmit={handleUpdateTask}
                                className="grid gap-3"
                              >
                                <input type="hidden" name="id" value={task.id} />
                                <input
                                  type="hidden"
                                  name="websiteId"
                                  value={site.id}
                                />

                                <label
                                  className="font-semibold"
                                  htmlFor={`task-title-${task.id}`}
                                >
                                  Title
                                </label>
                                <input
                                  id={`task-title-${task.id}`}
                                  name="title"
                                  defaultValue={task.title || ""}
                                  className="border border-black p-2 rounded-none bg-transparent"
                                  required
                                />

                                <label
                                  className="font-semibold"
                                  htmlFor={`task-due-${task.id}`}
                                >
                                  Due date (optional)
                                </label>
                                <input
                                  id={`task-due-${task.id}`}
                                  name="dueDate"
                                  type="date"
                                  defaultValue={formatDateInput(task.due_date)}
                                  className="border border-black p-2 rounded-none bg-transparent"
                                />

                                <label
                                  className="font-semibold"
                                  htmlFor={`task-details-${task.id}`}
                                >
                                  Details (optional)
                                </label>
                                <textarea
                                  id={`task-details-${task.id}`}
                                  name="details"
                                  defaultValue={task.details || ""}
                                  className="border border-black p-2 rounded-none bg-transparent h-24"
                                />

                                <div className="flex gap-2">
                                  <button
                                    type="submit"
                                    className="btn border border-black rounded-none"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    className="border border-black rounded-none px-4"
                                    onClick={() => setEditingTaskId(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <div className="flex justify-between gap-4 items-start">
                                <div className="min-w-0 space-y-1 break-words flex-1">
                                  <div className="font-bold break-words">
                                    {task.title}
                                  </div>
                                  {task.due_date && (
                                    <div className="text-sm">
                                      Due: {formatDate(task.due_date)}
                                    </div>
                                  )}
                                  {task.details && (
                                    <div
                                      className="text-sm break-words"
                                      dangerouslySetInnerHTML={{
                                        __html: task.details.replace(
                                          /\n/g,
                                          "<br />"
                                        ),
                                      }}
                                    />
                                  )}
                                  {task.created_at && (
                                    <div className="text-xs text-gray-700">
                                      Created: {formatDate(task.created_at)}
                                    </div>
                                  )}
                                  {task.status === "completed" &&
                                    task.completed_at && (
                                      <div className="text-xs text-gray-700">
                                        Completed:{" "}
                                        {formatDate(task.completed_at)}
                                      </div>
                                    )}
                                </div>

                                <div className="flex-shrink-0 flex items-stretch gap-2">
                                  {task.status !== "completed" ? (
                                    <form
                                      className="flex"
                                      onSubmit={handleCompleteTask}
                                    >
                                      <input
                                        type="hidden"
                                        name="id"
                                        value={task.id}
                                      />
                                      <input
                                        type="hidden"
                                        name="status"
                                        value="completed"
                                      />
                                      <button
                                        type="submit"
                                        className="btn border border-black rounded-none h-full min-w-[6.75rem]"
                                      >
                                        Complete
                                      </button>
                                    </form>
                                  ) : (
                                    <div className="text-sm self-center min-w-[6.75rem] text-center">
                                      Completed
                                    </div>
                                  )}

                                  <div className="flex flex-col gap-2 h-full">
                                    <button
                                      type="button"
                                      className="border border-black rounded-none p-2 w-10 flex-1 min-h-10 hover:bg-[#e0e5c7]"
                                      aria-label="Edit task"
                                      title="Edit task"
                                      onClick={() => setEditingTaskId(task.id)}
                                    >
                                      <i
                                        className="fa-regular fa-pen-to-square"
                                        aria-hidden="true"
                                      ></i>
                                    </button>
                                    <form
                                      className="flex-1"
                                      onSubmit={handleDeleteTask}
                                    >
                                      <input
                                        type="hidden"
                                        name="id"
                                        value={task.id}
                                      />
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
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm underline"
                    onClick={() =>
                      setShowCompletedFor((prev) => ({
                        ...prev,
                        [site.id]: !prev[site.id],
                      }))
                    }
                  >
                    {showCompletedFor[site.id] ? "Hide completed" : "Show completed"}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WebsitesList;
