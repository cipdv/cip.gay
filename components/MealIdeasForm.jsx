"use client";

import { createMealIdea } from "@/app/_actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

const initialState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" aria-disabled={pending} className="btn w-32">
      {pending ? "Submitting..." : "Submit"}
    </button>
  );
}

const MealIdeasForm = () => {
  const [state, formAction] = useActionState(createMealIdea, initialState);

  //how do I clear this form after submission?

  return (
    <form action={formAction}>
      <div className="flex flex-col space-y-4 border border-black p-4 rounded-none bg-transparent">
        <label htmlFor="idea" className="font-semibold">
          Meal idea
        </label>
        <textarea
          id="idea"
          name="idea"
          className="border border-black p-2 rounded-none bg-transparent h-18"
          required
        />
        <label htmlFor="notes" className="font-semibold">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          className="border border-black p-2 rounded-none bg-transparent h-24"
        />
        <div className="flex items-center gap-4">
          <SubmitButton />
          <h2 className="text-error ml-4">{state?.message}</h2>
        </div>
      </div>
    </form>
  );
};

export default MealIdeasForm;
