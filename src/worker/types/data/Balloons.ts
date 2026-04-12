import { dictsEqual } from "./List";

export type Balloon = {
  id: string;
  problem_id: string;
  account_id: string;

  status: "pending" | "taken" | "dropped";
};

export function balloonEquals(
  j1: Balloon | undefined,
  j2: Balloon | undefined,
) {
  if (j1 === undefined && j2 === undefined) return true;
  if (j1 === undefined || j2 === undefined) return false;

  return (
    j1.id == j2.id &&
    j1.account_id == j2.account_id &&
    j1.problem_id == j2.problem_id &&
    j1.status == j2.status
  );
}
export function balloonDictsEquals(
  j1: { [key: string]: Balloon },
  j2: { [key: string]: Balloon },
) {
  return dictsEqual(j1, j2, balloonEquals);
}
