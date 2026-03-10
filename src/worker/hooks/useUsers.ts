import { createMemo } from "solid-js";
import { useFeed } from "../context/FeedContext";

export function useTeams () {
  const feed = useFeed();

  return createMemo(() => feed.teams);
}
export function useAccounts () {
  const feed = useFeed();

  return createMemo(() => feed.accounts);
}
