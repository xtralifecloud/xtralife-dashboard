import axios from 'axios'

export const getProducts = async (game) => {
  try {
    const res = await axios.get(`/game/${game}/store/products`);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const postProduct = async (game, product) => {
  try {
    const res = await axios.post(`/game/${game}/store/products`, product);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};
