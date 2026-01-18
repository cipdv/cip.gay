import { getMemories } from "../../_actions";
import Memories from "@/components/Memories";
import MemoriesForm from "@/components/MemoriesForm";

const memoriesPage = async () => {
  const memories = await getMemories();

  return (
    <div className="space-y-10 px-4 sm:px-6 lg:px-10 mt-6 mb-12 w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold">Memories</h1>
      <MemoriesForm />
      <Memories memories={memories} />
    </div>
  );
};

export default memoriesPage;
