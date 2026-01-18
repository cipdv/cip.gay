import ToBuyForm from "@/components/ToBuyForm";
import ToBuyList from "@/components/ToBuyList";
import { getToBuy, updateToBuy, deleteToBuy } from "@/app/_actions";

const purchasesPage = async () => {
  const items = await getToBuy();

  const completeAction = async (formData) => {
    "use server";
    await updateToBuy(null, formData);
  };

  const updateAction = async (formData) => {
    "use server";
    await updateToBuy(null, formData);
  };

  const deleteAction = async (formData) => {
    "use server";
    await deleteToBuy(formData);
  };

  return (
    <div className="space-y-10 px-4 sm:px-6 lg:px-10 mt-6 mb-12 w-full max-w-4xl mx-auto">
      <ToBuyForm />
      <ToBuyList
        items={items}
        onComplete={completeAction}
        onDelete={deleteAction}
        onUpdate={updateAction}
      />
    </div>
  );
};

export default purchasesPage;
