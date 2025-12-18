"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createWebsite } from "@/app/_actions";

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

const WebsiteForm = () => {
  const [state, formAction] = useActionState(createWebsite, initialState);
  const [open, setOpen] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.id) {
      formRef.current?.reset();
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
        {open ? "Close website form" : "Add a new website"}
      </button>

      {open && (
        <form action={formAction} ref={formRef}>
          <div className="flex flex-col space-y-3 border border-black p-4 rounded-none bg-white/70">
            <h2 className="font-bold text-lg">Add Website</h2>

            <label htmlFor="title" className="font-semibold">
              Title
            </label>
            <input
              id="title"
              name="title"
              className="border border-black p-2 rounded-none bg-transparent"
              required
            />

            <label htmlFor="link" className="font-semibold">
              Link (optional)
            </label>
            <input
              id="link"
              name="link"
              className="border border-black p-2 rounded-none bg-transparent"
            />

            <label htmlFor="host" className="font-semibold">
              Host (optional)
            </label>
            <input
              id="host"
              name="host"
              className="border border-black p-2 rounded-none bg-transparent"
            />

            <label htmlFor="domainHost" className="font-semibold">
              Domain host (optional)
            </label>
            <input
              id="domainHost"
              name="domainHost"
              className="border border-black p-2 rounded-none bg-transparent"
            />

            <label htmlFor="projectId" className="font-semibold">
              Project ID (optional)
            </label>
            <input
              id="projectId"
              name="projectId"
              className="border border-black p-2 rounded-none bg-transparent"
              placeholder="UUID of project"
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
      )}
    </div>
  );
};

export default WebsiteForm;
