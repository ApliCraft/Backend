import { Router } from 'express';
// import { , createUser, deleteUser, updateUser } from "../../controllers/userController";
import { validate } from "../../middleware/validate";
import { CreateUserValidatorSchema, GetUserValidatorSchema } from "../../utils/validators/userValidator";
import { createUser, loginUser, refreshAccessToken, checkToken, checkTokenStrict } from '../../controllers/userController';

const router: Router = Router();

router.post("/login", validate(GetUserValidatorSchema), loginUser);
router.post("/", validate(CreateUserValidatorSchema), createUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/check-token', checkToken);
router.post('/check-token-strict', checkTokenStrict);

// router.delete("/", validate(GetUserValidatorSchema), deleteUser);
// router.put("/", validate(UpdateUserValidatorSchema), updateUser);
// router.post("/check", authenticateToken, async (req, res) => {
//     const token = req.tokenData;
//     const isAuthenticated = req.isAuthenticated;
//     const username = token.name;

//     console.log(token, isAuthenticated, username);
//     if (!token || !isAuthenticated || !username) {
//         res.status(401).json('Unauthenticated');
//         return;
//     }
// })

export default router;