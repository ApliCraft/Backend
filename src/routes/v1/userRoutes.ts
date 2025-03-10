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
import _ from "ollama/browser";
import Planner, { FluidType, MealType } from "../../models/plannerModel";

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

const getCurrentDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // months are zero-indexed
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (dateObj: any) => {
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0"); // months are zero-indexed
  const day = dateObj.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const addMealSchema = z.object({
  date: z.coerce.date(),
  type: z.enum(["product", "recipe"]),
  _id: z.string(), // product or recipe valid mongodb _id
  category: z.string(),
  portion: z.number(), // if product => amount, if recipe => portion
  completed: z.boolean().default(false),
});

// @ts-ignore
const getHourAndMinutes = (dateObj) => {
  const hours = dateObj.getHours().toString().padStart(2, "0"); // Get the hours and pad with leading zero if necessary
  const minutes = dateObj.getMinutes().toString().padStart(2, "0"); // Get the minutes and pad with leading zero if necessary

  return `${hours}:${minutes}`;
};

router.post("/planner/add-meal", async (req, res) => {
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

    let parsed;
    try {
      parsed = addMealSchema.parse(req.body);
    } catch (err) {
      console.log(err);
      res.status(400).json("Some data is missing in your request");
      return;
    }

    const { _id } = parsed;

    if (!isValidObjectId(_id)) {
      res.status(400).json("Not correct _id.");
      return;
    }

    const { date, category, completed, type, portion } = parsed;

    const dateString = formatDate(date);

    const planner = await Planner.findOne({
      userId: user._id,
      day: dateString,
    });

    if (!planner) {
      const newPlanner = new Planner({
        day: dateString,
        userId: user._id,
      });

      const newMeal: MealType = {
        category,
        time: getHourAndMinutes(date),
        completed,
      };

      if (type == "product") {
        // @ts-ignore
        newMeal.products = [{ productId: _id, amount: portion }];
      }

      if (type == "recipe") {
        // @ts-ignore
        newMeal.recipes = [{ recipeId: _id, portion: portion }];
      }

      newPlanner.planner.meals.push(newMeal);

      await newPlanner.save();

      res.status(200).json("Planner created");
      return;
    }

    const newMeal: MealType = {
      category,
      time: getHourAndMinutes(date),
      completed,
    };

    if (type == "product") {
      // @ts-ignore
      newMeal.products = [{ productId: _id, amount: portion }];
    }

    if (type == "recipe") {
      // @ts-ignore
      newMeal.recipes = [{ recipeId: _id, portion: portion }];
    }

    planner.planner.meals.push(newMeal);

    await planner.save();

    res.status(200).json(dateString);
  } catch (err) {
    console.log(err);
    res.status(500);
    return;
  }
});

const addFluidSchema = z.object({
  date: z.coerce.date(),
  _id: z.string(), // product or recipe valid mongodb _id
  amount: z.number(), // if product => amount, if recipe => portion
});

router.post("/planner/add-fluid", async (req, res) => {
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

    let parsed;
    try {
      parsed = addFluidSchema.parse(req.body);
    } catch (err) {
      console.log(err);
      res.status(400).json("Some data is missing in your request");
      return;
    }

    const { _id } = parsed;

    if (!isValidObjectId(_id)) {
      res.status(400).json("Not correct _id.");
      return;
    }

    const { date, amount } = parsed;

    const dateString = formatDate(date);

    const planner = await Planner.findOne({
      userId: user._id,
      day: dateString,
    });

    if (!planner) {
      const newPlanner = new Planner({
        day: dateString,
        userId: user._id,
      });

      newPlanner.planner.fluids.push({
        fluidId: _id,
        amount,
      });

      await newPlanner.save();

      res.status(200).json("Planner created");
      return;
    }

    planner.planner.fluids.push({
      fluidId: _id,
      amount,
    });

    await planner.save();

    res.status(200).json(dateString);
  } catch (err) {
    console.log(err);
    res.status(500);
    return;
  }
});

const mealsSchema = z.object({
  date: z.coerce.date(),
});

router.post("/planner/meals", async (req, res) => {
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

    let parsed;
    try {
      parsed = mealsSchema.parse(req.body);
    } catch {
      res.status(400).json("not all data specified in request");
      return;
    }

    const { date } = parsed;

    const dateString = formatDate(date);

    const planner = await Planner.findOne({
      userId: user._id,
      day: dateString,
    }).lean();

    if (!planner) {
      res
        .status(404)
        .json("Planner doesn't exist for this day, add some products");
      return;
    }

    res.status(200).json(planner);
  } catch (err) {
    console.log(err);
    res.status(500).json();
    return;
  }
});

router.post("/planner/add-fluid", async (req, res) => {
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

    let parsed;
    try {
      parsed = addFluidSchema.parse(req.body);
    } catch (err) {
      console.log(err);
      res.status(400).json("Some data is missing in your request");
      return;
    }

    const { _id } = parsed;

    if (!isValidObjectId(_id)) {
      res.status(400).json("Not correct _id.");
      return;
    }

    const { date, amount } = parsed;

    const dateString = formatDate(date);

    const planner = await Planner.findOne({
      userId: user._id,
      day: dateString,
    });

    if (!planner) {
      const newPlanner = new Planner({
        day: dateString,
        userId: user._id,
      });

      newPlanner.planner.fluids.push({
        fluidId: _id,
        amount,
      });

      await newPlanner.save();

      res.status(200).json("Planner created");
      return;
    }

    planner.planner.fluids.push({
      fluidId: _id,
      amount,
    });

    await planner.save();

    res.status(200).json(dateString);
  } catch (err) {
    console.log(err);
    res.status(500);
    return;
  }
});

router.delete("/planner/remove-meal/:id", async (req, res) => {
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

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json("wrong id");
      return;
    }

    const mealId = new mongoose.Types.ObjectId(id);

    const result = await Planner.findOneAndUpdate(
      { userId: user._id, "planner.meals._id": mealId },
      { $pull: { "planner.meals": { _id: mealId } } },
      { new: true }
    );

    if (result) {
      res.status(200).json("meal deleted");
      return;
    }

    res.status(404).json("meal not found or not belongs to you");
  } catch (err) {
    console.log(err);
    res.status(500).json();
    return;
  }
});

router.delete("/planner/remove-fluid/:id", async (req, res) => {
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

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json("wrong id");
      return;
    }

    const fluidId = new mongoose.Types.ObjectId(id);

    const result = await Planner.findOneAndUpdate(
      { userId: user._id, "planner.fluids._id": fluidId },
      { $pull: { "planner.fluids": { _id: fluidId } } },
      { new: true }
    );

    if (result) {
      res.status(200).json("fluid deleted");
      return;
    }

    res.status(404).json("fluid not found or not belongs to you");
  } catch (err) {
    console.log(err);
    res.status(500).json();
    return;
  }
});

export default router;
