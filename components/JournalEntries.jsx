"use client";
import { useState } from "react";

const JournalEntries = ({ journalEntries }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (e) => {
    const [year, month] = e.target.value.split("-");
    setSelectedDate(new Date(year, month - 1));
  };

  const filteredEntries = journalEntries.filter((entry) => {
    const entryDate = new Date(entry.createdAt);
    return (
      entryDate.getMonth() === selectedDate.getMonth() &&
      entryDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  return (
    <div className="space-y-5">
      <input
        type="month"
        value={`${selectedDate.getFullYear()}-${String(
          selectedDate.getMonth() + 1
        ).padStart(2, "0")}`}
        onChange={handleDateChange}
      />
      {filteredEntries
        .slice()
        .reverse()
        .map((entry) => (
          <div
            key={entry._id}
            className="flex justify-between space-x-4 bg-journalEntry p-2"
          >
            <div className="w-2/3">
              <h2>
                {new Date(entry.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
              <h3>
                {new Date(entry.createdAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </h3>
              <p
                className="mt-4"
                dangerouslySetInnerHTML={{
                  __html: entry?.entry
                    ? entry.entry.replace(/\n/g, "<br />")
                    : "",
                }}
              />
            </div>
            <div className="w-1/3">
              <h2>Notes</h2>
              <p
                className="mt-4"
                dangerouslySetInnerHTML={{
                  __html: entry?.notes
                    ? entry.notes.replace(/\n/g, "<br />")
                    : "",
                }}
              />
            </div>
          </div>
        ))}
    </div>
  );
};

export default JournalEntries;
