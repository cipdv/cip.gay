"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createPersonNote,
  deletePerson,
  deletePersonNote,
  updatePerson,
  updatePersonNote,
} from "@/app/_actions";

const formatDate = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

const categoryLabels = {
  gift: "Gift idea",
  general: "General",
  joke: "Inside joke",
  memory: "Memory",
};

const PeopleList = ({ people, notes }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState(null);
  const [editingPersonId, setEditingPersonId] = useState(null);
  const [addingNoteFor, setAddingNoteFor] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);

  const sortedPeople = useMemo(() => {
    return [...(people || [])].sort((a, b) => {
      const fa = (a.first_name || "").toLowerCase();
      const fb = (b.first_name || "").toLowerCase();
      if (fa === fb) return 0;
      return fa < fb ? -1 : 1;
    });
  }, [people]);

  const notesByPerson = useMemo(() => {
    const map = {};
    (notes || []).forEach((n) => {
      const key = n.person_id;
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(n);
    });
    return map;
  }, [notes]);

  if (!sortedPeople.length) return <p className="mt-4">No people yet.</p>;

  const handleDeletePerson = (event) => {
    event.preventDefault();
    if (
      typeof window !== "undefined" &&
      !window.confirm("Delete this person? This will remove their notes.")
    ) {
      return;
    }
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await deletePerson(formData);
      router.refresh();
    });
  };

  const handleUpdatePerson = (event) => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const formData = new FormData(formEl);
    startTransition(async () => {
      await updatePerson(null, formData);
      setEditingPersonId(null);
      router.refresh();
    });
  };

  const handleAddNote = (event, personId) => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const formData = new FormData(formEl);
    formData.set("personId", personId);
    startTransition(async () => {
      await createPersonNote(null, formData);
      setAddingNoteFor(null);
      formEl?.reset?.();
      router.refresh();
    });
  };

  const handleUpdateNote = (event, noteId) => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const formData = new FormData(formEl);
    formData.set("id", noteId);
    startTransition(async () => {
      await updatePersonNote(null, formData);
      setEditingNoteId(null);
      router.refresh();
    });
  };

  const handleDeleteNote = (event) => {
    event.preventDefault();
    if (
      typeof window !== "undefined" &&
      !window.confirm("Delete this note?")
    ) {
      return;
    }
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await deletePersonNote(formData);
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <h2 className="font-bold text-lg">People</h2>
      {sortedPeople.map((person) => {
        const personNotes = notesByPerson[person.id] || [];
        const expanded = expandedId === person.id;
        const showAddNote = addingNoteFor === person.id;
        const editingThisPerson = editingPersonId === person.id;

        return (
          <div
            key={person.id}
            className="border border-black rounded-none p-3 bg-white/70"
          >
            <div className="flex justify-between gap-4 items-start">
              <button
                type="button"
                className="min-w-0 text-left space-y-1 break-words flex-1"
                onClick={() =>
                  setExpandedId((prev) => (prev === person.id ? null : person.id))
                }
              >
                <div className="font-bold break-words">
                  {person.first_name} {person.last_name || ""}
                  {person.nickname ? ` (${person.nickname})` : ""}
                </div>
                {person.email && (
                  <div className="text-sm break-words">{person.email}</div>
                )}
                {person.phone && (
                  <div className="text-sm break-words">{person.phone}</div>
                )}
                {person.birthday && (
                  <div className="text-sm">
                    Birthday: {formatDate(person.birthday)}
                  </div>
                )}
              </button>

              <form onSubmit={handleDeletePerson} className="flex-shrink-0">
                <input type="hidden" name="id" value={person.id} />
                <button
                  type="submit"
                  className="border border-black rounded-none p-2 w-10 h-10 hover:bg-[#e0e5c7]"
                  aria-label="Delete person"
                  title="Delete person"
                >
                  <img src="/images/icons8-eye-16.png" alt="Delete person" />
                </button>
              </form>
            </div>

            {expanded && (
              <div className="mt-3 space-y-3">
                {!editingThisPerson ? (
                  <button
                    type="button"
                    className="btn border border-black rounded-none"
                    onClick={() => setEditingPersonId(person.id)}
                  >
                    Edit person
                  </button>
                ) : (
                  <form
                    className="border border-black p-3 rounded-none bg-white/70 grid gap-3"
                    onSubmit={handleUpdatePerson}
                  >
                    <input type="hidden" name="id" value={person.id} />

                    <label className="font-semibold" htmlFor={`first-${person.id}`}>
                      First name
                    </label>
                    <input
                      id={`first-${person.id}`}
                      name="firstName"
                      defaultValue={person.first_name || ""}
                      className="border border-black p-2 rounded-none bg-transparent"
                      required
                    />

                    <label className="font-semibold" htmlFor={`last-${person.id}`}>
                      Last name
                    </label>
                    <input
                      id={`last-${person.id}`}
                      name="lastName"
                      defaultValue={person.last_name || ""}
                      className="border border-black p-2 rounded-none bg-transparent"
                    />

                    <label className="font-semibold" htmlFor={`nick-${person.id}`}>
                      Nickname
                    </label>
                    <input
                      id={`nick-${person.id}`}
                      name="nickname"
                      defaultValue={person.nickname || ""}
                      className="border border-black p-2 rounded-none bg-transparent"
                    />

                    <label className="font-semibold" htmlFor={`email-${person.id}`}>
                      Email
                    </label>
                    <input
                      id={`email-${person.id}`}
                      name="email"
                      type="email"
                      defaultValue={person.email || ""}
                      className="border border-black p-2 rounded-none bg-transparent"
                    />

                    <label className="font-semibold" htmlFor={`phone-${person.id}`}>
                      Phone
                    </label>
                    <input
                      id={`phone-${person.id}`}
                      name="phone"
                      defaultValue={person.phone || ""}
                      className="border border-black p-2 rounded-none bg-transparent"
                    />

                    <label className="font-semibold" htmlFor={`bday-${person.id}`}>
                      Birthday
                    </label>
                    <input
                      id={`bday-${person.id}`}
                      name="birthday"
                      type="date"
                      defaultValue={person.birthday || ""}
                      className="border border-black p-2 rounded-none bg-transparent"
                    />

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="btn border border-black rounded-none"
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        className="border border-black rounded-none px-4"
                        onClick={() => setEditingPersonId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="flex items-center gap-2 justify-between">
                  <h3 className="font-semibold">Notes</h3>
                  <button
                    type="button"
                    className="btn border border-black rounded-none"
                    onClick={() =>
                      setAddingNoteFor((prev) =>
                        prev === person.id ? null : person.id
                      )
                    }
                  >
                    {showAddNote ? "Close note form" : "Add note"}
                  </button>
                </div>

                {showAddNote && (
                  <form
                    onSubmit={(e) => handleAddNote(e, person.id)}
                    className="border border-black p-3 rounded-none bg-white/70 grid gap-3"
                  >
                    <input type="hidden" name="personId" value={person.id} />

                    <label className="font-semibold" htmlFor={`cat-${person.id}`}>
                      Category
                    </label>
                    <select
                      id={`cat-${person.id}`}
                      name="category"
                      className="border border-black p-2 rounded-none bg-transparent"
                      defaultValue="general"
                    >
                      <option value="gift">Gift idea</option>
                      <option value="general">General</option>
                      <option value="joke">Inside joke</option>
                      <option value="memory">Memory</option>
                    </select>

                    <label className="font-semibold" htmlFor={`note-${person.id}`}>
                      Note
                    </label>
                    <textarea
                      id={`note-${person.id}`}
                      name="note"
                      className="border border-black p-2 rounded-none bg-transparent h-24"
                      required
                    />

                    <button
                      type="submit"
                      className="btn border border-black rounded-none"
                    >
                      Submit
                    </button>
                  </form>
                )}

                {personNotes.length === 0 ? (
                  <p className="text-sm">No notes yet.</p>
                ) : (
                  <div className="space-y-2">
                    {personNotes.map((note) => {
                      const editingNote = editingNoteId === note.id;
                      return (
                        <div
                          key={note.id}
                          className="border border-black rounded-none p-3 bg-white/70"
                        >
                          {!editingNote ? (
                            <div className="flex justify-between gap-4 items-start">
                              <div className="min-w-0 space-y-1 break-words flex-1">
                                <div className="text-sm font-semibold">
                                  {categoryLabels[note.category] ||
                                    note.category}
                                </div>
                                <div className="text-sm break-words">
                                  {note.note}
                                </div>
                                {note.created_at && (
                                  <div className="text-xs text-gray-700">
                                    {formatDate(note.created_at)}
                                  </div>
                                )}
                              </div>

                              <div className="flex-shrink-0 flex gap-2">
                                <button
                                  type="button"
                                  className="border border-black rounded-none p-2 hover:bg-[#e0e5c7]"
                                  aria-label="Edit note"
                                  title="Edit note"
                                  onClick={() => setEditingNoteId(note.id)}
                                >
                                  <img
                                    src="/images/icons8-hide-16.png"
                                    alt="Edit note"
                                  />
                                </button>
                                <form onSubmit={handleDeleteNote}>
                                  <input type="hidden" name="id" value={note.id} />
                                  <button
                                    type="submit"
                                    className="border border-black rounded-none p-2 hover:bg-[#e0e5c7]"
                                    aria-label="Delete note"
                                    title="Delete note"
                                  >
                                    <img
                                      src="/images/icons8-eye-16.png"
                                      alt="Delete note"
                                    />
                                  </button>
                                </form>
                              </div>
                            </div>
                          ) : (
                            <form
                              className="grid gap-2"
                              onSubmit={(e) => handleUpdateNote(e, note.id)}
                            >
                              <input type="hidden" name="id" value={note.id} />

                              <label
                                className="font-semibold text-sm"
                                htmlFor={`edit-cat-${note.id}`}
                              >
                                Category
                              </label>
                              <select
                                id={`edit-cat-${note.id}`}
                                name="category"
                                defaultValue={note.category || "general"}
                                className="border border-black p-2 rounded-none bg-transparent"
                              >
                                <option value="gift">Gift idea</option>
                                <option value="general">General</option>
                                <option value="joke">Inside joke</option>
                                <option value="memory">Memory</option>
                              </select>

                              <label
                                className="font-semibold text-sm"
                                htmlFor={`edit-note-${note.id}`}
                              >
                                Note
                              </label>
                              <textarea
                                id={`edit-note-${note.id}`}
                                name="note"
                                defaultValue={note.note || ""}
                                className="border border-black p-2 rounded-none bg-transparent h-20"
                                required
                              />

                              <div className="flex gap-2 mt-1">
                                <button
                                  type="submit"
                                  className="btn border border-black rounded-none"
                                >
                                  Update
                                </button>
                                <button
                                  type="button"
                                  className="border border-black rounded-none px-4"
                                  onClick={() => setEditingNoteId(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PeopleList;
