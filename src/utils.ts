export function sortRecordValues<T extends Record<string, any>>(
  record: T,
  key: (v: T) => any,
  direction: "asc" | "desc" = "asc",
): T[keyof T][] {
  const values = Object.values(record);

  return values.sort((a, b) => {
    const av = key(a);
    const bv = key(b);

    if (av == null) return 1;
    if (bv == null) return -1;

    if (av > bv) return direction === "asc" ? 1 : -1;
    if (av < bv) return direction === "asc" ? -1 : 1;
    return 0;
  });
}
