import PeopleForm from "@/components/PeopleForm";
import PeopleList from "@/components/PeopleList";
import { getPeople, getPersonNotes } from "@/app/_actions";

const PeoplePage = async () => {
  const people = await getPeople();
  const notes = await getPersonNotes();

  return (
    <div className="space-y-10 px-4 sm:px-6 lg:px-10 mt-6 mb-12 w-full max-w-4xl mx-auto">
      <PeopleForm />
      <PeopleList people={people || []} notes={notes || []} />
    </div>
  );
};

export default PeoplePage;
