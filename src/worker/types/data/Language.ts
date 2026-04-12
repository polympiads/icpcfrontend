import { dictsEqual } from "./List";

export type Language = {
  id: string;
  name: string;

  extensions: string[];
};

export function languageEquals(
  j1: Language | undefined,
  j2: Language | undefined,
) {
  if (j1 === undefined && j2 === undefined) return true;
  if (j1 === undefined || j2 === undefined) return false;

  return j1.id == j2.id && j1.name == j2.name && j1.extensions == j2.extensions;
}
export function languageDictsEquals(
  j1: { [key: string]: Language },
  j2: { [key: string]: Language },
) {
  return dictsEqual(j1, j2, languageEquals);
}
