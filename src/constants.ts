export const BASE_URL: string = `${window.location.protocol}/localhost/`
export const API_ROOT = "/api"

export const CONTEST_URL = (id: string) => "/contests/" + id + "/"

export const SUBMISSIONS_URL = (contestId: string) =>
  CONTEST_URL(contestId) + "submissions/"
