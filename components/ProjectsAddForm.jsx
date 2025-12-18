"use client";

import { createProject } from "@/app/_actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

const initialState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" aria-disabled={pending} className="btn w-32 border border-black rounded-none">
      {pending ? "Submitting..." : "Submit"}
    </button>
  );
}

const ProjectsAddForm = () => {
  const [state, formAction] = useActionState(createProject, initialState);

  return (
    <form action={formAction}>
      <div className="flex flex-col space-y-4 border border-black p-4 rounded-none">
        <label htmlFor="title" className="font-semibold">Project</label>
        <input
          id="title"
          name="title"
          className="border border-black p-2 rounded-none bg-transparent"
          required
        />
        <label htmlFor="details" className="font-semibold">Details</label>
        <textarea
          id="details"
          name="details"
          className="border border-black p-2 rounded-none bg-transparent h-24"
        />
        <div className="flex items-center">
          <SubmitButton />
          <h2 className="text-error ml-4">{state?.message}</h2>
        </div>
      </div>
    </form>
  );
};

export default ProjectsAddForm;
