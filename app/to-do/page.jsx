import ToDoForm from "@/components/ToDoForm";
import ToDoList from "@/components/ToDoList";
import { getAllTodos } from "../_actions";

const todoPage = async () => {
  const todos = await getAllTodos();
  // Convert ObjectId to string
  const todosWithIdAsString = todos.map((todo) => ({
    ...todo,
    _id: todo._id.toString(),
  }));

  return (
    <div className="space-y-10 ml-24 mr-24 mt-6 mb-12">
      <ToDoForm />
      <ToDoList todos={todosWithIdAsString} />
    </div>
  );
};

export default todoPage;
