"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteDream } from "@/app/_actions";

const formatDate = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

function splitDreamContent(text) {
  if (!text) return { title: "", body: "" };
  const parts = String(text).split(/\n\s*\n/);
  const title = (parts[0] || "").trim();
  const body = parts.slice(1).join("\n\n").trim();
  return { title, body };
}

const DreamsList = ({ dreams }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState(null);

  if (!dreams?.length) {
    return <p className="mt-4">No dreams saved yet.</p>;
  }

  const handleDelete = (event) => {
    event.preventDefault();
    if (
      typeof window !== "undefined" &&
      !window.confirm("Delete this dream?")
    ) {
      return;
    }
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await deleteDream(formData);
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      {dreams.map((dream) => {
        const { title, body } = splitDreamContent(dream.dream);
        const isOpen = expandedId === dream.id;
        const displayTitle =
          title || (body ? body.split("\n")[0].slice(0, 80) : "Untitled");

        return (
          <div
            key={dream.id}
            className="border border-black rounded-none p-3 bg-white/70"
          >
            <div className="flex justify-between gap-4 items-start">
              <button
                type="button"
                className="min-w-0 text-left space-y-1 break-words flex-1"
                onClick={() =>
                  setExpandedId((prev) => (prev === dream.id ? null : dream.id))
                }
              >
                <div className="font-semibold">
                  {formatDate(dream.dream_date || dream.created_at)}
                </div>
                <div className="font-bold break-words">{displayTitle}</div>
              </button>

              <form onSubmit={handleDelete} className="flex-shrink-0">
                <input type="hidden" name="id" value={dream.id} />
                <button
                  type="submit"
                  className="border border-black rounded-none p-2 w-10 h-10 hover:bg-[#e0e5c7]"
                  aria-label="Delete dream"
                  title="Delete dream"
                >
                  <img src="/images/icons8-eye-16.png" alt="Delete dream" />
                </button>
              </form>
            </div>

            {isOpen && (
              <div className="mt-3 space-y-2">
                {body ? (
                  <div
                    className="text-sm break-words"
                    dangerouslySetInnerHTML={{
                      __html: body.replace(/\n/g, "<br />"),
                    }}
                  />
                ) : (
                  <div className="text-sm break-words">{dream.dream}</div>
                )}
                {dream.created_at && (
                  <div className="text-xs text-gray-700">
                    Created: {formatDate(dream.created_at)}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DreamsList;
