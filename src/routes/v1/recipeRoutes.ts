import { Router } from 'express';
import { getRecipe, addRecipe } from '../../controllers/recipeController';
import { validate } from '../../middleware/validate';

import { AddRecipeValidatorSchema } from '../../utils/validators/recipeValidator';
import { Types } from 'mongoose';
import { RecipeType } from '../../models/recipeModel';
import { handleImagesRead } from '../../helpers/handleImagesRead';
import { searchRecipeById } from '../../services/recipeServices';

const router: Router = Router();

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

export default router;