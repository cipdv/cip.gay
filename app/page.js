import Link from "next/link";
import Goals from "@/components/Goals";

export default function Home() {
  return (
    <div className="m-4 text-center">
      <h1>Cip's Stuff</h1>
      <Goals />
      <div className="mt-5">
        <Link href="/to-do">
          <h3>To-do</h3>
          <p>Add a deadline input</p>
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
        <Link href="/finances">
          <h3>Finances</h3>
          <p>
            How much did I spend, how much did I make, how much should I put
            away for taxes, how much can I save.
          </p>
          <p>Upload receipts.</p>
        </Link>
      </div>
      <div className="space-y-5">
        <p>
          Other stuff: workout routine, question jar questions, to
          watch/read/do, dream journal, poems/lyrics, quotes, recipes, story
          ideas. Life lessons I've learned and want to remember/share.
        </p>
        <p>
          Interactive section for friends: Events like Pride planning,
          birthdays, etc. Ask for help on things. Hear their requests. Input
          ideas for question jar.
        </p>
        <p>Quotes & notes on main page</p>
      </div>
    </div>
  );
}
