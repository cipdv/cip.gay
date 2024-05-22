import React from "react";
import { getAllJournalEntries } from "@/app/_actions";

const Notes = async () => {
  const journalEntries = await getAllJournalEntries();

  let randomEntry = null;

  while (journalEntries.length > 0) {
    const randomIndex = Math.floor(Math.random() * journalEntries.length);
    const potentialEntry = journalEntries[randomIndex];

    if (potentialEntry.notes) {
      randomEntry = potentialEntry;
      break;
    } else {
      // Remove the entry without notes from the array
      journalEntries.splice(randomIndex, 1);
    }
  }

  return (
    <div>
      {randomEntry && (
        <div key={randomEntry._id}>
          <h2>{randomEntry.notes}</h2>
        </div>
      )}
    </div>
  );
};

export default Notes;
