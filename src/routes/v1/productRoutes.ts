import { Router } from 'express';
import { getProduct, addProduct } from '../../controllers/productController';
import { validate } from '../../middleware/validate';
import { AddProductValidatorSchema } from '../../utils/validators/productValidator';

const router: Router = Router();

router.get("/", getProduct);
router.post("/", validate(AddProductValidatorSchema), addProduct);

export default router;