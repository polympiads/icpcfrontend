import { createMemo } from "solid-js";
import { useFeed } from "../context/FeedContext";

export function useProblems () {
  const feed = useFeed();

  return createMemo(() => feed.problems)
}
export function useProblem (problemId: string) {
  const feed = useFeed();

  return createMemo(() => feed.problems[problemId]);
}
