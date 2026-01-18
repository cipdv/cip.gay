const MealIdeas = ({ ideas }) => {
  if (!ideas?.length) {
    return <p className="mt-4">No meal ideas yet.</p>;
  }

  return (
    <div className="space-y-3">
      {ideas.map((idea) => (
        <div
          key={idea?.id}
          className="border border-black rounded-none p-3 space-y-3 bg-white/70"
        >
          <h3 className="font-semibold"
            dangerouslySetInnerHTML={{
              __html: idea?.idea ? idea.idea.replace(/\n/g, "<br />") : "",
            }}
          />
          <p
            className="text-sm"
            dangerouslySetInnerHTML={{
              __html: idea?.notes ? idea.notes.replace(/\n/g, "<br />") : "",
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default MealIdeas;
