"use client";

import { createMemory } from "@/app/_actions";
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

const MemoriesForm = () => {
  const [state, formAction] = useActionState(createMemory, initialState);

  //how do I clear this form after submission?

  return (
    <form action={formAction}>
      <div className="flex flex-col space-y-4 border border-black p-4 rounded-none bg-transparent">
        <div className="flex flex-col md:flex-row md:space-x-2 space-y-4 md:space-y-0">
          <div className="w-full md:w-1/4">
            <label htmlFor="month" className="font-semibold">
              Month
            </label>
            <select
              id="month"
              name="month"
              required
              className="border border-black p-2 rounded-none bg-transparent w-full"
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
            <label htmlFor="year" className="font-semibold">
              Year
            </label>
            <input
              type="number"
              id="year"
              name="year"
              min="1900"
              max="2099"
              required
              className="border border-black p-2 rounded-none bg-transparent w-full"
            />
          </div>
          <div className="w-full md:w-1/4">
            <label htmlFor="day" className="font-semibold">
              Day
            </label>
            <input
              type="number"
              id="day"
              name="day"
              min="1"
              max="31"
              required
              className="border border-black p-2 rounded-none bg-transparent w-full"
            />
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="memory" className="font-semibold">
            Memory
          </label>
          <textarea
            id="memory"
            name="memory"
            required
            className="border border-black p-2 rounded-none bg-transparent h-36 w-full"
          ></textarea>
        </div>
        <div className="flex items-center gap-4">
          <SubmitButton />
          <h2 className="text-error ml-4">{state?.message}</h2>
        </div>
      </div>
    </form>
  );
};

export default MemoriesForm;
