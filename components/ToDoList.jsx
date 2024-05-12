const ToDoList = ({ todos }) => {
  return (
    <div>
      {todos.map((todo) => (
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
        </div>
      ))}
    </div>
  );
};

export default ToDoList;
