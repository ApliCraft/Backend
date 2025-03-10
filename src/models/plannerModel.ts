import mongoose, { InferSchemaType, model, Schema, Types } from "mongoose";

const AdditionalProductSchema = new Schema({
  _id: { type: Types.ObjectId, required: true, ref: "Product" },
  amount: { type: Number, required: true },
});

const FluidEntrySchema = new Schema({
  fluidId: { type: Types.ObjectId, required: true, ref: "Product" },
  amount: { type: Number, required: true },
  additional: { type: [AdditionalProductSchema], default: [] },
});

const ProductEntrySchema = new Schema({
  productId: { type: Types.ObjectId, required: true, ref: "Product" },
  amount: { type: Number, required: true },
});

const RecipeEntrySchema = new Schema({
  recipeId: { type: Types.ObjectId, required: true, ref: "Recipe" },
  portion: { type: Number, required: true, default: 1 },
});

const MealSchema = new Schema({
  _id: { type: Types.ObjectId, auto: true, required: false },
  category: { type: String, required: true },
  time: { type: String, required: true },
  completed: { type: Boolean, default: false },
  products: { type: [ProductEntrySchema], default: [], required: false },
  recipes: { type: [RecipeEntrySchema], default: [], required: false },
});

const SingleDaySchema = new Schema({
  fluids: { type: [FluidEntrySchema], default: [] },
  meals: { type: [MealSchema], default: [] },
});

const plannerSchema = new Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      auto: true,
    },
    day: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fluidIntakeAmount: {
      required: true,
      default: 2000,
      type: Number,
    },
    planner: {
      type: SingleDaySchema,
      required: true,
      default: {
        fluids: [],
        meals: [],
      },
    },
  },
  { timestamps: true }
);

export type FluidType = InferSchemaType<typeof FluidEntrySchema>;
export type MealType = InferSchemaType<typeof MealSchema>;
export type PlannerType = InferSchemaType<typeof plannerSchema>;
const Planner = model<PlannerType>("Planner", plannerSchema);
export default Planner;
