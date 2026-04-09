import { dictsEqual } from "./List";

export type Statement = {
  href: string;
  mime: "application/pdf"
};

export type Problem = {
  id    : string;
  label : string;
  name  : string;

  /* Time Limit in seconds */
  time_limit : number;
  /* Memory Limit in MiB */
  memory_limit : number;

  statement : Statement[];
};

export function problemEquals (j1: Problem | undefined, j2: Problem | undefined) {
  if (j1 === undefined && j2 === undefined) return true;
  if (j1 === undefined || j2 === undefined) return false;

  return j1.id == j2.id && j1.label == j2.label && j1.memory_limit == j2.memory_limit
   && j1.name == j2.name && j1.statement == j2.statement && j1.time_limit == j2.time_limit
}
export function problemDictsEquals (j1: {[key: string]: Problem }, j2: {[key: string]: Problem }) {
  return dictsEqual(j1, j2, problemEquals);
}
