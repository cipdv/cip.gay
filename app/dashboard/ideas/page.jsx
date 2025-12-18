import IdeasForm from "@/components/IdeasForm";
import IdeasBubbles from "@/components/IdeasBubbles";
import { getIdeas, updateIdea, deleteIdea } from "@/app/_actions";

const IdeasPage = async () => {
  const ideas = await getIdeas();
  const listKey = Array.isArray(ideas)
    ? ideas.map((i) => `${i.id}-${i.updated_at || ""}`).join("|")
    : "ideas-empty";

  const updateAction = async (formData) => {
    "use server";
    await updateIdea(formData);
  };

  const deleteAction = async (formData) => {
    "use server";
    await deleteIdea(formData);
  };

  return (
    <div className="space-y-10 px-4 sm:px-6 lg:px-10 mt-6 mb-12 w-full max-w-4xl mx-auto">
      <IdeasForm />
      <IdeasBubbles
        key={listKey}
        ideas={ideas}
        onUpdate={updateAction}
        onDelete={deleteAction}
      />
    </div>
  );
};

export default IdeasPage;
