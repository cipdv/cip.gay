import DashboardTabs from "@/components/DashboardTabs";
import { getTasks } from "@/app/_actions";

const DashboardPage = async () => {
  const now = new Date().toISOString();

  // Pull tasks scheduled from today onwards (plus unscheduled ones)
  const tasks = await getTasks({ from: now });

  return (
    <section className="px-10 py-8">
      {/* Quote section (placeholder like your mock) */}
      <div className="border border-black p-6 mb-8">
        <p className="text-center text-lg">
          "a section where a quote would go."
        </p>
        <p className="text-center mt-4">-by Quote author</p>
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
