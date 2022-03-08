export const parseTx = (tx) => {
  const reg = /[ ]*([^:, ]+) *: *([+-]* *[0-9.]+)[ ]*/g;
  if (tx.match(reg)) {
    const filtered = tx
      .split(reg)
      .filter((each) => each !== "" && each !== ",");

    const obj = {};
    for (let i = 0; i < filtered.length; i += 2) {
      const ccy = filtered[i];
      if(isNaN(parseFloat(filtered[i + 1]))){
        return null
      }
      obj[ccy] = parseFloat(filtered[i + 1]);
    }
    return obj;
  } else {
    return null;
  }
};

export const printTx = (tx) => {
  const args = (() => {
    const result = [];
    for (let prop in tx) {
      const value = tx[prop];
      result.push(prop + ": " + value);
    }
    return result;
  })();
  return args.join(", ");
};
