export function haveSameKeys(
  obj1: { [key: string]: any },
  obj2: { [key: string]: any },
) {
  const keys1 = Object.keys(obj1).sort();
  const keys2 = Object.keys(obj2).sort();

  if (keys1.length !== keys2.length) return false;

  return keys1.every((key, index) => key === keys2[index]);
}
export function dictsEqual<T>(
  d1: { [key: string]: T },
  d2: { [key: string]: T },
  f: (x: T | undefined, y: T | undefined) => boolean,
) {
  if (!haveSameKeys(d1, d2)) return false;

  for (const key of Object.keys(d1)) {
    if (!f(d1[key], d2[key])) {
      return false;
    }
  }

  return true;
}
