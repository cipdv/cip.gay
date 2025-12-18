import QuotesForm from "@/components/QuotesForm";
import QuotesList from "@/components/QuotesList";
import { getQuotes } from "@/app/_actions";

const QuotesPage = async () => {
  const quotes = await getQuotes();

  return (
    <div className="space-y-10 px-4 sm:px-6 lg:px-10 mt-6 mb-12 w-full max-w-4xl mx-auto">
      <QuotesForm />
      <QuotesList quotes={quotes} />
    </div>
  );
};

export default QuotesPage;
