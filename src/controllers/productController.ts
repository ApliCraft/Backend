import { addProductFunction } from "./product/addProduct";
import { getProductsFunction } from "./product/getProducts";
import { deleteOneProductFunction } from "./product/deleteProduct";
// import { searchProductsFunction } from "./product/searchProducts";
import { filterProductsFunction } from "./product/filterProducts";

export const getProducts = getProductsFunction;
export const addProduct = addProductFunction;
export const deleteProduct = deleteOneProductFunction;
// export const searchProducts = searchProductsFunction;
export const filterProducts = filterProductsFunction;