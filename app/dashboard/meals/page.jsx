import MealIdeasForm from "@/components/MealIdeasForm";
import { getAllMealIdeas } from "../../_actions";
import MealIdeas from "@/components/MealIdeas";

const ideasPage = async () => {
  const ideas = await getAllMealIdeas();

  return (
    <div className="space-y-10 ml-24 mr-24 mt-6 mb-12">
      <MealIdeasForm />
      <MealIdeas ideas={ideas} />
    </div>
  );
};

export default ideasPage;
