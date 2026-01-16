import JournalForm from "@/components/JournalForm";
import JournalEntries from "@/components/JournalEntries";

import { getJournalEntries } from "@/app/_actions";

const journalPage = async () => {
  const journalEntries = await getJournalEntries();

  return (
    <section>
      <JournalForm />
      <JournalEntries journalEntries={journalEntries} />
    </section>
  );
};

export default journalPage;
