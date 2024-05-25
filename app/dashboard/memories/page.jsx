import { getAllMemories } from "../../_actions";
import Memories from "@/components/Memories";
import MemoriesForm from "@/components/MemoriesForm";

const memoriesPage = async () => {
  const memories = await getAllMemories();

  return (
    <div className="space-y-10 ml-24 mr-24 mt-6 mb-12">
      <h1>Memories</h1>
      <MemoriesForm />
      <Memories memories={memories} />
    </div>
  );
};

export default memoriesPage;
