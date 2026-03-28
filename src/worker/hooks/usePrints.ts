import { createMemo } from "solid-js";
import { useFeed } from "../context/FeedContext";
import { printDictsEquals, printEquals } from "../types/data/Print";

export function usePrints () {
  const feed = useFeed();

  return createMemo(() => {
    return feed().prints
  }, undefined, {
    equals: printDictsEquals
  });
}
export function usePrint (printId: string) {
  const feed = useFeed();

  return createMemo(() => {
    return feed().prints[printId]
  }, undefined, {
    equals: printEquals
  });
}
