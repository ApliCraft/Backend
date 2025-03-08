import { Router } from "express";
import { validate } from "../../middleware/validate";
import {
  CreateUserValidatorSchema,
  GetUserValidatorSchema,
  UpdateUserValidatorSchema,
} from "../../utils/validators/userValidator";
import {
  createUser,
  loginUser,
  refreshAccessToken,
  userAllInfo,
  checkToken,
  checkTokenStrict,
  deleteUser,
  updateUser,
  devicesLoginInfo,
  getUserInfo,
  setAvatar,
  updateUserProfile,
} from "../../controllers/userController";
import { verifyAccessToken } from "../../utils/jwt";
import User, { UserType } from "../../models/userModel";
import mongoose, { isValidObjectId, Types } from "mongoose";
import z from "zod";
import Product from "../../models/productModel";

const router: Router = Router();

router.put("/set-avatar", setAvatar);
router.put("/set-description", (_, res) => {
  res.send(500);
});
router.put("/update-user-profile", updateUserProfile);
router.post("/user-all-info-get-now", userAllInfo);
router.get("/user-info", getUserInfo);
router.get("/devices-login-info", devicesLoginInfo);
router.post("/login", validate(GetUserValidatorSchema), loginUser);
router.post("/", validate(CreateUserValidatorSchema), createUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/check-token", checkToken);
router.post("/check-token-strict", checkTokenStrict);
router.delete("/", validate(GetUserValidatorSchema), deleteUser);
router.put("/", validate(UpdateUserValidatorSchema), updateUser);
router.get("/logs", async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(400).json("No token provided");
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      res.status(401).json("Invalid token.");
      return;
    }

    const user = await User.findById(decoded.sub);

    if (!user) {
      res.status(404).json("User not found for this token.");
      return;
    }

    if (user.jwtToken !== token) {
      res.status(403).send("Token is invalid.");
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
    res.status(400).json("Invalid user id.");
    return;
  }

  const user = (await User.findById(id)) as UserType;

  if (!user) {
    res.status(404).json("User not found.");
    return;
  }

  const friendsListLength = user.friendsList.length;
  const likedRecipesLength = user.likedRecipes.length;
  const userInfo = {
    _id: user._id,
    username: user.username,
    signInDate: user.signInDate,
    avatarLink: user.avatarLink,
    friendsList: friendsListLength,
    likedRecipes: likedRecipesLength,
    description: user.description,
    country: user.country,
    // lista przepisy
  };
  res.status(200).json(userInfo);
});

router.put("/friends/add-friend/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json("Invalid user id.");
      return;
    }

    const newFriend = (await User.findById(id)) as UserType;
    if (!newFriend) {
      res.status(404).json("User not found.");
      return;
    }

    const newFriendId = newFriend._id as mongoose.Types.ObjectId;

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(400).json("No token provided");
      return;
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      res.status(401).json("Invalid token.");
      return;
    }

    const user = await User.findOne({
      _id: decoded.sub,
      friendsList: { $nin: [newFriendId] },
    });

    if (!user) {
      res
        .status(404)
        .json("User not found for this token or already in friends list.");
      return;
    }

    if (newFriendId === user._id) {
      res.status(400).json("You cannot add yourself as a friend.");
      return;
    }

    user.friendsList.push(newFriendId);
    await user.save();

    res.status(200).json({
      message: "Friend added successfully.",
      friendsList: user.friendsList,
    });
  } catch (err) {
    res.status(500).json(err);
    return;
  }
});

router.delete("/friends/remove-friend/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json("Invalid user id.");
      return;
    }

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(400).json("No token provided");
      return;
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      res.status(401).json("Invalid token.");
      return;
    }

    const user = await User.findOne({
      _id: decoded.sub,
      friendsList: { $in: [id] },
    });

    if (!user) {
      res.status(404).json("User not found or not in friends list.");
      return;
    }

    const deleteFriend = await User.findById(id);

    if (!deleteFriend) {
      res.status(404).json("Friend not found.");
      return;
    }

    // @ts-ignore
    user.friendsList = user.friendsList.filter(
      (friend) => friend._id.toString() !== deleteFriend._id!.toString()
    );

    await user.save();

    res.status(200).json({
      message: "Friend removed successfully.",
      friendsList: user.friendsList,
    });
  } catch (err) {
    res.status(500).json(err);
    return;
  }
});

router.get("/friends/get/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json("Invalid user id.");
      return;
    }

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json("User not found.");
      return;
    }

    res.status(200).json(user.friendsList);
  } catch (err) {
    res.status(500).json(err);
    return;
  }
});

router.get("/storage/get", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(400).json("No token provided");
      return;
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      res.status(401).json("Invalid token.");
      return;
    }

    const user = await User.findById(decoded.sub);

    if (!user) {
      res.status(404).json("User not found.");
      return;
    }

    res.status(200).json(user.storage);
  } catch (err) {
    res.status(500).json(err);
    return;
  }
});

const schema = z.object({
  productId: z.string().min(1),
  quantity: z.number().min(1),
  unit: z.string().min(1).optional(),
  expirationDate: z.coerce.date().optional(),
});

router.put("/storage/add", async (req, res) => {
  try {
    let { productId, quantity, unit, expirationDate } = schema.parse(req.body);
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(400).json("No token provided");
      return;
    }

    if (!unit) {
      unit = "g/ml";
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      res.status(401).json("Invalid token.");
      return;
    }

    if (!isValidObjectId(productId)) {
      res.status(400).json("Invalid product id.");
      return;
    }

    const product = await Product.findById(productId);

    if (!product) {
      res.status(404).json("Product not found.");
      return;
    }

    const user = await User.findById(decoded.sub);

    if (!user) {
      res.status(404).json("User not found.");
      return;
    }

    if (user.storage.find((item) => item.product!.toString() === productId)) {
      res.status(400).json("Product already in storage.");
      return;
    }

    if (expirationDate) {
      user.storage.push({
        product: productId,
        quantity,
        unit,
        expirationDate,
      });
    } else {
      user.storage.push({
        product: productId,
        quantity,
        unit,
      });
    }

    await user.save();

    res.status(200).json("Product added to storage successfully.");
  } catch {
    res.status(400).json("Invalid request body.");
  }
});

router.delete("/storage/remove/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json("Invalid product id.");
      return;
    }

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(400).json("No token provided");
      return;
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      res.status(401).json("Invalid token.");
      return;
    }

    const user = await User.findById(decoded.sub);

    if (!user) {
      res.status(404).json("User not found.");
      return;
    }

    // @ts-ignore
    user.storage = user.storage.filter(
      (item) => item.product!.toString() !== id
    );

    await user.save();

    res.status(200).json("Product removed from storage successfully.");
  } catch {
    res.status(400).json("Invalid request body.");
  }
});

const updateSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().min(1),
  type: z.enum(["increase", "decrease"]),
});

router.put("/storage/increase-decrease-quantity", async (req, res) => {
  try {
    const { productId, quantity, type } = updateSchema.parse(req.body);

    if (!isValidObjectId(productId)) {
      res.status(400).json("Invalid product id.");
      return;
    }

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(400).json("No token provided");
      return;
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      res.status(401).json("Invalid token.");
      return;
    }

    const user = await User.findById(decoded.sub);

    if (!user) {
      res.status(404).json("User not found.");
      return;
    }

    const product = user.storage.find(
      (item) => item.product!.toString() === productId
    );

    if (!product) {
      res.status(404).json("Product not found in storage.");
      return;
    }

    if (type === "increase") {
      product.quantity += quantity;
    } else {
      product.quantity -= quantity;
    }

    if (product.quantity < 0) {
      res.status(400).json("Product quantity cannot be negative.");
      return;
    }

    await user.save();

    res.status(200).json("Product quantity updated successfully.");
  } catch {
    res.status(400).json("Invalid request body.");
  }
});

export default router;
