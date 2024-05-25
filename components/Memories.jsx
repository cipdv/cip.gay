const Memories = ({ memories }) => {
  if (!memories) {
    return null; // or return some placeholder content
  }

  // Group memories by year
  const memoriesByYear = memories.reduce((acc, curr) => {
    (acc[curr.year] = acc[curr.year] || []).push(curr);
    return acc;
  }, {});

  // Sort memories within each year by month
  for (let year in memoriesByYear) {
    memoriesByYear[year].sort((a, b) => a.month - b.month);
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
    <div>
      {Object.entries(memoriesByYear).map(([year, memories]) => (
        <div key={year}>
          <h2>{year}</h2>
          {memories.map((memory) => (
            <div key={memory._id}>
              <h3>{`${monthNames[memory.month - 1]}`}</h3>
              <p>{memory.notes}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Memories;
