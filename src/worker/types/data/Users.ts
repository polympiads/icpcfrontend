import { dictsEqual } from "./List";

export type Account = {
  id : string;
  name : string;
  type : "team" | "judge";
};

export type Team = {
  /* Id of the account */
  id : string;
  name : string;
  display_name ?: string;
};


export function accountEquals (j1: Account | undefined, j2: Account | undefined) {
  if (j1 === undefined && j2 === undefined) return true;
  if (j1 === undefined || j2 === undefined) return false;

  return j1.id == j2.id && j1.name == j2.name && j1.type == j2.type;
}
export function accountDictsEquals (j1: {[key: string]: Account }, j2: {[key: string]: Account }) {
  return dictsEqual(j1, j2, accountEquals);
}


export function teamEquals (j1: Team | undefined, j2: Team | undefined) {
  if (j1 === undefined && j2 === undefined) return true;
  if (j1 === undefined || j2 === undefined) return false;

  return j1.display_name == j2.display_name && j1.name == j2.name && j1.id == j2.id;
}
export function teamDictsEquals (j1: {[key: string]: Team }, j2: {[key: string]: Team }) {
  return dictsEqual(j1, j2, teamEquals);
}
