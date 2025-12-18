"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateToBuy, deleteToBuy } from "@/app/_actions";

const formatDate = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

const formatPrice = (price) => {
  if (price === null || price === undefined) return null;
  const num = Number(price);
  if (Number.isNaN(num)) return null;
  return `$${num.toFixed(2)}`;
};

function DisplayRow({ item, onCompleteSubmit, onDeleteSubmit, onEdit }) {
  return (
    <div className="border border-black rounded-none p-3 bg-white/70">
      <div className="flex justify-between gap-4 items-start">
        <div className="min-w-0 space-y-2 break-words">
          <div className="font-bold break-words">{item.item}</div>

          {item.link && (
            <a
              href={item.link}
              className="text-blue-700 underline break-words"
              target="_blank"
              rel="noreferrer"
            >
              {item.link}
            </a>
          )}

          {item.price !== null && item.price !== undefined && (
            <div className="text-sm">{formatPrice(item.price)}</div>
          )}

          {item.created_at && (
            <div className="text-xs text-gray-700">
              {formatDate(item.created_at)}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex items-stretch gap-2">
          {item.status !== "purchased" ? (
            <form className="flex" onSubmit={onCompleteSubmit}>
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="status" value="purchased" />
              <button
                type="submit"
                className="btn border border-black rounded-none h-full"
              >
                Mark as purchased
              </button>
            </form>
          ) : (
            <div className="text-sm self-center">Purchased</div>
          )}

          <div className="flex flex-col gap-2 h-full">
            <form className="flex-1" onSubmit={onDeleteSubmit}>
              <input type="hidden" name="id" value={item.id} />
              <button
                type="submit"
                className="border border-black rounded-none p-2 w-full h-full hover:bg-[#e0e5c7]"
                aria-label="Delete item"
                title="Delete item"
              >
                <img src="/images/icons8-eye-16.png" alt="Delete item" />
              </button>
            </form>
            <button
              type="button"
              className="border border-black rounded-none p-2 w-full h-full hover:bg-[#e0e5c7]"
              aria-label="Edit item"
              title="Edit item"
              onClick={onEdit}
            >
              <img src="/images/icons8-hide-16.png" alt="Edit item" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditRow({ item, onUpdateSubmit, onCancel }) {
  return (
    <div className="border border-black rounded-none p-3 space-y-2 bg-white/70">
      <form onSubmit={onUpdateSubmit} className="grid gap-3">
        <input type="hidden" name="id" value={item.id} />

        <label className="font-semibold" htmlFor={`item-${item.id}`}>
          Item
        </label>
        <input
          id={`item-${item.id}`}
          name="item"
          defaultValue={item.item || ""}
          className="border border-black p-2 rounded-none bg-transparent"
          required
        />

        <label className="font-semibold" htmlFor={`link-${item.id}`}>
          Link (optional)
        </label>
        <input
          id={`link-${item.id}`}
          name="link"
          defaultValue={item.link || ""}
          className="border border-black p-2 rounded-none bg-transparent break-words"
        />

        <label className="font-semibold" htmlFor={`price-${item.id}`}>
          Price (optional)
        </label>
        <input
          id={`price-${item.id}`}
          name="price"
          type="number"
          step="0.01"
          defaultValue={item.price ?? ""}
          className="border border-black p-2 rounded-none bg-transparent"
        />

        <label className="font-semibold" htmlFor={`need-${item.id}`}>
          Need or want
        </label>
        <select
          id={`need-${item.id}`}
          name="needOrWant"
          defaultValue={item.need_or_want || "want"}
          className="border border-black p-2 rounded-none bg-transparent"
        >
          <option value="need">Need</option>
          <option value="want">Want</option>
        </select>

        <div className="flex gap-2">
          <button
            type="submit"
            className="btn border border-black rounded-none"
            title="Update item"
          >
            Update
          </button>
          <button
            type="button"
            className="border border-black rounded-none px-4"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const ListBlock = ({
  title,
  items,
  onCompleteSubmit,
  onDeleteSubmit,
  onUpdateSubmit,
  editingId,
  setEditingId,
}) => {
  if (!items.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-bold">{title}</h3>
      {items.map((item) =>
        editingId === item.id ? (
          <EditRow
            key={item.id}
            item={item}
            onUpdateSubmit={onUpdateSubmit}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <DisplayRow
            key={item.id}
            item={item}
            onCompleteSubmit={onCompleteSubmit}
            onDeleteSubmit={onDeleteSubmit}
            onEdit={() => setEditingId(item.id)}
          />
        )
      )}
    </div>
  );
};

const ToBuyList = ({ items, onComplete, onDelete, onUpdate }) => {
  if (!items?.length) {
    return <p className="mt-4">No items yet.</p>;
  }

  const [editingId, setEditingId] = useState(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleComplete = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await (onComplete || updateToBuy)(formData);
      setEditingId(null);
      router.refresh();
    });
  };

  const handleDelete = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await (onDelete || deleteToBuy)(formData);
      setEditingId(null);
      router.refresh();
    });
  };

  const handleUpdate = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await (onUpdate || updateToBuy)(formData);
      setEditingId(null);
      router.refresh();
    });
  };

  const activeItems = items.filter((i) => i.status !== "purchased");
  if (!activeItems.length) return <p className="mt-4">No items yet.</p>;

  const needs = activeItems.filter((i) => i.need_or_want === "need");
  const wants = activeItems.filter((i) => i.need_or_want !== "need");

  return (
    <div className="space-y-6">
      <ListBlock
        title="Needs"
        items={needs}
        onCompleteSubmit={handleComplete}
        onDeleteSubmit={handleDelete}
        onUpdateSubmit={handleUpdate}
        editingId={editingId}
        setEditingId={setEditingId}
      />
      <ListBlock
        title="Wants"
        items={wants}
        onCompleteSubmit={handleComplete}
        onDeleteSubmit={handleDelete}
        onUpdateSubmit={handleUpdate}
        editingId={editingId}
        setEditingId={setEditingId}
      />
    </div>
  );
};

export default ToBuyList;
