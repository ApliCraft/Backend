import { Request, Response, NextFunction } from "express";
import fs from "fs/promises";

import RecipeSchema, { ImageType, RecipeType } from "../models/recipeModel";
import { searchRecipes, searchRecipesPl } from "../services/recipeServices";
import { IAddRecipeValidatorSchema } from "../utils/validators/recipeValidator";
import { searchProductById } from "../services/productServices";
import { isValidObjectId, Types } from "mongoose";
import User from "../models/userModel";
import { verifyAccessToken } from "../utils/jwt";
import { z } from "zod";
import Recipe from "../models/recipeModel";
import { generateEmbedding } from "../services/ollama";

const schema = z.object({
  query: z.string(),
});

export const vectorSearchRecipe = async (req: Request, res: Response) => {
  try {
    let searchQuery;
    try {
      const { query } = schema.parse(req.body);
      searchQuery = query;
    } catch (err) {
      res.status(400).json(err);
      return;
    }

    const searchVector = await generateEmbedding(searchQuery);

    const result = await Recipe.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: searchVector[0],
          numCandidates: 25,
          limit: 5,
        },
      },
    ]);

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { searchTerm, sendImages } = req.body;

  try {
    let recipes: (RecipeType & { base64Image?: string })[] =
      await searchRecipes(searchTerm);

    if (sendImages) {
      console.log(sendImages);
      recipes = await Promise.all(
        recipes.map(
          async (
            recipe: RecipeType & { base64Image?: string }
          ): Promise<RecipeType & { base64Image?: string }> => {
            if (recipe.photo) {
              const imagePath = recipe.photo.filePath;

              try {
                await fs.access(imagePath);

                const imageBuffer = await fs.readFile(imagePath);
                const base64Image = imageBuffer.toString("base64");
                recipe.base64Image = base64Image;
              } catch (err) {
                // err if image does not exist
              }
            }

            return recipe;
          }
        )
      );
    }

    res.status(200).json(recipes);

    return;
  } catch (err) {
    return next(err);
  }
};

export const addRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    prepareTime,
    difficulty,
    ingredients,
    plName,
    category,
    author,
    privacy,
    preDescription,
    description,
    preparation,
    keyWords,
    base64Image,
  } = req.body as IAddRecipeValidatorSchema;
  let kcalPortion: number = 0;
  let proteinPortion: number = 0;
  let carbohydratesPortion: number = 0;
  let fatContentPortion: number = 0;
  let excludedDiets: string[] = [];
  let allergens: string[] = [];

  if (!Types.ObjectId.isValid(author)) {
    res.status(400).json("Invalid author id.");
    return;
  }

  const authorData = await User.findById(author);
  if (!authorData) {
    res.status(404).json("Author not found");
    return;
  }

  // checks if user specified correct ingredient productId
  ingredients.forEach((ingredient) => {
    if (!Types.ObjectId.isValid(ingredient.productId)) {
      res.status(400).json("Invalid MongoDB ObjectId");
      return;
    }
  });

  // name must be unique, this code ensures that it is unique
  try {
    const recipes: RecipeType[] = await searchRecipes(name);
    if (recipes.length > 0) {
      res.status(409).json(`Recipe with name ${name} already exists.`);
      return;
    }
  } catch (err) {
    next(err);
    return;
  }

  // plName must be unique, this code ensures that it is unique
  if (plName) {
    try {
      const products: RecipeType[] = await searchRecipesPl(plName);
      if (products.length > 0) {
        res.status(409).json(`Recipe with name ${plName} already exists.`);
        return;
      }
    } catch (err) {
      next(err);
      return;
    }
  }

  // checking privacy value
  if (privacy !== "public" && privacy !== "private") {
    res.status(400).json(`Privacy must be public or private.`);
    return;
  }

  // check if ingredients are empty
  if (ingredients.length == 0) {
    res.status(400).json(`Ingredients array cannot be empty.`);
    return;
  }

  // checking if ingredients exist
  const productErrors: string[] = [];
  await Promise.all(
    ingredients.map(async (ingredient) => {
      const product = await searchProductById(ingredient.productId);

      if (!product) {
        productErrors.push(
          `Ingredient with id: ${ingredient.productId} doesn't exist.`
        );
      } else {
        kcalPortion += product.kcalPortion * ingredient.quantity;
        proteinPortion += product.proteinPortion * ingredient.quantity;
        carbohydratesPortion +=
          product.carbohydratesPortion * ingredient.quantity;
        fatContentPortion += product.fatContentPortion * ingredient.quantity;

        allergens = [...new Set([...allergens, ...product.allergens])];
        excludedDiets = [
          ...new Set([...excludedDiets, ...product.excludedDiets]),
        ];
      }
    })
  );

  if (productErrors.length > 0) {
    res.status(404).json(productErrors);
    return;
  }

  let photo: ImageType | undefined;
  if (base64Image) {
    try {
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const fileName = `${name}-${Date.now()}.png`;
      const filePath = `uploads/images/${fileName}`;

      await fs.writeFile(filePath, buffer);
      photo = {
        fileName,
        filePath,
      };
    } catch (err) {
      next(err);
      return;
    }
  }

  const newRecipe = new RecipeSchema({
    photo,
    plName,
    prepareTime,
    difficulty,
    ingredients,
    privacy,
    preDescription,
    name,
    author: [],
    likeQuantity: 0,
    saveQuantity: 0,
    description,
    preparation,
    keyWords: keyWords || [],
    kcalPortion,
    proteinPortion,
    carbohydratesPortion,
    fatContentPortion,
    category,
    excludedDiets: excludedDiets || [],
    allergens: allergens || [],
  });

  newRecipe.author.push(authorData);

  try {
    await newRecipe.save();

    res.status(201).json(`Recipe with name ${name} created successfully.`);
    return;
  } catch (err) {
    return next(err);
  }
};

export const getRecipeIdsByFilter = async (req: Request, res: Response) => {
  const { category, from, limit, privacy, liked } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (privacy && !token) {
    res.status(401).json("Token required to access private recipes");
    return;
  }

  if (liked && !token) {
    res.status(401).json("Token required to access liked recipes");
    return;
  }

  let query;
  let queryConditions: any = {};
  let likedRecipes: string[] = [];

  if (token) {
    try {
      const decoded = verifyAccessToken(token);

      if (!decoded) {
        res.status(401).json("Unauthorized");
        return;
      }

      if (!isValidObjectId(decoded.sub)) {
        res.status(401).json("Unauthorized");
        return;
      }

      const user = await User.findById(decoded.sub);

      if (!user) {
        res.status(401).json("Unauthorized");
        return;
      }

      if (liked) {
        likedRecipes = user.likedRecipes.map((recipe) => recipe.toString());
      }

      if (privacy === "private") {
        queryConditions = {
          privacy: "private",
          author: user._id,
        };
      } else {
        queryConditions = {};
      }
    } catch (err) {
      console.log(err);
      res.status(401).json("Unauthorized");
      return;
    }
  }

  if (category) {
    queryConditions.category = category;
  }

  query = RecipeSchema.find(queryConditions, { _id: 1 }).lean().select("_id");

  if (liked && likedRecipes.length > 0) {
    query = query.find({ _id: { $in: likedRecipes } });
  }

  if (from !== undefined && limit !== undefined) {
    query = query.skip(from).limit(limit);
  }

  const recipeIds = await query;

  res.status(200).json(recipeIds);
};

export const getLikedRecipes = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json("Token required to access liked recipes");
    return;
  }

  try {
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      res.status(401).json("Unauthorized");
      return;
    }

    if (!isValidObjectId(decoded.sub)) {
      res.status(401).json("Unauthorized");
      return;
    }

    const user = await User.findById(decoded.sub);
    if (user) {
      res.status(200).json(user.likedRecipes);
      return;
    }
  } catch (err) {
    res.status(401).json("Unauthorized");
    return;
  }

  res.status(401).json("Unauthorized");
};
