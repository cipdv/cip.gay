"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createWebsiteTask } from "@/app/_actions";

const initialState = { message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-disabled={pending}
      className="btn border border-black rounded-none"
    >
      {pending ? "Submitting..." : "Submit"}
    </button>
  );
}

const WebsiteTaskForm = ({ websites }) => {
  const [state, formAction] = useActionState(createWebsiteTask, initialState);

  return (
    <form action={formAction}>
      <div className="flex flex-col space-y-3 border border-black p-4 rounded-none bg-white/70">
        <h2 className="font-bold text-lg">Add Website Task</h2>

        <label htmlFor="websiteId" className="font-semibold">
          Website
        </label>
        <select
          id="websiteId"
          name="websiteId"
          className="border border-black p-2 rounded-none bg-transparent"
          required
          defaultValue=""
        >
          <option value="" disabled>
            Select a website
          </option>
          {(websites || []).map((site) => (
            <option key={site.id} value={site.id}>
              {site.title}
            </option>
          ))}
        </select>

        <label htmlFor="title" className="font-semibold">
          Title
        </label>
        <input
          id="title"
          name="title"
          className="border border-black p-2 rounded-none bg-transparent"
          required
        />

        <label htmlFor="dueDate" className="font-semibold">
          Due date (optional)
        </label>
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          className="border border-black p-2 rounded-none bg-transparent"
        />

        <label htmlFor="details" className="font-semibold">
          Details (optional)
        </label>
        <textarea
          id="details"
          name="details"
          className="border border-black p-2 rounded-none bg-transparent h-24"
        />

        <div className="flex items-center gap-4">
          <SubmitButton />
          <span className="text-red-700 text-sm">{state?.message}</span>
        </div>
      </div>
    </form>
  );
};

export default WebsiteTaskForm;
