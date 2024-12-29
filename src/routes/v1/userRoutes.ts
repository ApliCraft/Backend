import { Router } from 'express';
import { validate } from "../../middleware/validate";
import { CreateUserValidatorSchema, GetUserValidatorSchema, UpdateUserValidatorSchema } from "../../utils/validators/userValidator";
import { createUser, loginUser, refreshAccessToken, checkToken, checkTokenStrict, deleteUser, updateUser } from '../../controllers/userController';
import { verifyAccessToken } from '../../utils/jwt';
import User from '../../models/userModel';
import { Types } from 'mongoose';

const router: Router = Router();

router.post("/login", validate(GetUserValidatorSchema), loginUser);
router.post("/", validate(CreateUserValidatorSchema), createUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/check-token', checkToken);
router.post('/check-token-strict', checkTokenStrict);
router.delete("/", validate(GetUserValidatorSchema), deleteUser);
router.put("/", validate(UpdateUserValidatorSchema), updateUser);
router.get("/logs", async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(400).json('No token provided');
        return;
    }

    try {
        const decoded = verifyAccessToken(token);
        if (!decoded) {
            res.status(401).json('Invalid token.');
            return;
        }

        const user = await User.findById(decoded.sub);

        if (!user) {
            res.status(404).json('User not found for this token.');
            return;
        }

        if (user.jwtToken !== token) {
            res.status(403).send('Token is invalid.');
            return;
        }

        res.status(200).json(user.activityLogs);
    } catch (err) {
        next(err);
        return;
    }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
        res.status(400).json('Invalid user id.');
        return;
    }

    const user = await User.findById(id);

    if (!user) {
        res.status(404).json("User not found.");
        return;
    }

    const userInfo = {
        _id: user._id,
        email: user.email,
        username: user.username,
        signInDate: user.signInDate,
    }
    res.status(200).json(userInfo);
});

export default router;
