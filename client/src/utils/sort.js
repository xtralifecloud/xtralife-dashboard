export const sortObjectByKeys = (obj, order) => {
  const sorted = Object.keys(obj)
    .sort()
    // eslint-disable-next-line no-sequences
    .reduce((r, k) => ((r[k] = obj[k]), r), {});
  if (order === "asc") return sorted;
  return Object.keys(sorted)
    .reverse()
    .reduce((a, key) => {
      a[key] = obj[key];
      return a;
    }, {});
};

export const sortObjectByValues = (obj, order) => {
  if (order === "asc") {
    return Object.entries(obj)
      .sort(([, a], [, b]) => a - b)
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
  } else {
    return Object.entries(obj)
      .sort(([, a], [, b]) => b - a)
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
  }
};
