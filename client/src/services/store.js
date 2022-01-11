import axios from "axios";
import { toast } from "react-toastify";

export const getProducts = async (game) => {
  try {
    const res = await axios.get(`/game/${game}/store/products`);
    return res.data;
  } catch (err) {
    toast.error("Error while loading products. See console for more details");
    return console.log(err);
  }
};

export const postProduct = async (game, product) => {
  try {
    const res = await axios.post(`/game/${game}/store/products`, product);
    return res.data;
  } catch (err) {
    toast.error("Error while creating products. See console for more details");
    return console.log(err);
  }
};

export const updateProduct = async (game, product) => {
  try {
    const res = await axios.put(
      `/game/${game}/store/products/${product.productId}`,
      product
    );
    return res.data;
  } catch (err) {
    toast.error("Error while updating products. See console for more details");
    return console.log(err);
  }
};

export const deleteProduct = async (game, productId) => {
  try {
    const res = await axios.delete(`/game/${game}/store/products/${productId}`);
    return res.data;
  } catch (err) {
    toast.error("Error while deleting products. See console for more details");
    return console.log(err);
  }
};
