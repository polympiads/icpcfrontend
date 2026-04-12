import { createMemo } from "solid-js";
import { useFeed } from "../context/FeedContext";
import { languageDictsEquals, languageEquals } from "../types/data/Language";

export function useLanguages() {
  const feed = useFeed();

  return createMemo(
    () => {
      return feed().languages;
    },
    undefined,
    {
      equals: languageDictsEquals,
    },
  );
}
export function useLanguage(languageId: string) {
  const feed = useFeed();

  return createMemo(
    () => {
      return feed().languages[languageId];
    },
    undefined,
    {
      equals: languageEquals,
    },
  );
}
