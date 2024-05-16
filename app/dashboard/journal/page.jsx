import JournalForm from "@/components/JournalForm";
import JournalEntries from "@/components/JournalEntries";

import { getAllJournalEntries } from "../../_actions";

const journalPage = async () => {
  const journalEntries = await getAllJournalEntries();

  return (
    <section>
      <JournalForm />
      <JournalEntries journalEntries={journalEntries} />
    </section>
  );
};

export default journalPage;
