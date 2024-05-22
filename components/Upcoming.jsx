import React from "react";
import { getAllTodos } from "@/app/_actions";
import { deleteTodo } from "@/app/_actions";

const Upcoming = async ({ todos }) => {
  const upcomingTodos = todos.filter((todo) => {
    const deadlineDate = new Date(todo.deadline);
    const today = new Date();
    const differenceInDays = Math.ceil(
      (deadlineDate - today) / (1000 * 60 * 60 * 24)
    );
    return differenceInDays <= 5;
  });

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Upcoming Todos</h2>
      <ul className="space-y-4">
        {upcomingTodos.map((todo) => (
          <li
            key={todo._id}
            className="bg-blue-200 bg-opacity-20 p-4 space-y-2"
          >
            <h3>{todo.todo}</h3>
            <p>{todo.notes}</p>
            <p>Deadline: {todo.deadline}</p>
            <form
              action={async () => {
                "use server";
                await deleteTodo(todo?._id);
              }}
            >
              <button
                className="bg-deleteButton py-2 px-4 rounded"
                type="submit"
              >
                Completed
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Upcoming;
