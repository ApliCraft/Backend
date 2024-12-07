import { Router } from 'express';
import { getRecipe, addRecipe } from '../../controllers/recipeController';
import { validate } from '../../middleware/validate';

import { AddRecipeValidatorSchema } from '../../utils/validators/recipeValidator';

const router: Router = Router();

router.get("/", getRecipe);
router.post("/", validate(AddRecipeValidatorSchema), addRecipe)

export default router;