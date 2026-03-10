import { createMemo } from "solid-js";
import { useFeed } from "../context/FeedContext";

export function useLanguages () {
  const feed = useFeed();

  return createMemo(() => feed.languages);
}
