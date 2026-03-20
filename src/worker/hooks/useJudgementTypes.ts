import { useFeed } from "../context/FeedContext";

export function useJudgementTypes () {
  const feed = useFeed();

  return () => feed.judgementTypes;
}
