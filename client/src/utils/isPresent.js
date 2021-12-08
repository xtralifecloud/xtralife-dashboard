export const isPresent = (objs) => {
  return objs.every((obj) => {
    return (
      Object.getPrototypeOf(obj) === Object.prototype &&
      Object.keys(obj).length !== 0
    );
  });
};
