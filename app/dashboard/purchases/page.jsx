import { getAllWRDs } from "../../_actions";
import Purchases from "@/components/Purchases";
import PurchasesForm from "@/components/PurchasesForm";

const purchasesPage = async () => {
  const ideas = await getAllWRDs();

  return (
    <div className="space-y-10 ml-24 mr-24 mt-6 mb-12">
      <PurchasesForm />
      <Purchases />
    </div>
  );
};

export default purchasesPage;
