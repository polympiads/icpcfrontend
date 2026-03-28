
import { BASE_URL } from "./Constants";
import { API_ROOT, PRINTS_URL } from "./Urls";

export async function postPrint(contest_id: string, code: string, session: string) {
  const url = new URL(API_ROOT + PRINTS_URL(contest_id), BASE_URL)
  
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

/*export async function getSubmissionCode(session: string | undefined, contest: Contest, submission: Submission) {
  let headers = undefined
  if (session) {
    headers = {
      'X-Session-Id': session
    }
  }
  
  return await fetch(API_ROOT + SUBMISSION_CODE_URL(contest.id, submission.id), { headers })
    .then(response => response.text())
}*/
