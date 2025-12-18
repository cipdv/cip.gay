const RecipesList = ({ recipes }) => {
  if (!recipes?.length) {
    return <p className="mt-4">No recipes yet.</p>;
  }

  return (
    <div className="space-y-3">
      {recipes.map((r) => (
        <div
          key={r.id}
          className="border border-black rounded-none p-3 bg-white/70 space-y-2"
        >
          {r.title && <h3 className="font-bold">{r.title}</h3>}
          <div
            dangerouslySetInnerHTML={{
              __html: r.recipe ? r.recipe.replace(/\n/g, "<br />") : "",
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default RecipesList;
