"use client";

import { login, registerNewMember } from "@/app/_actions";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useState } from "react";

const initialState = {
  message: "",
};

function SubmitButton({ label }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" aria-disabled={pending} className="btn mt-4">
      {pending ? `${label}...` : label}
    </button>
  );
}

const SignInForm = () => {
  const [mode, setMode] = useState("login"); // "login" | "register"

  const [loginState, loginAction] = useFormState(login, initialState);
  const [registerState, registerAction] = useFormState(
    registerNewMember,
    initialState
  );

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-blue-100 p-4 rounded-md mt-6 w-full lg:w-2/5 mx-auto">
      <div className="flex justify-between mb-4">
        <button
          type="button"
          className={`font-bold ${mode === "login" ? "underline" : ""}`}
          onClick={() => setMode("login")}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`font-bold ${mode === "register" ? "underline" : ""}`}
          onClick={() => setMode("register")}
        >
          Register
        </button>
      </div>

      {mode === "login" && (
        <form action={loginAction}>
          <h1 className="text-2xl font-bold mb-4">Sign in</h1>

          <input
            type="email"
            placeholder="Email"
            name="email"
            required
            className="block mb-4 w-full"
          />

          <div className="flex items-center mb-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              name="password"
              required
              className="block mr-2 w-full"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-2"
            >
              {showPassword ? (
                <img src="/images/icons8-hide-16.png" alt="Hide password" />
              ) : (
                <img src="/images/icons8-eye-16.png" alt="Show password" />
              )}
            </button>
          </div>

          {loginState?.message && (
            <p className="text-red-500 font-bold">{loginState.message}</p>
          )}

          <SubmitButton label="Sign in" />
        </form>
      )}

      {mode === "register" && (
        <form action={registerAction}>
          <h1 className="text-2xl font-bold mb-4">Register</h1>

          {/* Temporary placeholders since registerNewMember expects names */}
          <input type="hidden" name="firstName" value="Cip" />
          <input type="hidden" name="lastName" value="User" />

          <input
            type="email"
            placeholder="Email"
            name="email"
            required
            className="block mb-4 w-full"
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            name="password"
            required
            className="block mb-2 w-full"
          />

          {registerState?.message && (
            <p className="text-red-500 font-bold">{registerState.message}</p>
          )}

          <SubmitButton label="Register" />
        </form>
      )}
    </div>
  );
};

export default SignInForm;

// "use client";

// import { login } from "@/app/_actions";
// import { useFormState, useFormStatus } from "react-dom";
// import Link from "next/link";
// import { useState } from "react";

// const initialState = {
//   email: "",
//   password: "",
//   message: "",
// };

// function SubmitButton() {
//   const { pending } = useFormStatus();

//   return (
//     <button type="submit" aria-disabled={pending} className="btn mt-4">
//       {pending ? "Signing in..." : "Sign in"}
//     </button>
//   );
// }

// const SignInForm = () => {
//   const [state, formAction] = useFormState(login, initialState);

//   const [showPassword, setShowPassword] = useState(false);

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   return (
//     <form
//       action={formAction}
//       className="bg-blue-100 p-4 rounded-md mt-6 w-full lg:w-2/5 mx-auto"
//     >
//       <h1 className="text-2xl font-bold mb-4">Sign in</h1>
//       <input
//         type="email"
//         placeholder="Email"
//         name="email"
//         required
//         className="block mb-4"
//       />

//       <div className="flex items-center">
//         <input
//           type={showPassword ? "text" : "password"}
//           placeholder="Password"
//           name="password"
//           required
//           className="block mr-2 "
//         />
//         <button
//           type="button"
//           onClick={togglePasswordVisibility}
//           className="ml-2"
//         >
//           {showPassword ? (
//             <img src="/images/icons8-hide-16.png" alt="Hide password" />
//           ) : (
//             <img src="/images/icons8-eye-16.png" alt="Show password" />
//           )}
//         </button>
//       </div>
//       {state?.email && (
//         <p className="text-red-500 text-lg text-bold">{state?.email}</p>
//       )}
//       {state?.password && (
//         <p className="text-red-500 text-lg text-bold">{state?.password}</p>
//       )}
//       {state?.message && (
//         <p className="text-red-500 text-lg text-bold">{state?.message}</p>
//       )}
//       <SubmitButton />

//       {/* <h2 className="mt-4 text-black">
//         <Link href="/password-reset">Forgot your password? Click here.</Link>
//       </h2> */}
//     </form>
//   );
// };

// export default SignInForm;
