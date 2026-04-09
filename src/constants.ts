export const API_HOSTNAME: string = `${window.location.protocol}/localhost/`

export const ROOT_URL = "/"

export const CONTEST_URL_PATTERN = "/contests/:id/"
export const CONTEST_URL = (id: string) => `/contests/${id}/`

export const SUBMISSION_URL_PATTERN = `${CONTEST_URL_PATTERN}submissions/:submission_id`

export const PRINTS_URL_PATTERN = `${CONTEST_URL_PATTERN}prints/`
export const PRINT_URL_PATTERN = `${PRINTS_URL_PATTERN}:print_id/`

export const PRINTS_URL = (contestId: string) =>
  `${CONTEST_URL(contestId)}prints/`
export const PRINT_URL = (contestId: string, printId: string) =>
  `${PRINTS_URL(contestId) + printId}/`

export const PRINT_DONE_URL = (contestId: string, printId: string) =>
  `${PRINT_URL(contestId, printId)}done/`

export const SUBMISSIONS_URL = (contestId: string) =>
  `${CONTEST_URL(contestId)}submissions/`
export const SUBMISSION_URL = (contestId: string, submissionId: string) =>
  `${SUBMISSIONS_URL(contestId) + submissionId}/`
export const SUBMISSION_CODE_URL = (contestId: string, submissionId: string) =>
  `${SUBMISSION_URL(contestId, submissionId)}code/`

export const API_ROOT = "/api"