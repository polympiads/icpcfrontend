import { createMemo } from "solid-js";
import { useFeed } from "../context/FeedContext";

export function useJudgementTypes () {
  const feed = useFeed();

  return createMemo(() => feed.judgementTypes);
}
