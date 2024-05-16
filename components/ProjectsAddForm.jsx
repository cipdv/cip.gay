"use client";

import { submitNewProject } from "@/app/_actions";
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

const ProjectsAddForm = () => {
  const [state, formAction] = useFormState(submitNewProject, initialState);

  //how do I clear this form after submission?

  return (
    <form action={formAction}>
      <div className="flex flex-col space-y-4 glassmorphism">
        <label>Project</label>
        <textarea name="idea" className="p-1 bg-textarea h-18" />
        <label>Notes</label>
        <textarea name="notes" className="p-1 bg-textarea h-24" />
        <label>To-do</label>
        <div className="flex items-center">
          <SubmitButton />
          <h2 className="text-error ml-4">{state?.message}</h2>
        </div>
      </div>
    </form>
  );
};

export default ProjectsAddForm;
