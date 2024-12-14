import { Router } from 'express';
import { getRecipe, addRecipe, vectorSearchRecipe } from '../../controllers/recipeController';
import { authenticateToken, validate } from '../../middleware/validate';

import { AddRecipeValidatorSchema } from '../../utils/validators/recipeValidator';
import { Types } from 'mongoose';
import Recipe, { RecipeType } from '../../models/recipeModel';
import { handleImagesRead } from '../../helpers/handleImagesRead';
import { searchRecipeById } from '../../services/recipeServices';
import User from '../../models/userModel';

const router: Router = Router();

router.get("/:id/update-like-count", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const data = req.tokenData;

    if (!Types.ObjectId.isValid(id)) {
        res.status(400).json('Invalid MongoDB ObjectId');
        return;
    }

    console.log(data.sub)
    const userData = await User.findById(data.sub);
    if (!userData) {
        res.status(404).json('User not found.');
        return;
    };


    const recipe = await Recipe.findById(id);

    if (!recipe) {
        res.status(404).json('Recipe not found.');
        return;
    }

    if (await User.findOne({
        _id: data.sub,
        likedRecipes: { $in: [recipe._id] }
    })) {
        res.status(409).json("Recipe already liked");
        return;
    }


    userData.likedRecipes.push(recipe);
    userData.save();

    recipe.likedBy.push(userData);
    recipe.likeQuantity = recipe.likedBy.length;
    recipe.save();


    res.status(200).json("Updated like count.");
})

router.get("/:id/delete-like-count", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const data = req.tokenData;

    if (!Types.ObjectId.isValid(id)) {
        res.status(400).json('Invalid MongoDB ObjectId');
        return;
    }

    const userData = await User.findById(data.sub);
    if (!userData) {
        res.status(404).json('User not found.');
        return;
    };


    const recipe = await Recipe.findById(id);
    if (!recipe) {
        res.status(404).json('Recipe not found.');
        return;
    }

    if (!(await User.findOne({
        _id: data.sub,
        likedRecipes: { $in: [recipe._id] }
    }))) {
        res.status(409).json("Recipe not liked by this user");
        return;
    }


    userData.likedRecipes.remove(recipe);
    userData.save();

    recipe.likedBy.remove(userData);
    recipe.likeQuantity = recipe.likedBy.length;
    recipe.save();


    res.status(200).json("Updated like count.");
})

router.get("/:id", async (req, res, next) => {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
        res.status(400).json('Invalid MongoDB ObjectId');
        return;
    }

    try {
        const product: (RecipeType & { base64Image?: string }) | null = await searchRecipeById(id);

        if (!product) {
            res.status(404).json('Recipe not found.');
            return;
        }

        if (product.photo) {
            const imagePath = product.photo.filePath;
            product.base64Image = await handleImagesRead(imagePath);
        }

        res.status(200).json(product);
    } catch (err) {
        next(err);
        return;
    }
});
router.post("/get", getRecipe);
router.post("/add", validate(AddRecipeValidatorSchema), addRecipe)
router.post("/vector-search", vectorSearchRecipe);

export default router;