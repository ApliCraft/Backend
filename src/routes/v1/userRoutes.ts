import { Router } from 'express';
import { getUser, createUser, deleteUser, updateUser } from "../../controllers/userController";
import { validate/*, authenticateToken*/ } from "../../middleware/validate";
import { CreateUserValidatorSchema, GetUserValidatorSchema, UpdateUserValidatorSchema } from "../../utils/validators/userValidator";

const router: Router = Router();

router.get("/getUser", validate(GetUserValidatorSchema), getUser);
router.post("/createUser", validate(CreateUserValidatorSchema), createUser);
router.delete("/deleteUser", validate(GetUserValidatorSchema), deleteUser);
router.put("/updateUser", validate(UpdateUserValidatorSchema), updateUser);

export default router;