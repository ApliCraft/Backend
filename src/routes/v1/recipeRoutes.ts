import { Router } from "express";
import {
  getRecipe,
  addRecipe,
  vectorSearchRecipe,
  getRecipeIdsByFilter,
  getLikedRecipes,
} from "../../controllers/recipeController";
import { authenticateToken, validate } from "../../middleware/validate";

import { AddRecipeValidatorSchema } from "../../utils/validators/recipeValidator";
import { isValidObjectId, Types } from "mongoose";
import Recipe, { RecipeType } from "../../models/recipeModel";
import fs from "fs/promises";
import { searchRecipeById } from "../../services/recipeServices";
import User from "../../models/userModel";
import {
  generateEmbedding,
} from "../../services/ollama";

const router: Router = Router();

router.get("/:id/update-like-count", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const data = req.tokenData;

  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json("Invalid MongoDB ObjectId");
    return;
  }

  console.log(data.sub);
  const userData = await User.findById(data.sub);
  if (!userData) {
    res.status(404).json("User not found.");
    return;
  }

  const recipe = await Recipe.findById(id);

  if (!recipe) {
    res.status(404).json("Recipe not found.");
    return;
  }

  if (
    await User.findOne({
      _id: data.sub,
      likedRecipes: { $in: [recipe._id] },
    })
  ) {
    res.status(409).json("Recipe already liked");
    return;
  }

  userData.likedRecipes.push(recipe);
  userData.save();

  recipe.likedBy.push(userData);
  recipe.likeQuantity = recipe.likedBy.length;
  recipe.save();

  res.status(200).json("Updated like count.");
});

router.get("/:id/delete-like-count", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const data = req.tokenData;

  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json("Invalid MongoDB ObjectId");
    return;
  }

  const userData = await User.findById(data.sub);
  if (!userData) {
    res.status(404).json("User not found.");
    return;
  }

  const recipe = await Recipe.findById(id);
  if (!recipe) {
    res.status(404).json("Recipe not found.");
    return;
  }

  if (
    !(await User.findOne({
      _id: data.sub,
      likedRecipes: { $in: [recipe._id] },
    }))
  ) {
    res.status(409).json("Recipe not liked by this user");
    return;
  }

  userData.likedRecipes.remove(recipe);
  userData.save();

  recipe.likedBy.remove(userData);
  recipe.likeQuantity = recipe.likedBy.length;
  recipe.save();

  res.status(200).json("Updated like count.");
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json("Invalid MongoDB ObjectId");
    return;
  }

  try {
    const recipe: (RecipeType & { base64Image?: string }) | null =
      await searchRecipeById(id);

    if (!recipe) {
      res.status(404).json("Recipe not found.");
      return;
    }

    if (recipe.photo) {
      const imagePath = recipe.photo.filePath;

      try {
        await fs.access(imagePath);

        const imageBuffer = await fs.readFile(imagePath);
        const base64Image = imageBuffer.toString("base64");
        recipe.base64Image = base64Image;
      } catch (err) {
        // err if image does not exist
      }
    }

    res.status(200).json(recipe);
  } catch (err) {
    next(err);
    return;
  }
});
router.post("/get", getRecipe);
router.post("/add", validate(AddRecipeValidatorSchema), addRecipe);
router.post("/vector-search", vectorSearchRecipe);
router.post("/add-embedding/:id", async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400);
    return;
  }
  try {
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      res.status(404).json("recipe not found");
      return;
    }

    const embedding = await generateEmbedding(
      recipe.name + " " + recipe.description
    );

    // @ts-ignore
    recipe.embedding = embedding;
    await recipe.save();
    res.status(200).json("OK");
  } catch (err) {
    console.log(err);
    res.status(500);
    return;
  }
});
router.post("/get-by-category", getRecipeIdsByFilter);
router.post("/get-ids-by-params", getRecipeIdsByFilter);
router.post("/get-liked-recipes", getLikedRecipes);

export default router;
