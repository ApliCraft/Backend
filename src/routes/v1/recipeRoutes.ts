import { Router } from 'express';
import { getRecipes } from '../../controllers/recipeController';

const router: Router = Router();

router.get("/", getRecipes);

export default router;