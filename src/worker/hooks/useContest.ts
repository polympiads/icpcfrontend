import { createMemo } from "solid-js";
import { useFeed } from "../context/FeedContext";
import { contestEquals, contestStateEquals } from "../types/data/Contest";

export function useContest() {
  const feed = useFeed();

  return createMemo(
    () => {
      return feed().contest;
    },
    undefined,
    {
      equals: contestEquals,
    },
  );
}
export function useContestState() {
  const feed = useFeed();

  return createMemo(
    () => {
      return feed().contestState;
    },
    undefined,
    {
      equals: contestStateEquals,
    },
  );
}
