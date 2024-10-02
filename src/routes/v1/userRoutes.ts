import { Router } from 'express';
import { getUser } from "../../controllers/userController";

const router: Router = Router();

router.get("/getUser:id", getUser);

export default router;