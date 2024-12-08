import { Router } from 'express';
import { getProduct, addProduct, deleteProduct } from '../../controllers/productController';
import { validate } from '../../middleware/validate';
import { AddProductValidatorSchema } from '../../utils/validators/productValidator';

const router: Router = Router();

router.post("/get", getProduct);
router.post("/addOne", validate(AddProductValidatorSchema), addProduct);
router.delete("/deleteOne", deleteProduct);

export default router;