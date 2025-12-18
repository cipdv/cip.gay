import RecipesForm from "@/components/RecipesForm";
import RecipesList from "@/components/RecipesList";
import { getRecipes } from "@/app/_actions";

const RecipesPage = async () => {
  const recipes = await getRecipes();

  return (
    <div className="space-y-10 px-4 sm:px-6 lg:px-10 mt-6 mb-12 w-full max-w-4xl mx-auto">
      <RecipesForm />
      <RecipesList recipes={recipes} />
    </div>
  );
};

export default RecipesPage;
