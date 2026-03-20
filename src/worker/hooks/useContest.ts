import { useFeed } from "../context/FeedContext";

export function useContest () {
  const feed = useFeed();
  
  return () => feed.contest;
}
export function useContestState () {
  const feed = useFeed();

  return () => feed.contestState;
}
