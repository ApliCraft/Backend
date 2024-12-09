import { addProductFunction } from "./product/addProduct";
import { getProductsFunction } from "./product/getProducts";
import { deleteOneProductFunction } from "./product/deleteProduct";
// import { searchProductsFunction } from "./product/searchProducts";
import { filterProductsFunction } from "./product/filterProducts";
import { getRecipesByProductIdsFunction } from "./product/getRecipesByIds";

export const getProducts = getProductsFunction;
export const addProduct = addProductFunction;
export const deleteProduct = deleteOneProductFunction;
// export const searchProducts = searchProductsFunction;
export const filterProducts = filterProductsFunction;
export const getRecipesByProductIds = getRecipesByProductIdsFunction;