"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const labelForCategory = {
  watch: "Watched",
  read: "Read",
  do: "Done",
  go: "Went",
  eat: "Ate",
};

const formatDate = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

function DisplayRow({
  item,
  onCompleteSubmit,
  onDeleteSubmit,
  setEditingId,
}) {
  return (
    <div className="border border-black rounded-none p-3 space-y-1 bg-white/70">
      <div className="flex justify-between gap-4 items-start">
        <div className="min-w-0 space-y-1 break-words">
          <div className="font-semibold break-words">{item.name}</div>
          {item.genre && (
            <div className="text-sm italic break-words">{item.genre}</div>
          )}
          {item.details && (
            <p
              className="text-sm break-words"
              dangerouslySetInnerHTML={{
                __html: item.details.replace(/\n/g, "<br />"),
              }}
            />
          )}
          {item.created_at && (
            <div className="text-xs text-gray-700">
              {formatDate(item.created_at)}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex items-stretch gap-2">
          {item.status !== "completed" ? (
            <form className="flex" onSubmit={onCompleteSubmit}>
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="status" value="completed" />
              <button
                type="submit"
                className="btn border border-black rounded-none h-full"
                title={labelForCategory[item.category] || "Completed"}
              >
                {labelForCategory[item.category] || "Completed"}
              </button>
            </form>
          ) : (
            <div className="text-sm self-center">Completed</div>
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
              onClick={() => setEditingId(item.id)}
            >
              <img src="/images/icons8-hide-16.png" alt="Edit item" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditRow({ item, onUpdateSubmit, setEditingId }) {
  const [category, setCategory] = useState(item.category || "watch");
  const showGenre = category === "watch" || category === "read";

  return (
    <div className="border border-black rounded-none p-3 space-y-2 bg-white/70">
      <form onSubmit={onUpdateSubmit} className="grid gap-3">
        <input type="hidden" name="id" value={item.id} />

        <label className="font-semibold" htmlFor={`category-${item.id}`}>
          Category
        </label>
        <select
          id={`category-${item.id}`}
          name="category"
          className="border border-black p-2 rounded-none bg-transparent"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="watch">Watch</option>
          <option value="read">Read</option>
          <option value="do">Do</option>
          <option value="go">Go</option>
          <option value="eat">Eat</option>
        </select>

        <label className="font-semibold" htmlFor={`name-${item.id}`}>
          Name
        </label>
        <input
          id={`name-${item.id}`}
          name="name"
          defaultValue={item.name || ""}
          className="border border-black p-2 rounded-none bg-transparent"
          required
        />

        {showGenre && (
          <>
            <label className="font-semibold" htmlFor={`genre-${item.id}`}>
              Genre (optional)
            </label>
            <input
              id={`genre-${item.id}`}
              name="genre"
              defaultValue={item.genre || ""}
              className="border border-black p-2 rounded-none bg-transparent"
              placeholder="e.g., sci-fi, biography"
            />
          </>
        )}

        <label className="font-semibold" htmlFor={`details-${item.id}`}>
          Details (optional)
        </label>
        <textarea
          id={`details-${item.id}`}
          name="details"
          defaultValue={item.details || ""}
          className="border border-black p-2 rounded-none bg-transparent h-24"
        />

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
            onClick={() => setEditingId(null)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const CategoryBlock = ({
  title,
  items,
  onCompleteSubmit,
  onDeleteSubmit,
  onUpdateSubmit,
  editingId,
  setEditingId,
}) => {
  if (!items.length) return null;

  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, 5);

  return (
    <div className="space-y-3">
      <h3 className="font-bold">{title}</h3>
      {visibleItems.map((item) =>
        editingId === item.id ? (
          <EditRow
            key={item.id}
            item={item}
            onUpdateSubmit={onUpdateSubmit}
            setEditingId={setEditingId}
          />
        ) : (
          <DisplayRow
            key={item.id}
            item={item}
            onCompleteSubmit={onCompleteSubmit}
            onDeleteSubmit={onDeleteSubmit}
            setEditingId={setEditingId}
          />
        )
      )}
      {items.length > 5 && (
        <button
          type="button"
          className="btn border border-black rounded-none"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "Show less" : "Show all"}
        </button>
      )}
    </div>
  );
};

const WrdList = ({ items, onComplete, onDelete, onUpdate }) => {
  if (!items?.length) return <p className="mt-4">No items yet.</p>;

  const [editingId, setEditingId] = useState(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleComplete = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await onComplete(formData);
      setEditingId(null);
      router.refresh();
    });
  };

  const handleDelete = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await onDelete(formData);
      setEditingId(null);
      router.refresh();
    });
  };

  const handleUpdate = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await onUpdate(formData);
      setEditingId(null);
      router.refresh();
    });
  };

  const activeItems = items.filter((item) => item.status === "active");
  if (!activeItems.length) return <p className="mt-4">No items yet.</p>;

  const categories = {
    watch: [],
    read: [],
    do: [],
    go: [],
    eat: [],
  };

  activeItems.forEach((item) => {
    const cat = item.category;
    if (categories[cat]) categories[cat].push(item);
  });

  return (
    <div className="space-y-6">
      <CategoryBlock
        title="Watch"
        items={categories.watch}
        onCompleteSubmit={handleComplete}
        onDeleteSubmit={handleDelete}
        onUpdateSubmit={handleUpdate}
        editingId={editingId}
        setEditingId={setEditingId}
      />
      <CategoryBlock
        title="Read"
        items={categories.read}
        onCompleteSubmit={handleComplete}
        onDeleteSubmit={handleDelete}
        onUpdateSubmit={handleUpdate}
        editingId={editingId}
        setEditingId={setEditingId}
      />
      <CategoryBlock
        title="Do"
        items={categories.do}
        onCompleteSubmit={handleComplete}
        onDeleteSubmit={handleDelete}
        onUpdateSubmit={handleUpdate}
        editingId={editingId}
        setEditingId={setEditingId}
      />
      <CategoryBlock
        title="Go"
        items={categories.go}
        onCompleteSubmit={handleComplete}
        onDeleteSubmit={handleDelete}
        onUpdateSubmit={handleUpdate}
        editingId={editingId}
        setEditingId={setEditingId}
      />
      <CategoryBlock
        title="Eat"
        items={categories.eat}
        onCompleteSubmit={handleComplete}
        onDeleteSubmit={handleDelete}
        onUpdateSubmit={handleUpdate}
        editingId={editingId}
        setEditingId={setEditingId}
      />
    </div>
  );
};

export default WrdList;
