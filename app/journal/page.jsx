import JournalForm from "@/components/JournalForm";
import JournalEntries from "@/components/JournalEntries";

import { getAllJournalEntries } from "../_actions";

const journalPage = async () => {
  const journalEntries = await getAllJournalEntries();

  return (
    <div className="space-y-10 ml-24 mr-24 mt-6 mb-12">
      <JournalForm />
      <JournalEntries journalEntries={journalEntries} />
    </div>
  );
};

export default journalPage;
