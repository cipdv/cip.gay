import IdeasForm from "@/components/IdeasForm";
import { getAllIdeas } from "../_actions";
import IdeasBubbles from "@/components/IdeasBubbles";

const ideasPage = async () => {
  const ideas = await getAllIdeas();

  return (
    <div className="space-y-10 ml-24 mr-24 mt-6 mb-12">
      <h1>Ideas</h1>
      <IdeasForm />
      <IdeasBubbles ideas={ideas} />
    </div>
  );
};

export default ideasPage;
