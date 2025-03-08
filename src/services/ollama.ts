import ollama from "ollama";
import Recipe from "../models/recipeModel";

const MODEL = "llama3.2:3b";

async function generateEmbedding(text: string) {
  const response = await ollama.embed({
    model: MODEL,
    input: text,
  });
  return response.embeddings;
}

async function addRecipeWithEmbedding(recipeData: any) {
  const embedding = await generateEmbedding(
    recipeData.name + " " + recipeData.description
  );

  const newRecipe = new Recipe({
    ...recipeData,
    embedding,
  });

  await newRecipe.save();
}

export { generateEmbedding, addRecipeWithEmbedding };
