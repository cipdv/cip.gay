"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createToBuy } from "@/app/_actions";

const initialState = { message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-disabled={pending}
      className="btn border border-black rounded-none"
    >
      {pending ? "Saving..." : "Save item"}
    </button>
  );
}

const ToBuyForm = () => {
  const [state, formAction] = useActionState(createToBuy, initialState);

  return (
    <form action={formAction}>
      <div className="flex flex-col space-y-3 border border-black p-4 rounded-none">
        <label htmlFor="item" className="font-semibold">
          Item
        </label>
        <input
          id="item"
          name="item"
          type="text"
          required
          className="border border-black p-2 rounded-none bg-transparent"
        />

        <label htmlFor="link" className="font-semibold">
          Link (optional)
        </label>
        <input
          id="link"
          name="link"
          type="url"
          className="border border-black p-2 rounded-none bg-transparent"
        />

        <label htmlFor="price" className="font-semibold">
          Price (optional)
        </label>
        <input
          id="price"
          name="price"
          type="number"
          step="0.01"
          className="border border-black p-2 rounded-none bg-transparent"
        />

        <label htmlFor="needOrWant" className="font-semibold">
          Need or Want
        </label>
        <select
          id="needOrWant"
          name="needOrWant"
          className="to-buy-select border border-black p-2 rounded-none bg-transparent"
          defaultValue="want"
        >
          <option value="need">Need</option>
          <option value="want">Want</option>
        </select>

        <div className="flex items-center gap-4">
          <SubmitButton />
          {state?.message && <p className="text-error">{state.message}</p>}
        </div>
      </div>
    </form>
  );
};

export default ToBuyForm;
