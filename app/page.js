import Link from "next/link";

export default function Home() {
  return (
    <div className="m-4 text-center">
      <h1>Cip's Stuff</h1>
      <Link href="/to-do">
        <h3>To-do</h3>
      </Link>
      <Link href="/ideas">
        <h3>Ideas</h3>
      </Link>
      <Link href="/journal">
        <h3>Journal</h3>
      </Link>
      <Link href="/projects">
        <h3>Projects</h3>
      </Link>
    </div>
  );
}
