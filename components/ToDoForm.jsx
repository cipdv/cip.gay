"use client";

import { submitNewTodo } from "@/app/_actions";
import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";

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

const ToDoForm = () => {
  const [state, formAction] = useFormState(submitNewTodo, initialState);

  const formRef = useRef(null);

  useEffect(() => {
    if (state?.message === "To-do submitted" && formRef.current) {
      formRef.current.reset();
    }
  }, [state]);

  //how do I clear this form after submission?

  return (
    <form ref={formRef} action={formAction}>
      {" "}
      <div className="flex flex-col space-y-4 glassmorphism">
        <label>To-Do</label>
        <textarea name="todo" className="p-1 bg-textarea h-18" />
        <label>Notes</label>
        <textarea name="notes" className="p-1 bg-textarea h-24" />
        <label>Deadline</label>
        <input
          type="date"
          name="deadline"
          className="p-1 bg-textarea w-32"
        />{" "}
        <div className="flex items-center">
          <SubmitButton />
          <h2 className="text-error ml-4">{state?.message}</h2>
        </div>
      </div>
    </form>
  );
};

export default ToDoForm;
