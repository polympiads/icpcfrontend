import { createMemo } from "solid-js";
import { useFeed } from "../context/FeedContext";
import { accountDictsEquals, accountEquals, teamDictsEquals, teamEquals } from "../types/data/Users";

export function useTeams () {
  const feed = useFeed();

  return createMemo(() => {
    return feed().teams
  }, undefined, {
    equals: teamDictsEquals
  });
}
export function useTeam (teamId: string) {
  const feed = useFeed();

  return createMemo(() => {
    return feed().teams[teamId]
  }, undefined, {
    equals: teamEquals
  });
}

export function useAccounts () {
  const feed = useFeed();

  return createMemo(() => {
    return feed().accounts
  }, undefined, {
    equals: accountDictsEquals
  });
}
export function useAccount (accountId: string) {
  const feed = useFeed();

  return createMemo(() => {
    return feed().accounts[accountId]
  }, undefined, {
    equals: accountEquals
  });
}
