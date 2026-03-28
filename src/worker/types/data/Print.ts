import { dictsEqual } from "./List";

export type Print = {
  id       : string,
  owner_id : string,

  status : "pending" | "compiling" | "ready" | "failure" | "error" | "done",

  code_href: string,

  simple_error?: string,
  pdf_href?: string,
  err_href?: string
};

export function printEquals (j1: Print | undefined, j2: Print | undefined) {
  if (j1 === undefined && j2 === undefined) return true;
  if (j1 === undefined || j2 === undefined) return false;

  return j1.code_href == j2.code_href && j1.err_href == j2.err_href && j1.id == j2.id
  && j1.owner_id == j2.owner_id && j1.pdf_href == j2.pdf_href && j1.simple_error == j2.simple_error
  && j1.status == j2.status
}
export function printDictsEquals (j1: {[key: string]: Print }, j2: {[key: string]: Print }) {
  return dictsEqual(j1, j2, printEquals);
}
