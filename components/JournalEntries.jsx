"use client";
import { useMemo, useState } from "react";

const JournalEntries = ({ journalEntries }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openEntry, setOpenEntry] = useState(null);

  const handleDateChange = (e) => {
    const [year, month] = e.target.value.split("-");
    setSelectedDate(new Date(year, month - 1));
  };

  const filteredEntries = useMemo(() => {
    const entries = Array.isArray(journalEntries) ? journalEntries : [];
    return entries.filter((entry) => {
      const rawDate = entry.entry_date || entry.created_at;
      if (!rawDate) return false;
      const entryDate = new Date(rawDate);
      return (
        entryDate.getMonth() === selectedDate.getMonth() &&
        entryDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [journalEntries, selectedDate]);

  return (
    <div className="space-y-5">
      <input
        type="month"
        value={`${selectedDate.getFullYear()}-${String(
          selectedDate.getMonth() + 1
        ).padStart(2, "0")}`}
        onChange={handleDateChange}
        className="border border-black p-2 rounded-none bg-transparent"
      />

      {filteredEntries.length === 0 ? (
        <p>No journal entries for this month.</p>
      ) : (
        filteredEntries
          .slice()
          .reverse()
          .map((entry) => {
            const entryDate = new Date(entry.entry_date || entry.created_at);
            const entryKey = entry.id || entry.entry_date;
            const isOpen = openEntry === entryKey;
            return (
              <div
                key={entryKey}
                className="flex justify-between space-x-4 border border-black rounded-none p-3 bg-white/70"
              >
                <div className="w-full">
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => setOpenEntry(isOpen ? null : entryKey)}
                    aria-expanded={isOpen}
                  >
                    <h2 className="font-semibold">
                      {entryDate.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h2>
                  </button>

                  {isOpen ? (
                    <div className="mt-4 flex justify-between space-x-4">
                      <div className="w-2/3 space-y-3">
                        <div>
                          <h3 className="font-semibold">Reflections</h3>
                          <p
                            className="mt-2"
                            dangerouslySetInnerHTML={{
                              __html: entry?.reflections
                                ? entry.reflections.replace(/\n/g, "<br />")
                                : "",
                            }}
                          />
                        </div>
                      </div>
                      <div className="w-1/3">
                        <h3 className="font-semibold">Mood</h3>
                        <p className="mt-2">
                          {entry.mood_start || "-"} {"->"}{" "}
                          {entry.mood_end || "-"}
                        </p>
                        <h3 className="font-semibold mt-4">Weather</h3>
                        <p className="mt-2">{entry.weather || "-"}</p>
                        <h3 className="font-semibold mt-4">Food</h3>
                        <p className="mt-2">{entry.food || "-"}</p>
                        <h3 className="font-semibold mt-4">Exercise</h3>
                        <p className="mt-2">{entry.exercise || "-"}</p>
                        <h3 className="font-semibold mt-4">Lesson learned</h3>
                        <p
                          className="mt-2"
                          dangerouslySetInnerHTML={{
                            __html: entry?.lesson_learned
                              ? entry.lesson_learned.replace(/\n/g, "<br />")
                              : "",
                          }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
      )}
    </div>
  );
};

export default JournalEntries;
