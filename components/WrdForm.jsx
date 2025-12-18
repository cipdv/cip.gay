"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useState } from "react";
import { createWrdItem } from "@/app/_actions";

const initialState = { message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-disabled={pending}
      className="btn border border-black rounded-none"
    >
      {pending ? "Saving..." : "Save"}
    </button>
  );
}

const WrdForm = () => {
  const [state, formAction] = useActionState(createWrdItem, initialState);
  const [category, setCategory] = useState("watch");

  const showGenre = category === "watch" || category === "read";

  return (
    <form action={formAction}>
      <div className="flex flex-col space-y-3 border border-black p-4 rounded-none">
        <label htmlFor="category" className="font-semibold">
          Category
        </label>
        <select
          id="category"
          name="category"
          className="border border-black p-2 rounded-none bg-transparent"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="watch">Watch</option>
          <option value="read">Read</option>
          <option value="do">Do</option>
          <option value="go">Go</option>
          <option value="eat">Eat</option>
        </select>

        <label htmlFor="name" className="font-semibold">
          Name
        </label>
        <input
          id="name"
          name="name"
          className="border border-black p-2 rounded-none bg-transparent"
          required
        />

        {showGenre && (
          <>
            <label htmlFor="genre" className="font-semibold">
              Genre (optional)
            </label>
            <input
              id="genre"
              name="genre"
              className="border border-black p-2 rounded-none bg-transparent"
              placeholder="e.g., sci-fi, biography"
            />
          </>
        )}

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
          {state?.message && <p className="text-error">{state.message}</p>}
        </div>
      </div>
    </form>
  );
};

export default WrdForm;
