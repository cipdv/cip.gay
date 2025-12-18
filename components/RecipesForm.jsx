"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createRecipe } from "@/app/_actions";

const initialState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-disabled={pending}
      className="btn border border-black rounded-none"
    >
      {pending ? "Saving..." : "Save recipe"}
    </button>
  );
}

const RecipesForm = () => {
  const [state, formAction] = useActionState(createRecipe, initialState);

  return (
    <form action={formAction}>
      <div className="flex flex-col space-y-3 border border-black p-4 rounded-none">
        <label htmlFor="title" className="font-semibold">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          className="border border-black p-2 rounded-none bg-transparent"
        />

        <label htmlFor="recipe" className="font-semibold">
          Recipe
        </label>
        <textarea
          id="recipe"
          name="recipe"
          required
          className="border border-black p-2 rounded-none bg-transparent h-32"
        />

        <div className="flex items-center gap-4">
          <SubmitButton />
          {state?.message && <p className="text-error">{state.message}</p>}
        </div>
      </div>
    </form>
  );
};

export default RecipesForm;
