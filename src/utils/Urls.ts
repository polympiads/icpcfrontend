export const ROOT = "/"

export const CONTEST_URL_PATTERN = "/contests/:id/"
export const CONTEST_URL = (id: string) => "/contests/" + id + "/"

export const SUBMISSION_URL_PATTERN = CONTEST_URL_PATTERN + "submissions/:submission_id"
export const SUBMISSIONS_URL = (contestId: string) =>
  CONTEST_URL(contestId) + "submissions/"
export const SUBMISSION_URL = (contestId: string, submissionId: string) =>
  SUBMISSIONS_URL(contestId) + submissionId + "/"
export const SUBMISSION_CODE_URL = (contestId: string, submissionId: string) =>
  SUBMISSION_URL(contestId, submissionId) + "code/"

export const API_ROOT = "/api"