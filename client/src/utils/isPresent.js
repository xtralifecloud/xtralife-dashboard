export const isPresent = (objs) => {
  if(!objs || objs.join().replace(/,/g,'').length === 0) return false
  return objs.every((obj) => {
    return (
      Object.getPrototypeOf(obj) === Object.prototype &&
      Object.keys(obj).length !== 0
    );
  });
};
