import DreamsList from "@/components/DreamsList";
import { getDreams } from "@/app/_actions";

const DreamLabPage = async () => {
  const dreams = await getDreams();

  return (
    <div className="space-y-10 px-4 sm:px-6 lg:px-10 mt-6 mb-12 w-full max-w-4xl mx-auto">
      <h1 className="font-bold text-lg">Dream Lab</h1>
      <DreamsList dreams={dreams || []} />
    </div>
  );
};

export default DreamLabPage;
