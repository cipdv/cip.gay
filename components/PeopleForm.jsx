"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createPerson } from "@/app/_actions";

const initialState = { message: "", id: null };

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

const PeopleForm = () => {
  const [state, formAction] = useActionState(createPerson, initialState);
  const [open, setOpen] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.id) {
      formRef.current?.reset?.();
      setOpen(false);
    }
  }, [state]);

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="btn border border-black rounded-none"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? "Close person form" : "Add a person"}
      </button>

      {open && (
        <form action={formAction} ref={formRef}>
          <div className="flex flex-col space-y-3 border border-black p-4 rounded-none bg-white/70">
            <h2 className="font-bold text-lg">Add Person</h2>

            <label htmlFor="firstName" className="font-semibold">
              First name
            </label>
            <input
              id="firstName"
              name="firstName"
              className="border border-black p-2 rounded-none bg-transparent"
              required
            />

            <label htmlFor="lastName" className="font-semibold">
              Last name (optional)
            </label>
            <input
              id="lastName"
              name="lastName"
              className="border border-black p-2 rounded-none bg-transparent"
            />

            <label htmlFor="nickname" className="font-semibold">
              Nickname (optional)
            </label>
            <input
              id="nickname"
              name="nickname"
              className="border border-black p-2 rounded-none bg-transparent"
            />

            <label htmlFor="email" className="font-semibold">
              Email (optional)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="border border-black p-2 rounded-none bg-transparent"
            />

            <label htmlFor="phone" className="font-semibold">
              Phone (optional)
            </label>
            <input
              id="phone"
              name="phone"
              className="border border-black p-2 rounded-none bg-transparent"
            />

            <label htmlFor="birthday" className="font-semibold">
              Birthday (optional)
            </label>
            <input
              id="birthday"
              name="birthday"
              type="date"
              className="border border-black p-2 rounded-none bg-transparent"
            />

            <div className="flex items-center gap-4">
              <SubmitButton />
              <span className="text-red-700 text-sm">{state?.message}</span>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default PeopleForm;
