import { Router } from 'express';
import { getUser, createUser } from "../../controllers/userController";
import validate from "../../middleware/validate";
import { CreateUserValidatorSchema, GetUserValidatorSchema } from "../../utils/validators/userValidator";

const router: Router = Router();

router.get("/getUser", validate(GetUserValidatorSchema), getUser);
router.post("/createUser", validate(CreateUserValidatorSchema), createUser);

export default router;