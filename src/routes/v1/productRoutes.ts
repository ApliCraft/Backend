import { Router } from 'express';
import { getProducts, addProduct, deleteProduct, filterProducts } from '../../controllers/productController';
import { validate } from '../../middleware/validate';
import { AddProductValidatorSchema } from '../../utils/validators/productValidator';
import { searchProductById } from '../../services/productServices';
import { Types } from 'mongoose';
import { ProductType } from '../../models/productModel';
import { handleImagesRead } from '../../helpers/handleImagesRead';

const router: Router = Router();

router.get("/:id", async (req, res, next) => {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
        res.status(400).json('Invalid MongoDB ObjectId');
        return;
    }

    try {
        const product: (ProductType & { base64Image?: string }) | null = await searchProductById(id);

        if (!product) {
            res.status(404).json('Product not found.');
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
router.post("/get", getProducts);
// router.post("/search", searchProducts);
router.post("/filter", filterProducts);
router.post("/add", validate(AddProductValidatorSchema), addProduct);
router.delete("/delete", deleteProduct);

export default router;