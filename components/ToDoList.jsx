import { deleteTodo } from "@/app/_actions";

const ToDoList = ({ todos }) => {
  const sortedTodos = [...todos].sort(
    (a, b) => new Date(a.deadline) - new Date(b.deadline)
  );

  return (
    <div>
      {sortedTodos.map((todo) => (
        <div
          key={todo?._id}
          className="bg-white bg-opacity-50 rounded p-2 space-y-3 mt-4"
        >
          <h3
            dangerouslySetInnerHTML={{
              __html: todo?.todo ? todo.todo.replace(/\n/g, "<br />") : "",
            }}
          />
          <p
            className="mt-4"
            dangerouslySetInnerHTML={{
              __html: todo?.notes ? todo.notes.replace(/\n/g, "<br />") : "",
            }}
          />
          <h3>Deadline: {todo?.deadline}</h3>
          <form
            action={async () => {
              "use server";
              await deleteTodo(todo?._id);
            }}
          >
            <button className="bg-deleteButton py-2 px-4 rounded" type="submit">
              Completed
            </button>
          </form>
        </div>
      ))}
    </div>
  );
};

export default ToDoList;
