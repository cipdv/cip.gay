import MealIdeasForm from "@/components/MealIdeasForm";
import MealIdeas from "@/components/MealIdeas";
import { getMealIdeas } from "../../_actions";

const ideasPage = async () => {
  const ideas = await getMealIdeas();

  return (
    <div className="space-y-10 px-4 sm:px-6 lg:px-10 mt-6 mb-12 w-full max-w-4xl mx-auto">
      <MealIdeasForm />
      <MealIdeas ideas={ideas} />
    </div>
  );
};

export default ideasPage;
