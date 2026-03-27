import { createMemo } from "solid-js";
import { useFeed } from "../context/FeedContext";
import { judgementTypeDictsEquals, judgementTypeEquals } from "../types/data/JudgementTypes";

export function useJudgementTypes () {
  const feed = useFeed();

  return createMemo(() => {
    return feed().judgementTypes
  }, undefined, {
    equals: judgementTypeDictsEquals
  });
}
export function useJudgementType (judgementTypeId: string) {
  const feed = useFeed();

  return createMemo(() => {
    return feed().judgementTypes[judgementTypeId]
  }, undefined, {
    equals: judgementTypeEquals
  });
}
