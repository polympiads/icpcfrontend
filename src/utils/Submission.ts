import type { Contest } from "../worker/types/data/Contest";
import type { Submission } from "../worker/types/data/Submission";
import { BASE_URL } from "./Constants";
import { API_ROOT, SUBMISSION_CODE_URL, SUBMISSIONS_URL } from "./Urls";

export async function postSubmission(contest_id: string, code: string, problem_id: string, language_id: string, session: string) {
  const url = new URL(API_ROOT + SUBMISSIONS_URL(contest_id), BASE_URL)
  url.searchParams.append('language_id', language_id)
  url.searchParams.append('problem_id', problem_id)
  
  const formData = new FormData()
  const codeBlob = new Blob([code], { type: 'text/plain' })
  formData.append('file', codeBlob)
  
  return await fetch(url.toString(), {
    method: "POST",
    body: formData,
    headers: {
      'X-Session-Id': session
    }
  })
}

export async function getSubmissionCode(session: string | undefined, contest: Contest, submission: Submission) {
  let headers = undefined
  if (session) {
    headers = {
      'X-Session-Id': session
    }
  }
  
  return await fetch(API_ROOT + SUBMISSION_CODE_URL(contest.id, submission.id), { headers })
    .then(response => response.text())
}
