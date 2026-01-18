const Memories = ({ memories }) => {
  if (!memories?.length) {
    return <p className="mt-4">No memories yet.</p>;
  }

  // Group memories by year
  const memoriesByYear = memories.reduce((acc, curr) => {
    (acc[curr.year] = acc[curr.year] || []).push(curr);
    return acc;
  }, {});

  // Sort memories within each year by month
  for (let year in memoriesByYear) {
    memoriesByYear[year].sort(
      (a, b) => a.month - b.month || a.day - b.day
    );
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="space-y-6">
      {Object.entries(memoriesByYear).map(([year, memories]) => (
        <div key={year} className="space-y-3">
          <h2 className="text-xl font-semibold">{year}</h2>
          <div className="space-y-3">
            {memories.map((memory) => (
              <div
                key={memory.id}
                className="border border-black rounded-none p-3 bg-white/70"
              >
                <h3 className="font-semibold">{`${monthNames[memory.month - 1]} ${memory.day}`}</h3>
                <p className="whitespace-pre-line">{memory.memory}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Memories;
