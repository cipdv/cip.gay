"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { upsertJournalEntry } from "@/app/_actions";

const initialState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-disabled={pending}
      className="btn w-32 border border-black rounded-none"
    >
      {pending ? "Submitting..." : "Submit"}
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

const JournalForm = () => {
  const [state, formAction] = useActionState(
    upsertJournalEntry,
    initialState
  );
  const today = formatDateOnly(new Date());

  return (
    <form action={formAction}>
      <div className="flex flex-col space-y-4 border border-black p-4 rounded-none bg-transparent">
        <label htmlFor="entryDate">Entry date</label>
        <input
          id="entryDate"
          type="date"
          name="entryDate"
          defaultValue={today}
          className="border border-black p-2 rounded-none bg-transparent"
        />

        <label htmlFor="reflections">Reflections</label>
        <textarea
          id="reflections"
          name="reflections"
          className="border border-black p-2 rounded-none bg-transparent h-60"
        />

        <label htmlFor="exercise">Exercise</label>
        <input
          id="exercise"
          name="exercise"
          className="border border-black p-2 rounded-none bg-transparent"
        />

        <label htmlFor="food">Food</label>
        <input
          id="food"
          name="food"
          className="border border-black p-2 rounded-none bg-transparent"
        />

        <label htmlFor="lessonLearned">Lesson learned</label>
        <textarea
          id="lessonLearned"
          name="lessonLearned"
          className="border border-black p-2 rounded-none bg-transparent h-32"
        />

        <div className="flex items-center">
          <SubmitButton />
          <h2 className="text-error ml-4">{state?.message}</h2>
        </div>
      </div>
    </form>
  );
};

export default JournalForm;
