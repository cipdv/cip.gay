import React from "react";

const Notes = async ({ journalEntries }) => {
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

  return <div>{randomEntry && <h2>{randomEntry.notes}</h2>}</div>;
};

export default Notes;
