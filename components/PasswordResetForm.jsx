"use client";

import { resetPassword } from "@/app/_actions";
import { useFormState, useFormStatus } from "react-dom";

const initialState = { message: "", success: false };

function ResetButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" aria-disabled={pending} className="btn mt-4">
      {pending ? "Resetting..." : "Reset password"}
    </button>
  );
}

export default function PasswordResetForm() {
  const [state, formAction] = useFormState(resetPassword, initialState);

  return (
    <form
      action={formAction}
      className="bg-yellow-100 p-4 rounded-md mt-6 w-full lg:w-2/5 mx-auto"
    >
      <h2 className="text-2xl font-bold mb-4">Temporary password reset</h2>
      <p className="mb-4 text-sm text-gray-800">
        Update the password for an existing user. Remove this form after use.
      </p>
      <input
        type="email"
        placeholder="Email"
        name="email"
        required
        className="block mb-4"
      />
      <input
        type="text"
        placeholder="New password"
        name="newPassword"
        required
        className="block mb-4"
      />
      {state?.message && (
        <p className={state.success ? "text-green-600" : "text-red-500"}>
          {state.message}
        </p>
      )}
      <ResetButton />
    </form>
  );
}
