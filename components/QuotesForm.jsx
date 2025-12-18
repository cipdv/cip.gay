"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createQuote } from "@/app/_actions";

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
      {pending ? "Saving..." : "Save quote"}
    </button>
  );
}

const QuotesForm = () => {
  const [state, formAction] = useActionState(createQuote, initialState);

  return (
    <form action={formAction}>
      <div className="flex flex-col space-y-3 border border-black p-4 rounded-none">
        <label htmlFor="quote" className="font-semibold">
          Quote
        </label>
        <textarea
          id="quote"
          name="quote"
          required
          className="border border-black p-2 rounded-none bg-transparent h-24"
        />

        <label htmlFor="author" className="font-semibold">
          Author (optional)
        </label>
        <input
          id="author"
          name="author"
          type="text"
          className="border border-black p-2 rounded-none bg-transparent"
        />

        <div className="flex items-center gap-4">
          <SubmitButton />
          {state?.message && <p className="text-error">{state.message}</p>}
        </div>
      </div>
    </form>
  );
};

export default QuotesForm;
