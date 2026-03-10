
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
