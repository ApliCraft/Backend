import { Router } from 'express';
import { getUser } from "../../controllers/userController";
import validate from "../../middleware/validate";
import userValidator from "../../utils/validators/userValidator";


const router: Router = Router();

router.get("/getUser", validate(userValidator), getUser);

export default router;