// Importing express and hashing libraries
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import fs from "fs/promises";

import {
  IGetUserValidatorSchema,
  ICreateUserValidatorSchema,
  IUpdateUserValidatorSchema,
} from "../utils/validators/userValidator";
import UserSchema, {
  DeviceInfoSchemaType,
  UserType,
} from "../models/userModel";
import { searchUser } from "../services/userServices";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt";
import User from "../models/userModel";

const SALT_ROUNDS: number = Number(process.env.SALT_ROUNDS) || 10;

export const checkToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

    res.status(200).json("Token is valid.");
  } catch (err) {
    next(err);
    return;
  }
};

export const checkTokenStrict = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

    res.status(200).json("Token is valid.");
  } catch (err) {
    next(err);
    return;
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json("No refresh token provided.");
    return;
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      res.status(401).json("Invalid refresh token.");
      return;
    }
    const user = await User.findById(decoded.sub);

    if (!user) {
      res.status(404).json("User not found for this token.");
      return;
    }

    if (user.refreshToken !== refreshToken) {
      res.status(403).send("Token is invalid.");
      return;
    }

    const accessToken = generateAccessToken(user._id as string, user.roles);
    const newRefreshToken = generateRefreshToken(user._id as string);
    user.jwtToken = accessToken;
    user.refreshToken = newRefreshToken;

    if (req.useragent) {
      user.devicesLoginInfo.push(req.useragent as DeviceInfoSchemaType);
    }

    await user.save();
    res.status(200).json({ accessToken, newRefreshToken });
    return;
  } catch (err) {
    next(err);
    return;
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body as IGetUserValidatorSchema;

  try {
    const user: UserType | null = await searchUser(email);
    if (!user) {
      res.status(404).json("User not found");
      return;
    }

    const now = new Date();
    if (
      user.nextUnlockTime &&
      now.getTime() > user.nextUnlockTime.getTime() &&
      user.permanentBan == false
    ) {
      user.nextUnlockTime = null as any;
      user.isActive = true;
      user.loginAttempts = 0;
    }

    if (user.loginAttempts + 1 >= 5) {
      const now = new Date();
      const oneMinuteFromNow = new Date(now.getTime() + 60 * 1000);

      user.loginAttempts = 5;
      user.isActive = false;
      user.nextUnlockTime = oneMinuteFromNow;
      res
        .status(403)
        .json(`Maximum logging attempts exceeded. Login again in: one minute.`);
      await user.save();
      return;
    }

    const isMatch: boolean = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.loginAttempts = user.loginAttempts + 1;

      await user.save();
      res.status(401).json("Incorrect password");
      return;
    }

    const accessToken = generateAccessToken(user._id as string, user.roles);
    const refreshToken = generateRefreshToken(user._id as string);

    if (req.useragent) {
      user.devicesLoginInfo.push(req.useragent as DeviceInfoSchemaType);
    }

    user.refreshToken = refreshToken;
    user.jwtToken = accessToken;
    user.loginAttempts = 0;

    await user.save();

    res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    next(err);
    return;
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { username, email, password, dateOfBirth, phoneNumber, country } = req.body as ICreateUserValidatorSchema;

  try {
    if (await searchUser(email, username)) {
      res.status(409).json("User already exists.");
      return;
    }
  } catch (err) {
    next(err);
    return;
  }

  let passwordHash: string;
  try {
    passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  } catch (err) {
    next(err);
    return;
  }

  const user = new UserSchema({
    username,
    email,
    password: passwordHash,
    dateOfBirth,
    phoneNumber,
    country,
    activityLogs: [{ message: "Account creation.", date: new Date() }],
  });

  try {
    if (req.useragent) {
      user.devicesLoginInfo.push(req.useragent as DeviceInfoSchemaType);
    }
    await user.save();
    res
      .status(201)
      .json(
        `User with name: ${username} and email: ${email} created successfully.`
      );
    return;
  } catch (err) {
    next(err);
    return;
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const body: IGetUserValidatorSchema = req.body as IGetUserValidatorSchema;
  const userEmail: string | undefined = body.email;
  const userPassword: string = body.password;

  try {
    const userData: UserType | null = await searchUser(userEmail);
    if (!userData) {
      res.status(409).json("User not found");
      return;
    }

    const isMatch: boolean = await bcrypt.compare(
      userPassword,
      userData.password
    );
    if (!isMatch) {
      res.status(401).json("Incorrect password");
      return;
    }

    await UserSchema.deleteOne({ _id: userData._id });
    res.status(204).json();
  } catch (err) {
    next(err);
    return;
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, newUsername, newPassword, newEmail } =
    req.body as IUpdateUserValidatorSchema;

  try {
    // Searching for user in the db with userName or userEmail
    const userData: UserType | null = await searchUser(email);
    if (!userData) {
      res.status(404).json("User not found");
      return;
    }

    // Checking if the password is correct
    const isMatch: boolean = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      res.status(401).json("Incorrect password");
      return;
    }

    // Updating with specified _id
    if (newUsername) {
      const users = await UserSchema.find({ username: newUsername });
      if (users.length > 0) {
        res.status(409).json("User already exists");
        return;
      }

      userData.activityLogs.push({
        message: `Username changed from ${userData.username} to ${newUsername}.`,
        date: new Date(),
      });
      userData.username = newUsername;
    }
    if (newPassword) {
      const hash: string = await bcrypt.hash(newPassword, SALT_ROUNDS);

      if (password === newPassword) {
        res.status(409).json("Passwords must be different.");
        return;
      }

      userData.activityLogs.push({
        message: `Password changed.`,
        date: new Date(),
      });
      userData.password = hash;
    }
    if (newEmail) {
      const users = await UserSchema.find({ email: newEmail });
      if (users.length > 0) {
        res.status(409).json("User with this email already exists");
        return;
      }

      userData.activityLogs.push({
        message: `Email changed from ${userData.email} to ${newEmail}.`,
        date: new Date(),
      });
      userData.email = newEmail;
    }

    await userData.save();
    res.status(204).json();
  } catch (err) {
    // MongoDB internal errors (findOneAndUpdate or findOne) or bcrypt comparison, hashing errors
    next(err);
    return;
  }
};

export const devicesLoginInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

    res.status(200).json(user.devicesLoginInfo as DeviceInfoSchemaType);
  } catch (err) {
    next(err);
    return;
  }
};

export const userAllInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body as IGetUserValidatorSchema;

  try {
    const user: UserType | null = await searchUser(email);
    if (!user) {
      res.status(404).json("User not found");
      return;
    }

    const isMatch: boolean = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json("Incorrect password");
      return;
    }

    await user.save();

    res.status(200).json(user);
  } catch (err) {
    next(err);
    return;
  }
};

export const getUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json("No token provided.");
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

    const responseData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatarLink: user.avatarLink,
      roles: user.roles,
      accountStatus: user.accountStatus,
      nextUnlockTime: user.nextUnlockTime,
      loginAttempts: user.loginAttempts,
      likedRecipes: user.likedRecipes,
      description: user.description,
      // Additional fields
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
      phoneNumber: user.phoneNumber,
      country: user.country
    };

    res.status(200).json(responseData);
  } catch (err) {
    next(err);
    return;
  }
};

export const setAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { base64Image } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json("No token provided.");
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
      res.status(404).json("User not found.");
      return;
    }

    let photo: string;
    if (base64Image) {
      try {
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const fileName = `${Date.now()}.png`;
        const filePath = `uploads/images/${fileName}`;

        await fs.writeFile(filePath, buffer);
        photo = filePath;
      } catch (err) {
        console.error(err);

        res.status(500).json("Error while saving image.");
        return;
      }
    } else {
      res.status(400).json("No image provided.");
      return;
    }

    user.avatarLink = photo;
    await user.save();

    res.status(200).json(photo);
  } catch (err) {
    next(err);
    return;
  }
};

export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    description,
    firstName,
    lastName,
    username,
    email,
    password,
    currentPassword,
    dateOfBirth,
    phoneNumber,
    country
  } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json("No token provided.");
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
      res.status(404).json("User not found.");
      return;
    }

    // Update fields if provided
    if (description) user.description = description;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (country) user.country = country;

    // Handle username change
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        res.status(400).json("Username already taken.");
        return;
      }
      user.username = username;
    }

    // Handle email change
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json("Email already in use.");
        return;
      }
      user.email = email;
      user.isEmailVerified = false; // Require re-verification
    }

    // Handle password change
    if (password && currentPassword) {
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isValidPassword) {
        res.status(401).json("Current password is incorrect.");
        return;
      }
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      user.password = hashedPassword;
      user.passwordLastChangedAt = new Date();
    }

    await user.save();

    // Return updated user info (excluding sensitive data)
    const userInfo = {
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      description: user.description,
      avatarLink: user.avatarLink,
      dateOfBirth: user.dateOfBirth,
      phoneNumber: user.phoneNumber,
      country: user.country
    };

    res.status(200).json(userInfo);
  } catch (err) {
    next(err);
    return;
  }
};
