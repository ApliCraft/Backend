import { Router } from 'express';
import { getUser, createUser, deleteUser } from "../../controllers/userController";
import { validate/*, authenticateToken*/ } from "../../middleware/validate";
import { CreateUserValidatorSchema, GetUserValidatorSchema } from "../../utils/validators/userValidator";

const router: Router = Router();

router.get("/getUser", /*authenticateToken,*/ validate(GetUserValidatorSchema), getUser);
router.post("/createUser", validate(CreateUserValidatorSchema), createUser);
router.delete("/deleteUser", validate(GetUserValidatorSchema), deleteUser);

export default router;