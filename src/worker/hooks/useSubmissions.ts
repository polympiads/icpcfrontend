import { useFeed } from "../context/FeedContext";

export function useSubmissions () {
  const feed = useFeed();

  return () => feed.submissions;
}
export function useSubmission (submissionId: string) {
  const feed = useFeed();

  return () => feed.submissions[submissionId];
}
