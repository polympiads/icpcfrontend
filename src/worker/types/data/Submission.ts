import { dictsEqual } from "./List";

export type SubmissionJson = {
  id : string;

  language_id : string;
  problem_id  : string;

  account_id ?: string;
  team_id    ?: string;
};

export type SubmissionStateJson = {
  submission_id: string;
  status: "starting" | "compiling" | "running" | "finished" | "failed";
};

export type JudgementJson = {
  id: string;
  submission_id: string;
  judgement_type_id: string;
};

export type Submission = {
  id : string;

  language_id : string;
  problem_id  : string;

  account_id ?: string;
  team_id    ?: string;

  judgement_type_id ?: string; 
  
  status: "starting" | "compiling" | "running" | "finished" | "failed";
};

export function parseSubmission (submission: SubmissionJson): Submission {
  return { ...submission, status: "starting" };
}

export function submissionEquals (
  s1 : Submission | undefined, s2 : Submission | undefined
) {
  // console.log("TEST EQUALITY", s1, s2)
  if (s1 === undefined && s2 === undefined) return true;
  if (s1 === undefined || s2 === undefined) return false;

  return s1.id == s2.id
      && s1.account_id == s2.account_id
      && s1.judgement_type_id == s2.judgement_type_id
      && s1.language_id == s2.language_id
      && s1.problem_id == s2.problem_id
      && s1.status == s2.status
      && s1.team_id == s2.team_id;
}
export function submissionListEquals (
  s1 : { [key: string]: Submission },
  s2 : { [key: string]: Submission }
) {
  return dictsEqual(s1, s2, submissionEquals);
}
