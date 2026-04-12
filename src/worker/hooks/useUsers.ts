import { createMemo } from "solid-js";
import { useAuth } from "../context/AuthContext";
import { useFeed } from "../context/FeedContext";
import {
  type Account,
  accountDictsEquals,
  accountEquals,
  teamDictsEquals,
  teamEquals,
} from "../types/data/Users";

export function useTeams() {
  const feed = useFeed();

  return createMemo(
    () => {
      return feed().teams;
    },
    undefined,
    {
      equals: teamDictsEquals,
    },
  );
}
export function useTeam(teamId: string) {
  const feed = useFeed();

  return createMemo(
    () => {
      return feed().teams[teamId];
    },
    undefined,
    {
      equals: teamEquals,
    },
  );
}

export function useAccounts() {
  const feed = useFeed();

  return createMemo(
    () => {
      return feed().accounts;
    },
    undefined,
    {
      equals: accountDictsEquals,
    },
  );
}
export function useAccount(accountId: string) {
  const feed = useFeed();

  return createMemo(
    () => {
      return feed().accounts[accountId];
    },
    undefined,
    {
      equals: accountEquals,
    },
  );
}

export function useMyAccount() {
  const { whoami } = useAuth();
  const feed = useFeed();

  return createMemo<Account | undefined>(
    () => {
      const _whoami = whoami();
      console.log("I AM", _whoami);
      if (!_whoami.is_authenticated) {
        return undefined;
      }

      console.log("ALL ACCOUNTS", feed().accounts);

      return feed().accounts[_whoami.id];
    },
    undefined,
    { equals: accountEquals },
  );
}
