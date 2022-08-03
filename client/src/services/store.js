import axios from "axios";
import { toast } from "react-toastify";

export const getProducts = async (game, skip, limit) => {
  try {
    const res = await axios.get(`/game/${game}/store/products?skip=${skip}&limit=${limit}`);
    return res.data;
  } catch (err) {
    toast.error("Error while loading products. See console for more details");
    return console.log(err);
  }
};

export const postProduct = async (game, product) => {
  try {
    const res = await axios.post(`/game/${game}/store/products`, product);
    if (res.status === 200) {
      toast.success("Product created successfully");
    }
    return res.data;
  } catch (err) {
    toast.error("Error while creating products. See console for more details");
    return console.log(err);
  }
};

export const putProducts = async (game, products, cb = null) => {
  try {
    const res = await axios.put(`/game/${game}/store/products`, products);
    if (res.status === 200) {
      toast.success("Products updated successfully");
    }
    if (cb) {
      const products = await getProducts(game);
      return cb(products);
    }
    return res.data;
  } catch (err) {
    toast.error("Error while creating products. See console for more details");
    return console.log(err);
  }
};

export const updateProduct = async (game, product, cb = null) => {
  try {
    const res = await axios.put(
      `/game/${game}/store/products/${product.productId}`,
      product
    );
    if (res.status === 200) {
      toast.success("Product updated successfully");
    }
    return res.data;
  } catch (err) {
    toast.error("Error while updating products. See console for more details");
    return console.log(err);
  }
};

export const deleteProduct = async (game, productId) => {
  try {
    const res = await axios.delete(`/game/${game}/store/products/${productId}`);
    if (res.status === 200) {
      toast.success("Product deleted successfully");
    }
    return res.data;
  } catch (err) {
    toast.error("Error while deleting products. See console for more details");
    return console.log(err);
  }
};
