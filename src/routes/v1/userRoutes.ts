import { Router } from 'express';
import { getUser, createUser } from "../../controllers/userController";
import validate from "../../middleware/validate";
import UserValidatorSchema from "../../utils/validators/userValidator";

const router: Router = Router();

router.get("/getUser", validate(UserValidatorSchema), getUser);
router.post("/createUser", validate(UserValidatorSchema), createUser);

export default router;