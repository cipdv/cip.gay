import DashboardTabs from "@/components/DashboardTabs";
import { getTasks, getQuotes } from "@/app/_actions";

const DashboardPage = async () => {
  const today = new Date().toISOString().slice(0, 10);
  const tasks = await getTasks({ from: today });
  const quotes = await getQuotes();
  const randomQuote =
    Array.isArray(quotes) && quotes.length > 0
      ? quotes[Math.floor(Math.random() * quotes.length)]
      : null;

  return (
    <section className="px-10 py-8">
      {/* Quote section (placeholder like your mock) */}
      <div className="border border-black p-6 mb-8">
        <p className="text-center text-lg">
          {randomQuote?.quote || "No quotes yet."}
        </p>
        <p className="text-center mt-4">
          {randomQuote?.author ? `- ${randomQuote.author}` : ""}
        </p>
      </div>

      <DashboardTabs initialTasks={tasks || []} />
    </section>
  );
};

export default DashboardPage;

// import DashboardLinks from "@/components/DashboardLinks";
// import React from "react";
// import Goals from "@/components/Goals";
// import Upcoming from "@/components/Upcoming";
// import Quotes from "@/components/Quotes";
// import Notes from "@/components/Notes";
// import { getAllJournalEntries, getAllTodos } from "@/app/_actions";

// const dashboardPage = async () => {
//   const journalEntries = await getAllJournalEntries();
//   const journalEntriesWithIdAsString = journalEntries.map((todo) => ({
//     ...todo,
//     _id: todo._id.toString(),
//   }));

//   const todos = await getAllTodos();
//   const todosWithIdAsString = todos.map((todo) => ({
//     ...todo,
//     _id: todo._id.toString(),
//   }));

//   return (
//     <section>
//       <div className="m-8">
//         <Quotes />
//       </div>
//       <div className="m-8">
//         <Notes journalEntries={journalEntriesWithIdAsString} />
//       </div>
//       <div className="grid grid-cols-2 gap-2 m-8">
//         <Goals />
//         <DashboardLinks />
//       </div>
//       <div className="m-8">
//         <Upcoming todos={todosWithIdAsString} />
//       </div>
//     </section>
//   );
// };

// export default dashboardPage;
