"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const formatDate = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

function DisplayRow({ idea, onMove, onDeleteSubmit, onEdit, isExpanded, onToggle }) {
  return (
    <div className="border border-black rounded-none p-3 bg-white/70">
      <div className="flex justify-between gap-4 items-start">
        <button
          type="button"
          className="min-w-0 text-left space-y-2 flex-1 break-words"
          onClick={onToggle}
        >
          <h3
            className="font-semibold break-words"
            dangerouslySetInnerHTML={{
              __html: idea?.idea ? idea.idea.replace(/\n/g, "<br />") : "",
            }}
          />
          <div className="text-xs text-gray-700">
            {idea?.created_at ? formatDate(idea.created_at) : ""}
          </div>
          {isExpanded && idea?.details && (
            <p
              className="text-sm break-words"
              dangerouslySetInnerHTML={{
                __html: idea.details.replace(/\n/g, "<br />"),
              }}
            />
          )}
        </button>

        <div className="flex-shrink-0 flex items-stretch gap-2">
          <div className="flex">
            <button
              type="button"
              className="btn border border-black rounded-none h-full"
              onClick={onMove}
            >
              Move to
            </button>
          </div>

          <div className="flex flex-col gap-2 h-full">
            <form action={onDeleteSubmit} className="flex-1">
              <input type="hidden" name="id" value={idea.id} />
              <button
                type="submit"
                className="border border-black rounded-none p-2 w-full h-full hover:bg-[#e0e5c7] flex items-center justify-center"
                aria-label="Delete idea"
                title="Delete idea"
              >
                <img src="/images/icons8-eye-16.png" alt="Delete idea" />
              </button>
            </form>
            <button
              type="button"
              className="border border-black rounded-none p-2 w-full h-full hover:bg-[#e0e5c7] flex items-center justify-center"
              aria-label="Edit idea"
              title="Edit idea"
              onClick={onEdit}
            >
              <img src="/images/icons8-hide-16.png" alt="Edit idea" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditRow({ idea, onUpdateSubmit, onCancel }) {
  return (
    <div className="border border-black rounded-none p-3 space-y-2 bg-white/70">
      <form onSubmit={onUpdateSubmit} className="grid gap-3">
        <input type="hidden" name="id" value={idea.id} />

        <label className="font-semibold" htmlFor={`idea-${idea.id}`}>
          Idea
        </label>
        <textarea
          id={`idea-${idea.id}`}
          name="idea"
          defaultValue={idea.idea || ""}
          className="border border-black p-2 rounded-none bg-transparent"
          rows={3}
          required
        />

        <label className="font-semibold" htmlFor={`details-${idea.id}`}>
          Details
        </label>
        <textarea
          id={`details-${idea.id}`}
          name="details"
          defaultValue={idea.details || ""}
          className="border border-black p-2 rounded-none bg-transparent"
          rows={4}
        />

        <div className="flex gap-2">
          <button
            type="submit"
            className="btn border border-black rounded-none"
            title="Update idea"
          >
            Update
          </button>
          <button
            type="button"
            className="border border-black rounded-none px-4"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const IdeasBubbles = ({ ideas, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!ideas?.length) {
    return <p className="mt-4">No ideas yet.</p>;
  }

  const handleUpdate = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await onUpdate(formData);
      setEditingId(null);
      router.refresh();
    });
  };

  const handleDelete = (event) => {
    event.preventDefault();
    if (typeof window !== "undefined" && !window.confirm("Delete this idea?")) {
      return;
    }
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await onDelete(formData);
      setEditingId(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      {ideas.map((idea) =>
        editingId === idea.id ? (
          <EditRow
            key={idea.id}
            idea={idea}
            onUpdateSubmit={handleUpdate}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <DisplayRow
            key={idea.id}
            idea={idea}
            onMove={() => alert("coming sooooon")}
            onDeleteSubmit={handleDelete}
            onEdit={() => setEditingId(idea.id)}
            isExpanded={expandedId === idea.id}
            onToggle={() =>
              setExpandedId((prev) => (prev === idea.id ? null : idea.id))
            }
          />
        )
      )}
    </div>
  );
};

export default IdeasBubbles;
