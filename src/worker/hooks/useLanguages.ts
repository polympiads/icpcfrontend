import { useFeed } from "../context/FeedContext";

export function useLanguages () {
  const feed = useFeed();

  return () => feed.languages;
}
