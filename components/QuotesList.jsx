const QuotesList = ({ quotes }) => {
  if (!quotes?.length) {
    return <p className="mt-4">No quotes yet.</p>;
  }

  return (
    <div className="space-y-3">
      {quotes.map((q) => (
        <div
          key={q.id}
          className="border border-black rounded-none p-3 bg-white/70 space-y-2"
        >
          <div
            className="font-semibold"
            dangerouslySetInnerHTML={{
              __html: q.quote ? q.quote.replace(/\n/g, "<br />") : "",
            }}
          />
          {q.author && <p className="text-sm">- {q.author}</p>}
        </div>
      ))}
    </div>
  );
};

export default QuotesList;
