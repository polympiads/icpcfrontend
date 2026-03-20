import { useFeed } from "../context/FeedContext";

export function useTeams () {
  const feed = useFeed();

  return () => feed.teams;
}
export function useAccounts () {
  const feed = useFeed();

  return () => feed.accounts;
}
