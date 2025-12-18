import Link from "next/link";
import Goals from "@/components/Goals";
import SignInForm from "@/components/SignInForm";

export default function Home() {
  return (
    <section className="flex justify-center">
      <SignInForm />
    </section>
  );
}
