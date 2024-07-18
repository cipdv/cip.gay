import { getAllPurchases, deleteItem } from "@/app/_actions";

const Purchases = async () => {
  const purchases = await getAllPurchases();

  return (
    <div>
      {purchases.map((item) => (
        <div
          key={item?._id}
          className="bg-white bg-opacity-50 rounded p-2 mt-4 flex items-start"
        >
          <form
            action={async () => {
              "use server";
              await deleteItem(item?._id);
            }}
          >
            <button
              className="bg-deleteButton py-2 px-4 rounded mr-4"
              type="submit"
            >
              Purchased
            </button>
          </form>
          <div className="space-y-3">
            <h3
              dangerouslySetInnerHTML={{
                __html: item?.item ? item.item.replace(/\n/g, "<br />") : "",
              }}
            />
            <p
              className="mt-4"
              dangerouslySetInnerHTML={{
                __html: item?.notes ? item.notes.replace(/\n/g, "<br />") : "",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Purchases;
