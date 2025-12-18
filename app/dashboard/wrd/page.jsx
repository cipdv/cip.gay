import WrdForm from "@/components/WrdForm";
import WrdList from "@/components/WrdList";
import { getWrdItems, updateWrdItem, deleteWrdItem } from "@/app/_actions";

const WrdPage = async () => {
  const items = await getWrdItems();
  const listKey = Array.isArray(items)
    ? items.map((i) => `${i.id}-${i.updated_at || ""}`).join("|")
    : "wrd-empty";

  const completeAction = async (formData) => {
    "use server";
    await updateWrdItem(formData);
  };

  const updateAction = async (formData) => {
    "use server";
    await updateWrdItem(formData);
  };

  const deleteAction = async (formData) => {
    "use server";
    await deleteWrdItem(formData);
  };

  return (
    <div className="space-y-10 px-4 sm:px-6 lg:px-10 mt-6 mb-12 w-full max-w-4xl mx-auto">
      <WrdForm />
      <WrdList
        key={listKey}
        items={items}
        onComplete={completeAction}
        onDelete={deleteAction}
        onUpdate={updateAction}
      />
    </div>
  );
};

export default WrdPage;
