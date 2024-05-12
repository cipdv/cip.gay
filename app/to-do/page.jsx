import ToDoForm from "@/components/ToDoForm";
import ToDoList from "@/components/ToDoList";
import { getAllTodos } from "../_actions";

const todoPage = async () => {
  const todos = await getAllTodos();

  return (
    <div className="space-y-10 ml-24 mr-24 mt-6 mb-12">
      <ToDoForm />
      <ToDoList todos={todos} />
    </div>
  );
};

export default todoPage;
