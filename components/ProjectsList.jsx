"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createTask,
  deleteTask,
  updateProject,
  updateTask,
} from "@/app/_actions";

const formatDate = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

const ProjectsList = ({ projects, tasks = [] }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState(null);
  const [addingFor, setAddingFor] = useState(null);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [showCompletedFor, setShowCompletedFor] = useState({});

  const tasksByProject = useMemo(() => {
    const map = {};
    (tasks || []).forEach((task) => {
      const key = task.project_id;
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(task);
    });
    return map;
  }, [tasks]);

  if (!projects?.length) {
    return <p className="mt-4">No projects yet.</p>;
  }

  const handleUpdateProject = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      await updateProject(null, formData);
      setEditingProjectId(null);
      router.refresh();
    });
  };

  const handleAddTask = (event, projectId) => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const formData = new FormData(formEl);
    formData.set("projectId", projectId);

    startTransition(async () => {
      await createTask(formData);
      setAddingFor(null);
      formEl?.reset?.();
      router.refresh();
    });
  };

  const handleCompleteTask = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      await updateTask(formData);
      setEditingTaskId(null);
      router.refresh();
    });
  };

  const handleUpdateTask = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      await updateTask(formData);
      setEditingTaskId(null);
      router.refresh();
    });
  };

  const handleDeleteTask = (event) => {
    event.preventDefault();
    if (typeof window !== "undefined" && !window.confirm("Delete this task?")) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await deleteTask(formData.get("taskId"));
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <h2 className="font-bold text-lg">Projects</h2>
      {projects.map((project) => {
        const projectTasks = tasksByProject[project.id] || [];
        const expanded = expandedId === project.id;
        const showAdd = addingFor === project.id;
        const editingProject = editingProjectId === project.id;
        const visibleTasks = projectTasks.filter(
          (task) =>
            task.status !== "completed" || showCompletedFor[project.id] === true
        );

        return (
          <div
            key={project.id}
            className="border border-black rounded-none p-3 bg-white/70"
          >
            {editingProject ? (
              <form
                onSubmit={handleUpdateProject}
                className="grid gap-3 border border-black p-3 rounded-none bg-white/70"
              >
                <input type="hidden" name="projectId" value={project.id} />

                <label
                  className="font-semibold"
                  htmlFor={`project-title-${project.id}`}
                >
                  Title
                </label>
                <input
                  id={`project-title-${project.id}`}
                  name="title"
                  defaultValue={project.title || ""}
                  className="border border-black p-2 rounded-none bg-transparent"
                  required
                />

                <label
                  className="font-semibold"
                  htmlFor={`project-status-${project.id}`}
                >
                  Status
                </label>
                <select
                  id={`project-status-${project.id}`}
                  name="status"
                  defaultValue={project.status || "active"}
                  className="border border-black p-2 rounded-none bg-transparent"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>

                <label
                  className="font-semibold"
                  htmlFor={`project-details-${project.id}`}
                >
                  Details
                </label>
                <textarea
                  id={`project-details-${project.id}`}
                  name="details"
                  defaultValue={project.details || ""}
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
                    onClick={() => setEditingProjectId(null)}
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
                    setExpandedId((prev) =>
                      prev === project.id ? null : project.id
                    )
                  }
                >
                  <div className="font-bold break-words">{project.title}</div>
                  {project.details && (
                    <div
                      className="text-sm break-words"
                      dangerouslySetInnerHTML={{
                        __html: project.details.replace(/\n/g, "<br />"),
                      }}
                    />
                  )}
                </button>

                <div className="flex-shrink-0 flex flex-col gap-2">
                  <button
                    type="button"
                    className="border border-black rounded-none p-2 w-10 h-10 hover:bg-[#e0e5c7]"
                    aria-label="Edit project"
                    title="Edit project"
                    onClick={() => {
                      setExpandedId(project.id);
                      setEditingProjectId(project.id);
                    }}
                  >
                    <i
                      className="fa-regular fa-pen-to-square"
                      aria-hidden="true"
                    ></i>
                  </button>
                </div>
              </div>
            )}

            {expanded && !editingProject && (
              <div className="mt-3 space-y-3">
                <div className="text-sm">
                  <div>Status: {project.status || "active"}</div>
                  {project.created_at && (
                    <div className="text-xs text-gray-700 mt-1">
                      Created: {formatDate(project.created_at)}
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
                        prev === project.id ? null : project.id
                      )
                    }
                  >
                    {showAdd ? "Close task form" : "Add task"}
                  </button>
                </div>

                {showAdd && (
                  <form
                    onSubmit={(event) => handleAddTask(event, project.id)}
                    className="border border-black p-3 rounded-none bg-white/70 grid gap-3"
                  >
                    <input type="hidden" name="projectId" value={project.id} />

                    <label
                      className="font-semibold"
                      htmlFor={`task-title-${project.id}`}
                    >
                      Title
                    </label>
                    <input
                      id={`task-title-${project.id}`}
                      name="title"
                      className="border border-black p-2 rounded-none bg-transparent"
                      required
                    />

                    <label
                      className="font-semibold"
                      htmlFor={`task-due-${project.id}`}
                    >
                      Due date (optional)
                    </label>
                    <input
                      id={`task-due-${project.id}`}
                      name="dueDate"
                      type="date"
                      className="border border-black p-2 rounded-none bg-transparent"
                    />

                    <label
                      className="font-semibold"
                      htmlFor={`task-details-${project.id}`}
                    >
                      Details (optional)
                    </label>
                    <textarea
                      id={`task-details-${project.id}`}
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

                {projectTasks.length === 0 ? (
                  <p className="text-sm">No tasks yet.</p>
                ) : (
                  <div className="space-y-2">
                    {visibleTasks.map((task) => {
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
                              <input
                                type="hidden"
                                name="taskId"
                                value={task.id}
                              />
                              <input
                                type="hidden"
                                name="projectId"
                                value={project.id}
                              />

                              <label
                                className="font-semibold"
                                htmlFor={`edit-task-title-${task.id}`}
                              >
                                Title
                              </label>
                              <input
                                id={`edit-task-title-${task.id}`}
                                name="title"
                                defaultValue={task.title || ""}
                                className="border border-black p-2 rounded-none bg-transparent"
                                required
                              />

                              <label
                                className="font-semibold"
                                htmlFor={`edit-task-due-${task.id}`}
                              >
                                Due date (optional)
                              </label>
                              <input
                                id={`edit-task-due-${task.id}`}
                                name="dueDate"
                                type="date"
                                defaultValue={formatDate(task.due_date)}
                                className="border border-black p-2 rounded-none bg-transparent"
                              />

                              <label
                                className="font-semibold"
                                htmlFor={`edit-task-details-${task.id}`}
                              >
                                Details (optional)
                              </label>
                              <textarea
                                id={`edit-task-details-${task.id}`}
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
                                  <div className="text-sm break-words whitespace-pre-wrap">
                                    {task.details}
                                  </div>
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
                                      name="taskId"
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
                                      name="taskId"
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
                        [project.id]: !prev[project.id],
                      }))
                    }
                  >
                    {showCompletedFor[project.id]
                      ? "Hide completed"
                      : "Show completed"}
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

export default ProjectsList;
