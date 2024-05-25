import ToWatchReadDo from "@/components/ToWatchReadDo";
import { getAllWRDs } from "../../_actions";
import ToWatchReadDoForm from "@/components/ToWatchReadDoForm";

const ideasPage = async () => {
  const ideas = await getAllWRDs();

  return (
    <div className="space-y-10 ml-24 mr-24 mt-6 mb-12">
      <h1>Ideas</h1>
      <ToWatchReadDoForm />
      <ToWatchReadDo ideas={ideas} />
    </div>
  );
};

export default ideasPage;
