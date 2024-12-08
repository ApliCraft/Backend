import { Router } from 'express';
import { getUser, createUser, deleteUser, updateUser } from "../../controllers/userController";
import { validate } from "../../middleware/validate";
import { CreateUserValidatorSchema, GetUserValidatorSchema, UpdateUserValidatorSchema } from "../../utils/validators/userValidator";

const router: Router = Router();

router.post("/login", validate(GetUserValidatorSchema), getUser);
router.post("/", validate(CreateUserValidatorSchema), createUser);
router.delete("/", validate(GetUserValidatorSchema), deleteUser);
router.put("/", validate(UpdateUserValidatorSchema), updateUser);

export default router;