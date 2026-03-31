import type dayjs from "dayjs";
import { dictsEqual } from "./List";
import type { Duration } from "dayjs/plugin/duration";
import { parseReltime } from "./DeltaTime";

export type SubmissionJson = {
  id : string;

  language_id : string;
  problem_id  : string;

  account_id ?: string;
  team_id    ?: string;

  contest_time: string;
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

  contest_time : Duration;
  
  status: "starting" | "compiling" | "running" | "finished" | "failed";
};

export function parseSubmission (submission: SubmissionJson): Submission {
  return {
    id : submission.id,

    language_id : submission.language_id,
    problem_id  : submission.problem_id,

    account_id : submission.account_id,
    team_id    : submission.team_id,

    status: "starting",

    contest_time: parseReltime(submission.contest_time)
   };
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
