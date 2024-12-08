import { addProductFunction } from "./product/addProduct";
import { getProductFunction } from "./product/getProduct";
import { deleteProductFunction } from "./product/deleteProduct";

export const getProduct = getProductFunction;
export const addProduct = addProductFunction;
export const deleteProduct = deleteProductFunction;