"use client";

import { submitNewMemory } from "@/app/_actions";
import { useFormState, useFormStatus } from "react-dom";

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

const MemoriesForm = () => {
  const [state, formAction] = useFormState(submitNewMemory, initialState);

  //how do I clear this form after submission?

  return (
    <form action={formAction}>
      <div className="flex flex-col space-y-4 glassmorphism">
        <div className="flex flex-col md:flex-row md:space-x-2 space-y-4 md:space-y-0">
          <div className="w-full md:w-1/4">
            <label htmlFor="month">Month:</label>
            <select
              id="month"
              name="month"
              required
              className="p-1 bg-textarea h-18 w-full"
            >
              <option value="">Select a month</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
          <div className="w-full md:w-1/4">
            <label htmlFor="year">Year:</label>
            <input
              type="number"
              id="year"
              name="year"
              min="1900"
              max="2099"
              required
              className="p-1 bg-textarea h-18 w-full"
            />
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="notes">Notes:</label>
          <textarea
            id="notes"
            name="notes"
            required
            className="p-1 bg-textarea h-36 w-full"
          ></textarea>
        </div>
        <SubmitButton />
        <h2 className="text-error ml-4">{state?.message}</h2>
      </div>
    </form>
  );
};

export default MemoriesForm;
