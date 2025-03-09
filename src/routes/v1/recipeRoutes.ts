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
import { generateEmbedding } from "../../services/ollama";

const router: Router = Router();

router.get("/:id/update-like-count", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.tokenData;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json("Invalid MongoDB ObjectId");
      return;
    }

    const userId = data.sub;
    
    const userData = await User.findById(userId);
    if (!userData) {
      res.status(404).json("User not found.");
      return;
    }

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      res.status(404).json("Recipe not found.");
      return;
    }

    // Check if user already liked this recipe
    if (await User.findOne({
      _id: userId,
      likedRecipes: { $in: [recipe._id] },
    })) {
      res.status(409).json("Recipe already liked");
      return;
    }

    // Add recipe to user's likedRecipes
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { likedRecipes: recipe._id } }
    );

    // Add user's ID to recipe's likedBy and update likeQuantity
    await Recipe.findByIdAndUpdate(
      id,
      { 
        $addToSet: { likedBy: userId },
        $inc: { likeQuantity: 1 }
      }
    );

    res.status(200).json("Updated like count.");
  } catch (error) {
    console.error(error);
    res.status(500).json("Server error");
  }
});

router.get("/:id/delete-like-count", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.tokenData;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json("Invalid MongoDB ObjectId");
      return;
    }

    const userId = data.sub;
    
    const userData = await User.findById(userId);
    if (!userData) {
      res.status(404).json("User not found.");
      return;
    }

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      res.status(404).json("Recipe not found.");
      return;
    }

    // Check if user has liked this recipe
    if (!(await User.findOne({
      _id: userId,
      likedRecipes: { $in: [recipe._id] },
    }))) {
      res.status(409).json("Recipe not liked by this user");
      return;
    }

    // Remove recipe from user's likedRecipes
    await User.findByIdAndUpdate(
      userId,
      { $pull: { likedRecipes: recipe._id } }
    );

    // Remove user's ID from recipe's likedBy and update likeQuantity
    await Recipe.findByIdAndUpdate(
      id,
      { 
        $pull: { likedBy: userId },
        $inc: { likeQuantity: -1 }
      }
    );

    res.status(200).json("Updated like count.");
  } catch (error) {
    console.error(error);
    res.status(500).json("Server error");
  }
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
router.post("/toggle-visibility/:id", authenticateToken, async (req, res) => {
  try {
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

    console.log(recipe.author[0].toString());
    console.log(userData._id!.toString());
    if (recipe.author[0].toString() !== userData._id!.toString()) {
      res.status(401).json("It's not your recipe");
      return;
    }

    recipe.privacy = recipe.privacy === "private" ? "public" : "private";
    await recipe.save();
    res.status(200).json();
  } catch (err) {
    console.log(err);
    res.status(500).json();
    return;
  }
});
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
