import { createMemo } from "solid-js";
import { useFeed } from "../context/FeedContext";

export function useContest () {
  const feed = useFeed();
  
  return createMemo(() => feed.contest);
}
export function useContestState () {
  const feed = useFeed();

  return createMemo(() => feed.contestState);
}
