import { Router } from 'express';
import { getUser, createUser, deleteUser } from "../../controllers/userController";
import validate from "../../middleware/validate";
import { CreateUserValidatorSchema, GetUserValidatorSchema } from "../../utils/validators/userValidator";

const router: Router = Router();

router.get("/getUser", validate(GetUserValidatorSchema), getUser);
router.post("/createUser", validate(CreateUserValidatorSchema), createUser);
router.delete("/deleteUser", validate(GetUserValidatorSchema), deleteUser);

export default router;